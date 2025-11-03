from fastapi import FastAPI, Response, Header, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Literal
import time, io, os, json

from .pdf import itinerary_pdf
from .providers import Providers
from .store import (nearby_stops, sample_departures, sample_itineraries,
                    sample_weather, sample_traffic, suggest_reroute, sample_alerts)
from .auth import register_user, verify_user, issue_token, decode_token

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
def plan(req: PlanRequest):
    itins = sample_itineraries(
        req.origin, req.destination,
        prefers_fewer_transfers=(req.optimize=="fewest_transfers"),
        optimize=req.optimize,
        max_walk_km=req.max_walk_km,
        avoid_stairs=req.avoid_stairs,
        bike_ok=req.bike_ok,
        modes=req.modes
    )
    return {"itineraries": itins, "context": {"weatherAlert": sample_weather(req.origin)}}

class RerouteRequest(BaseModel):
    current_itinerary: dict
    incidents: Optional[List[dict]] = []

@app.post("/routes/suggest")
def routes_suggest(req: RerouteRequest):
    prov = Providers()
    incidents = prov.incidents() if prov.USE_REAL else (req.incidents or [])
    return {"alternative": suggest_reroute(req.current_itinerary, incidents)}

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
