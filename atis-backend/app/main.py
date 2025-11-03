from fastapi import FastAPI, Response, Header, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Literal, Dict
import time, io, os, json

from .pdf import itinerary_pdf
from .providers import Providers
from .store import (nearby_stops, sample_departures, sample_itineraries,
                    sample_weather, sample_traffic, suggest_reroute, sample_alerts)
from .auth import register_user, verify_user, issue_token, decode_token
from .environmental import (calculate_itinerary_emissions, compare_modal_emissions, 
                            calculate_cumulative_impact)
from .mcda import MCDAScorer, create_comparison_chart_data, customize_weights_for_profile
from .analytics import get_analytics

app = FastAPI(title="ATIS Demo API", version="0.8.0")

# Dev CORS (proxy handles most cases, but allow-all keeps it simple for assessment)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def require_auth(authorization: Optional[str] = Header(None)) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split(" ", 1)[1].strip()
    data = decode_token(token)
    if not data:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return data["sub"]

@app.get("/health")
def health():
    return {"status": "ok", "ts": int(time.time())}

# ---------- Auth ----------
class AuthReq(BaseModel):
    username: str
    password: str

@app.post("/auth/register")
def auth_register(req: AuthReq):
    ok = register_user(req.username, req.password)
    if not ok:
        raise HTTPException(400, "Username already exists")
    token = issue_token(req.username)
    return {"token": token, "username": req.username}

@app.post("/auth/login")
def auth_login(req: AuthReq):
    if not verify_user(req.username, req.password):
        raise HTTPException(401, "Invalid credentials")
    token = issue_token(req.username)
    return {"token": token, "username": req.username}

@app.post("/auth/verify")
def auth_verify(authorization: str = Header(None)):
    """Verify if a token is valid"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Invalid authorization header")
    
    token = authorization.replace("Bearer ", "")
    try:
        user = decode_token(token)
        return {"valid": True, "username": user}
    except:
        raise HTTPException(401, "Invalid or expired token")

@app.get("/me")
def me(user: str = Depends(require_auth)):
    return {"username": user}

# ---------- Stops & Departures ----------
@app.get("/stops/nearby")
def stops_nearby(lat: float, lng: float, radius: float = 900):
    return {"stops": nearby_stops(lat, lng, radius)}

@app.get("/departures")
def departures(stop_id: str):
    prov = Providers()
    data = prov.departures(stop_id) if prov.USE_REAL else sample_departures(stop_id)
    return {"stop_id": stop_id, "departures": data}

# ---------- Plan & Reroute ----------
class PlanRequest(BaseModel):
    origin: List[float]
    destination: List[float]
    depart_at: Optional[str] = "now"
    arrive_by: Optional[str] = None
    optimize: Optional[Literal["fastest","fewest_transfers","least_walking","reliable"]] = "fastest"
    max_walk_km: Optional[float] = 1.2
    avoid_stairs: Optional[bool] = False
    bike_ok: Optional[bool] = False
    modes: Optional[List[Literal["bus","train","ferry","walk","bike"]]] = ["bus","train","walk"]

@app.post("/plan")
def plan(req: PlanRequest, user: Optional[str] = None):
    itins = sample_itineraries(
        req.origin, req.destination,
        prefers_fewer_transfers=(req.optimize=="fewest_transfers"),
        optimize=req.optimize,
        max_walk_km=req.max_walk_km,
        avoid_stairs=req.avoid_stairs,
        bike_ok=req.bike_ok,
        modes=req.modes
    )
    
    # Add environmental calculations
    for itin in itins:
        itin['environmental'] = calculate_itinerary_emissions(itin)
    
    # Add MCDA scoring
    mcda = MCDAScorer()
    scored_itins = mcda.score_all_itineraries(itins)
    
    return {
        "itineraries": scored_itins, 
        "context": {"weatherAlert": sample_weather(req.origin)},
        "mcda_chart_data": create_comparison_chart_data(scored_itins)
    }

class RerouteRequest(BaseModel):
    current_itinerary: dict
    incidents: Optional[List[dict]] = []
    origin: Optional[List[float]] = None
    destination: Optional[List[float]] = None
    preferences: Optional[dict] = {}

@app.post("/routes/suggest")
def routes_suggest(req: RerouteRequest):
    prov = Providers()
    incidents = prov.incidents() if prov.USE_REAL else (req.incidents or [])
    alternative = suggest_reroute(req.current_itinerary, incidents)
    
    # Enhance with detailed comparison and recommendations
    current_duration = req.current_itinerary.get('duration', 0)
    alt_duration = alternative.get('duration', current_duration)
    
    current_transfers = req.current_itinerary.get('transfers', 0)
    alt_transfers = alternative.get('transfers', 0)
    
    current_walk = req.current_itinerary.get('walk_distance', 0)
    alt_walk = alternative.get('walk_distance', 0)
    
    benefits = []
    warnings = []
    
    # Analyze benefits
    if alt_duration < current_duration:
        time_saved = (current_duration - alt_duration) / 60
        benefits.append(f"Saves {int(time_saved)} minutes")
    
    if alt_transfers < current_transfers:
        benefits.append(f"Fewer transfers ({alt_transfers} vs {current_transfers})")
    elif alt_transfers == 0:
        benefits.append("Direct route - no transfers needed")
    
    if alt_walk < current_walk:
        benefits.append(f"Less walking ({alt_walk:.1f}km vs {current_walk:.1f}km)")
    
    if len(incidents) > 0:
        benefits.append("Avoids current traffic incidents")
    
    # Analyze warnings
    if alt_duration > current_duration:
        extra_time = (alt_duration - current_duration) / 60
        warnings.append(f"Takes {int(extra_time)} minutes longer")
    
    if alt_transfers > current_transfers:
        warnings.append(f"More transfers required ({alt_transfers})")
    
    if alt_walk > current_walk:
        warnings.append(f"More walking required ({alt_walk:.1f}km)")
    
    # Determine reason
    reason = "Alternative route available"
    if len(incidents) > 0:
        reason = "Avoiding traffic incident"
    elif alt_duration < current_duration and alt_transfers <= current_transfers:
        reason = "Faster route found"
    elif alt_transfers < current_transfers:
        reason = "Route with fewer transfers"
    
    return {
        "alternative": alternative,
        "reason": reason,
        "benefits": benefits,
        "warnings": warnings
    }

# ---------- Alerts & Weather ----------
@app.get("/alerts")
def alerts(bbox: Optional[str] = None):
    prov = Providers()
    traffic = prov.incidents() if prov.USE_REAL else sample_traffic(bbox or '174.70,-36.88,174.80,-36.80')
    return {"alerts": sample_alerts(), "traffic": traffic}

@app.get("/weather/point")
def weather_point(lat: float, lng: float):
    prov = Providers()
    data = prov.weather(lat, lng) if prov.USE_REAL else sample_weather([lat, lng], raw=True)
    return {"lat": lat, "lng": lng, "forecast": data}

# ---------- Safety ----------
@app.get("/safety/contacts")
def safety_contacts():
    return {"contacts": [
        {"name": "Emergency (NZ)", "phone": "111"},
        {"name": "Non-Emergency Police", "phone": "105"},
        {"name": "AT HOP / Transport Info", "phone": "09 366 6400"},
    ]}

# ---------- Reviews (auth to post) ----------
REVIEWS = []

class Review(BaseModel):
    location: str
    rating: int
    comment: str

@app.get("/reviews")
def get_reviews():
    return {"reviews": REVIEWS}

@app.post("/reviews")
def add_review(r: Review, user: str = Depends(require_auth)):
    REVIEWS.append({"ts": int(time.time()), "user": user, **r.dict()})
    return {"ok": True}

# ---------- Preferences (auth) ----------
PREFS_PATH = os.path.join(os.path.dirname(__file__), "prefs.json")

class Prefs(BaseModel):
    lang: str = "en"
    currency: str = "NZD"
    home: Optional[List[float]] = None
    work: Optional[List[float]] = None

@app.get("/prefs")
def get_prefs():
    if os.path.exists(PREFS_PATH):
        return json.loads(open(PREFS_PATH).read())
    return Prefs().dict()

@app.post("/prefs")
def save_prefs(p: Prefs, user: str = Depends(require_auth)):
    data = p.dict(); data["user"] = user
    with open(PREFS_PATH, "w", encoding="utf-8") as f:
        f.write(json.dumps(data, indent=2))
    return {"ok": True}

# ---------- Environmental Analysis ----------
@app.post("/environmental/compare")
def environmental_compare(req: PlanRequest):
    """Compare environmental impact of different routes"""
    itins = sample_itineraries(
        req.origin, req.destination,
        prefers_fewer_transfers=(req.optimize=="fewest_transfers"),
        optimize=req.optimize,
        max_walk_km=req.max_walk_km,
        avoid_stairs=req.avoid_stairs,
        bike_ok=req.bike_ok,
        modes=req.modes
    )
    
    # Add environmental data to each itinerary
    for itin in itins:
        itin['environmental'] = calculate_itinerary_emissions(itin)
    
    comparison = compare_modal_emissions(itins)
    return comparison

@app.get("/environmental/impact")
def environmental_impact():
    """Get cumulative environmental impact from analytics"""
    analytics = get_analytics()
    return analytics.get_environmental_impact()

# ---------- MCDA (Multi-Criteria Decision Analysis) ----------
class MCDARequest(BaseModel):
    itineraries: List[dict]
    weights: Optional[Dict[str, float]] = None
    profile: Optional[str] = None  # 'commuter', 'budget', 'eco', etc.

@app.post("/mcda/score")
def mcda_score(req: MCDARequest):
    """Score itineraries using MCDA with custom weights"""
    weights = req.weights
    
    # Use profile if provided
    if req.profile and not weights:
        weights = customize_weights_for_profile(req.profile)
    
    mcda = MCDAScorer(weights=weights)
    scored = mcda.score_all_itineraries(req.itineraries)
    
    return {
        "scored_itineraries": scored,
        "chart_data": create_comparison_chart_data(scored),
        "weights_used": mcda.weights
    }

@app.get("/mcda/profiles")
def mcda_profiles():
    """Get available MCDA weight profiles"""
    return {
        "profiles": {
            "commuter": customize_weights_for_profile("commuter"),
            "budget": customize_weights_for_profile("budget"),
            "eco": customize_weights_for_profile("eco"),
            "comfort": customize_weights_for_profile("comfort"),
            "reliable": customize_weights_for_profile("reliable"),
            "balanced": customize_weights_for_profile("balanced")
        },
        "criteria": {
            "time": "Trip duration and speed",
            "cost": "Estimated fare",
            "comfort": "Transfers and walking distance",
            "reliability": "On-time performance",
            "environmental": "CO2 emissions"
        }
    }

# ---------- Analytics Dashboard ----------
@app.post("/analytics/track/trip")
def analytics_track_trip(
    origin: List[float],
    destination: List[float],
    itinerary: dict,
    user: str = Depends(require_auth)
):
    """Track a planned trip for analytics"""
    analytics = get_analytics()
    analytics.track_trip_planned(user, origin, destination, itinerary)
    return {"ok": True}

@app.get("/analytics/summary")
def analytics_summary(user: str = Depends(require_auth)):
    """Get summary analytics"""
    analytics = get_analytics()
    return analytics.get_summary_stats()

@app.get("/analytics/routes/popular")
def analytics_popular_routes(limit: int = 10, user: str = Depends(require_auth)):
    """Get most popular routes"""
    analytics = get_analytics()
    return {"popular_routes": analytics.get_popular_routes(limit)}

@app.get("/analytics/usage/heatmap")
def analytics_usage_heatmap(user: str = Depends(require_auth)):
    """Get usage heatmap by hour and day"""
    analytics = get_analytics()
    return {"heatmap": analytics.get_hourly_usage_heatmap()}

@app.get("/analytics/modes")
def analytics_modes(user: str = Depends(require_auth)):
    """Get transport mode usage statistics"""
    analytics = get_analytics()
    return analytics.get_mode_popularity()

@app.get("/analytics/leaderboard")
def analytics_leaderboard(metric: str = "trips", limit: int = 10, user: str = Depends(require_auth)):
    """Get user leaderboard by metric"""
    analytics = get_analytics()
    return {"leaderboard": analytics.get_user_leaderboard(metric, limit)}

@app.get("/analytics/performance")
def analytics_performance(user: str = Depends(require_auth)):
    """Get system performance metrics"""
    analytics = get_analytics()
    return analytics.get_performance_metrics()

# ---------- PDF ----------
class ExportRequest(BaseModel):
    origin: List[float]
    destination: List[float]
    itinerary: dict

@app.post("/export/itinerary")
def export_itinerary(req: ExportRequest):
    buf = io.BytesIO()
    itinerary_pdf(buf, req.origin, req.destination, req.itinerary)
    pdf_bytes = buf.getvalue()
    headers = {"Content-Disposition": "attachment; filename=atis_trip.pdf"}
    return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)
