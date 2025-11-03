# app/main.py
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Literal
import time

from .store import nearby_stops, sample_departures, sample_itineraries, sample_weather, sample_traffic

app = FastAPI(title="ATIS Demo API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok", "ts": int(time.time())}

@app.get("/stops/nearby")
def stops_nearby(lat: float, lng: float, radius: float = 800):
    return {"stops": nearby_stops(lat, lng, radius)}

@app.get("/departures")
def departures(stop_id: str):
    return {"stop_id": stop_id, "departures": sample_departures(stop_id)}

class PlanRequest(BaseModel):
    origin: List[float]
    destination: List[float]
    depart_at: Optional[str] = "now"
    arrive_by: Optional[str] = None
    prefers_fewer_transfers: Optional[bool] = True
    optimize: Optional[Literal["fastest","fewest_transfers","least_walking","reliable"]] = "fastest"
    max_walk_km: Optional[float] = 1.2
    avoid_stairs: Optional[bool] = False
    bike_ok: Optional[bool] = False
    modes: Optional[List[Literal["bus","train","ferry","walk","bike"]]] = ["bus","train","walk"]

@app.post("/plan")
def plan(req: PlanRequest):
    itins = sample_itineraries(
        req.origin, req.destination,
        prefers_fewer_transfers=req.prefers_fewer_transfers,
        optimize=req.optimize,
        max_walk_km=req.max_walk_km,
        avoid_stairs=req.avoid_stairs,
        bike_ok=req.bike_ok,
        modes=req.modes
    )
    return {"itineraries": itins, "context": {"weatherAlert": sample_weather(req.origin)}}

@app.get("/weather/point")
def weather_point(lat: float, lng: float):
    return {"lat": lat, "lng": lng, "forecast": sample_weather([lat, lng], raw=True)}

@app.get("/traffic/incidents")
def traffic_incidents(bbox: str = Query(..., description="minLon,minLat,maxLon,maxLat")):
    return {"bbox": bbox, "incidents": sample_traffic(bbox)}
