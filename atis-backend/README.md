# ATIS Backend (FastAPI) — v0.2.0

Adds traveler-friendly planning options (modes, optimize, max walk, etc.).

## Quick start
```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate

pip install -r requirements.txt
python app/init_db.py
uvicorn app.main:app --reload --port 8000
```

Open API docs: http://localhost:8000/docs
