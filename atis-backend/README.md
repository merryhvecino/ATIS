# ATIS Backend

FastAPI backend for the Advanced Traveler Information System.

## 🚀 Quick Start

### Local Development

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python app/init_db.py

# Run server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Server runs on: `http://localhost:8000`  
API docs: `http://localhost:8000/docs`

## 📦 Deployment to Render

This backend is configured for deployment to Render.

### Files for Deployment

- `render.yaml` - Render deployment configuration
- `Procfile` - Alternative deployment file
- `requirements.txt` - Python dependencies
- `app/main.py` - FastAPI application entry point

### Render Settings

- **Root Directory:** `atis-backend`
- **Build Command:** `pip install -r requirements.txt && python app/init_db.py`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Environment:** Python 3.11

### Environment Variables (Render)

Set these in Render dashboard:

- `CORS_ORIGINS` - Frontend URL (e.g., `https://atis-frontend.vercel.app`)
- `PYTHON_VERSION` - `3.11.0` (optional, auto-detected)

## 📚 API Endpoints

- `GET /health` - Health check
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /plan` - Trip planning with MCDA
- `GET /stops/nearby` - Nearby transit stops
- `GET /departures` - Live departures
- `GET /alerts` - Traffic and service alerts
- `GET /weather/point` - Weather forecast

See `/docs` endpoint for interactive API documentation.

## 🔐 Authentication

- JWT-based authentication
- Optional TOTP MFA support
- Token expiration: 8 hours

## 📖 Documentation

- `ENV_TEMPLATE.md` - Environment variables guide
- `RENDER_DEPLOYMENT_GUIDE.md` - Detailed Render deployment guide

## 🛠️ Dependencies

See `requirements.txt` for complete list.

Key dependencies:
- FastAPI - Web framework
- Uvicorn - ASGI server
- PyJWT - JWT authentication
- pyotp - TOTP MFA
- SQLite - Database
