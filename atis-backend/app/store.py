import random
from datetime import datetime, timedelta
from .db import query_nearby_stops

def nearby_stops(lat: float, lng: float, radius: float = 900):
    return query_nearby_stops(lat, lng, radius)

def sample_departures(stop_id: str):
    now = datetime.utcnow()
    headways = [2, 5, 9, 12, 15, 20, 25, 30, 35, 40]
    routes = ['NX1', 'NX2', 'OUT', 'INNER', 'WEST', 'EAST', '82', '83', 'LINK']
    destinations = ["City", "Albany", "Britomart", "Newmarket", "Takapuna", "Airport", "Manukau", "Henderson"]
    platforms = ["Platform A", "Platform B", "Bay 1", "Bay 2", "Bay 3", "Stand 4"]
    
    departures = []
    for h in headways:
        route = random.choice(routes)
        is_delayed = random.random() < 0.2  # 20% chance of delay
        delay = random.choice([2, 3, 5, 7]) if is_delayed else 0
        is_accessible = random.random() < 0.85  # 85% of services are accessible
        
        departures.append({
            "route": route,
            "headsign": random.choice(destinations),
            "departure_time": (now + timedelta(minutes=h + delay)).isoformat(),
            "scheduled_time": (now + timedelta(minutes=h)).isoformat(),
            "departure_in_min": h,
            "delay_min": delay,
            "platform": random.choice(platforms),
            "vehicle_type": "Double Decker" if route in ['NX1', 'NX2'] else "Standard Bus",
            "accessible": is_accessible,
            "occupancy": random.choice(["seats_available", "standing_room", "crowded", "many_seats"]),
            "realtime": True,
            "trip_id": f"TRIP-{stop_id}-{h}",
            "service_type": "express" if route.startswith('NX') else "local"
        })
    
    return departures

def _base_options():
    return [
        {"id": "A", "durationMin": 22, "transfers": 0, "walk_km": 0.4, "stairs": False, "modes": ["bus","walk"], "legs": ["Walk to stop", "Bus NX1", "Walk"], "reliability": 0.84},
        {"id": "B", "durationMin": 28, "transfers": 1, "walk_km": 0.9, "stairs": True,  "modes": ["bus","train","walk"], "legs": ["Walk", "Bus 82", "Train", "Walk"], "reliability": 0.90},
        {"id": "C", "durationMin": 24, "transfers": 1, "walk_km": 0.6, "stairs": False, "modes": ["train","walk"], "legs": ["Walk", "Train", "Walk"], "reliability": 0.88},
        {"id": "D", "durationMin": 26, "transfers": 0, "walk_km": 0.3, "stairs": False, "modes": ["ferry","walk"], "legs": ["Walk", "Ferry", "Walk"], "reliability": 0.86},
        {"id": "E", "durationMin": 27, "transfers": 0, "walk_km": 1.6, "stairs": False, "modes": ["bike","train"], "legs": ["Bike", "Train", "Walk"], "reliability": 0.82},
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
    now = datetime.utcnow()
    return [
        {
            "id": "INC-1",
            "type": "accident",
            "summary": "Crash southbound SH1 near Esmonde Rd",
            "severity": "high",
            "start_time": (now - timedelta(minutes=15)).isoformat(),
            "expected_delay_min": 20,
            "location": "SH1 southbound near Esmonde Rd",
            "affected_routes": ["NX1", "NX2", "INN"],
            "advice": "Buses are diverting via Akoranga Dr. Consider transferring to the Northern Express at Akoranga Station."
        },
        {
            "id": "INC-2",
            "type": "roadworks",
            "summary": "Lane closure on Fanshawe St",
            "severity": "moderate",
            "start_time": (now - timedelta(minutes=5)).isoformat(),
            "expected_delay_min": 8,
            "location": "Fanshawe St city-bound",
            "affected_routes": ["82", "83", "Lower Link"],
            "advice": "Expect short delays around Wynyard Quarter. Allow an extra 5 minutes or alight one stop earlier."
        },
    ]

def suggest_reroute(current_itinerary, incidents):
    if any(i.get("severity") == "high" for i in incidents) and "bus" in (current_itinerary.get("modes") or []):
        return {"id": "ALT1", "durationMin": current_itinerary.get("durationMin", 0)+3, "transfers": 1,
                "walk_km": 0.7, "modes": ["walk","train"], "legs": ["Walk", "Train", "Walk"], "note": "Avoids incident area"}
    return {"note": "Current route ok"}

def sample_alerts():
    now = datetime.utcnow()
    return [
        {
            "id": "ALERT-1",
            "type": "weather",
            "title": "Strong winds forecast this afternoon",
            "severity": "warning",
            "start_time": (now + timedelta(hours=1)).isoformat(),
            "end_time": (now + timedelta(hours=4)).isoformat(),
            "location": "Harbour Bridge and CBD waterfront",
            "impact": "Gusts up to 80 km/h may affect double-decker buses and ferry sailings.",
            "affected_modes": ["bus", "ferry"],
            "affected_routes": ["NX1", "NX2", "Birkenhead Ferry"],
            "expected_delay_min": 15,
            "advice": "Allow extra time and consider rail if travelling during the peak wind window."
        },
        {
            "id": "ALERT-2",
            "type": "event",
            "title": "Concert at Spark Arena tonight",
            "severity": "info",
            "start_time": (now + timedelta(hours=5)).isoformat(),
            "end_time": (now + timedelta(hours=9)).isoformat(),
            "location": "Spark Arena & Quay St",
            "impact": "Increased crowd volumes and intermittent road closures around Quay St from 6pm.",
            "affected_modes": ["bus", "car", "rideshare"],
            "affected_routes": ["TMK", "InnerLink", "Train Eastern Line"],
            "advice": "Arrive early, use Britomart Station exits 1 or 3, and plan for a 10 minute walk detour after the event."
        },
        {
            "id": "ALERT-3",
            "type": "service",
            "title": "Track maintenance on Southern Line (Sat 10pm–Sun 6am)",
            "severity": "planned",
            "start_time": (now + timedelta(days=1, hours=10)).isoformat(),
            "end_time": (now + timedelta(days=2, hours=6)).isoformat(),
            "location": "Puhinui ⇄ Papakura",
            "impact": "Rail replacement buses operating every 20 minutes overnight.",
            "affected_modes": ["train", "replacement bus"],
            "affected_routes": ["Southern Line", "Rail replacement bus S1"],
            "expected_delay_min": 25,
            "advice": "Transfer to bus at Puhinui. Allow an extra 25 minutes for late-night travel."
        }
    ]
