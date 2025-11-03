# ATIS Backend (FastAPI) — v0.4.0

Adds simple endpoints to support core ATIS features:
- /plan (multimodal planning, simple scoring)
- /routes/suggest (dynamic reroute mock)
- /alerts (real-time style incident/weather alerts)
- /safety/contacts (emergency list)
- /reviews (community feedback, in-memory demo)
- /prefs (save user prefs to local JSON file in dev)
- /export/itinerary (PDF)

## Run
```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python app/init_db.py
uvicorn app.main:app --reload --port 8000
```
