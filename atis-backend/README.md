# ATIS Backend (FastAPI)

Simple aggregation API for an Advanced Traveler Information System (ATIS) demo.

## Quick start
```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate

pip install -r requirements.txt

# (Optional) create .env from example
cp .env.example .env

# Initialize SQLite with sample data
python app/init_db.py

# Run API
uvicorn app.main:app --reload --port 8000
```

Open API docs: http://localhost:8000/docs
