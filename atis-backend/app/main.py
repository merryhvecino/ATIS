# app/main.py
from fastapi import FastAPI, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Literal
import time, io, json, os
from .pdf import itinerary_pdf
from .store import (nearby_stops, sample_departures, sample_itineraries,
                    sample_weather, sample_traffic, suggest_reroute, sample_alerts)

app = FastAPI(title="ATIS Demo API", version="0.4.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok", "ts": int(time.time())}

@app.get("/stops/nearby")
def stops_nearby(lat: float, lng: float, radius: float = 900):
    return {"stops": nearby_stops(lat, lng, radius)}

@app.get("/departures")
def departures(stop_id: str):
    return {"stop_id": stop_id, "departures": sample_departures(stop_id)}

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
    return {"alternative": suggest_reroute(req.current_itinerary, req.incidents or [])}

@app.get("/alerts")
def alerts(bbox: Optional[str] = None):
    return {"alerts": sample_alerts(), "traffic": sample_traffic(bbox or '174.70,-36.88,174.80,-36.80')}

@app.get("/weather/point")
def weather_point(lat: float, lng: float):
    return {"lat": lat, "lng": lng, "forecast": sample_weather([lat, lng], raw=True)}

@app.get("/safety/contacts")
def safety_contacts():
    return {"contacts": [
        {"name": "Emergency (NZ)", "phone": "111"},
        {"name": "Non-Emergency Police", "phone": "105"},
        {"name": "AT HOP / Transport Info", "phone": "09 366 6400"},
    ]}

# Simple in-memory reviews (reset on server restart)
REVIEWS = []

class Review(BaseModel):
    location: str
    rating: int
    comment: str

@app.get("/reviews")
def get_reviews():
    return {"reviews": REVIEWS}

@app.post("/reviews")
def add_review(r: Review):
    REVIEWS.append({"ts": int(time.time()), **r.dict()})
    return {"ok": True}

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
def save_prefs(p: Prefs):
    with open(PREFS_PATH, "w") as f:
        f.write(json.dumps(p.dict(), indent=2))
    return {"ok": True}

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
