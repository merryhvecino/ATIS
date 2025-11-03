# app/db.py
import sqlite3, math, os
DB_PATH = os.path.join(os.path.dirname(__file__), "atis.db")

def connect():
    return sqlite3.connect(DB_PATH)

def haversine(lat1, lon1, lat2, lon2):
    R = 6371000
    from math import radians, sin, cos, atan2, sqrt
    phi1, phi2 = radians(lat1), radians(lat2)
    dphi = radians(lat2 - lat1)
    dl = radians(lon2 - lon1)
    a = sin(dphi/2)**2 + cos(phi1)*cos(phi2)*sin(dl/2)**2
    return 2*R*atan2(sqrt(a), sqrt(1-a))

def query_nearby_stops(lat, lng, radius=900):
    con = connect()
    cur = con.cursor()
    cur.execute("SELECT stop_id, name, lat, lon FROM stops")
    rows = cur.fetchall()
    results = []
    for sid, name, slat, slon in rows:
        d = haversine(lat, lng, slat, slon)
        if d <= radius:
            results.append({"stop_id": sid, "name": name, "lat": slat, "lng": slon, "distance_m": round(d, 1)})
    results.sort(key=lambda x: x["distance_m"])
    con.close()
    return results
