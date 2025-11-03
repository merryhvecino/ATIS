# app/store.py
import time, random
from .db import query_nearby_stops

def nearby_stops(lat: float, lng: float, radius: float = 800):
    return query_nearby_stops(lat, lng, radius)

def sample_departures(stop_id: str):
    headways = [2, 5, 9, 12, 15, 20]
    return [{
        "route": f"{random.choice(['NX1','NX2','OUT','INNER','WEST','EAST'])}",
        "headsign": random.choice(["City", "Albany", "Britomart", "Newmarket", "Takapuna"]),
        "departure_in_min": h,
        "realtime": True
    } for h in headways]

def _base_options():
    return [
        {"id": "A", "durationMin": 22, "transfers": 0, "walk_km": 0.4, "stairs": False, "modes": ["bus","walk"], "legs": ["Bus NX1", "Walk"], "reliability": 0.84},
        {"id": "B", "durationMin": 28, "transfers": 1, "walk_km": 0.9, "stairs": True,  "modes": ["bus","train","walk"], "legs": ["Bus 82", "Train"], "reliability": 0.90},
        {"id": "C", "durationMin": 24, "transfers": 1, "walk_km": 0.6, "stairs": False, "modes": ["train","walk"], "legs": ["Walk", "Train"], "reliability": 0.88},
        {"id": "D", "durationMin": 26, "transfers": 0, "walk_km": 0.3, "stairs": False, "modes": ["ferry","walk"], "legs": ["Ferry", "Walk"], "reliability": 0.86},
        {"id": "E", "durationMin": 27, "transfers": 0, "walk_km": 1.6, "stairs": False, "modes": ["bike","train"], "legs": ["Bike", "Train"], "reliability": 0.82},
    ]

def _score_option(o, optimize="fastest", prefers_fewer_transfers=True):
    score = o["durationMin"] + o["transfers"] * 6
    if prefers_fewer_transfers:
        score -= (1 - o["transfers"]) * 1.5
    if optimize == "reliable":
        score -= (o["reliability"] - 0.8) * 20
    if optimize == "least_walking":
        score += o["walk_km"] * 4
    return score

def sample_itineraries(origin, destination, prefers_fewer_transfers=True, optimize="fastest",
                       max_walk_km=1.2, avoid_stairs=False, bike_ok=False, modes=None):
    options = _base_options()
    if modes:
        options = [o for o in options if any(m in modes for m in o["modes"])]
    options = [o for o in options if o["walk_km"] <= max_walk_km]
    if avoid_stairs:
        options = [o for o in options if not o["stairs"]]
    if not bike_ok:
        options = [o for o in options if "bike" not in o["modes"]]
    for o in options:
        o["score"] = _score_option(o, optimize=optimize, prefers_fewer_transfers=prefers_fewer_transfers)
    options.sort(key=lambda x: x["score"])
    return options[:3]

def sample_weather(point, raw=False):
    cond = random.choice(["Clear", "Light rain", "Windy", "Overcast"])
    alert = None
    if cond in ("Light rain", "Windy"):
        alert = f"Take a small buffer: {cond.lower()} may slow services."
    data = {"condition": cond, "tempC": 16 + random.randint(-2, 3), "windKph": 8 + random.randint(0,12)}
    return data if raw else (alert or "")

def sample_traffic(bbox: str):
    return [
        {"id": "INC-1", "type": "Congestion", "summary": "Heavy traffic near Harbour Bridge", "severity": "moderate"},
        {"id": "INC-2", "type": "Roadworks", "summary": "Lane closure on Fanshawe St", "severity": "low"},
    ]
