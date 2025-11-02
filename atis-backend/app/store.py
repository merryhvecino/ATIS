# app/store.py
import math, time, random
from .db import query_nearby_stops

def nearby_stops(lat: float, lng: float, radius: float = 800):
    return query_nearby_stops(lat, lng, radius)

def sample_departures(stop_id: str):
    # Simple fake departures list
    now = int(time.time())
    headways = [2, 5, 9, 12, 15, 20]
    return [{
        "route": f"{random.choice(['NX1','NX2','OUT','INNER'])}",
        "headsign": random.choice(["City", "Albany", "Britomart", "Newmarket"]),
        "departure_in_min": h,
        "realtime": True
    } for h in headways]

def _score_itinerary(base_minutes, transfers, weather_penalty=0):
    # smaller is better
    return base_minutes + transfers*6 + weather_penalty

def sample_itineraries(origin, destination, prefers_fewer_transfers=True):
    # Three dummy options differing by time and transfers
    weather_penalty = 4 if random.random() < 0.3 else 0
    options = [
        {"id": "A", "durationMin": 22, "transfers": 0, "legs": ["Bus NX1", "Walk"], "reliability": 0.84},
        {"id": "B", "durationMin": 28, "transfers": 1, "legs": ["Bus 82", "Train"], "reliability": 0.80},
        {"id": "C", "durationMin": 24, "transfers": 1, "legs": ["Walk", "Train"], "reliability": 0.88},
    ]
    # score and sort
    for o in options:
        o["score"] = _score_itinerary(o["durationMin"], o["transfers"], weather_penalty)
        if prefers_fewer_transfers:
            o["score"] -= (1 - o["transfers"]) * 1.5
    options.sort(key=lambda x: (x["score"], -x["reliability"]))
    return options

def sample_weather(point, raw=False):
    cond = random.choice(["Clear", "Light rain", "Windy", "Overcast"])
    alert = None
    if cond in ("Light rain", "Windy"):
        alert = f"Take a small buffer: {cond.lower()} may slow services."
    data = {"condition": cond, "tempC": 16 + random.randint(-2, 3), "windKph": 8 + random.randint(0,12)}
    return data if raw else (alert or "")

def sample_traffic(bbox: str):
    # Return two fake incidents
    return [
        {"id": "INC-1", "type": "Congestion", "summary": "Heavy traffic near Harbour Bridge", "severity": "moderate"},
        {"id": "INC-2", "type": "Roadworks", "summary": "Lane closure on Fanshawe St", "severity": "low"},
    ]
