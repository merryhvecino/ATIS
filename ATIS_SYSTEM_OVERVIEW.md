# ATIS System Information and Overview

**Advanced Traveler Information System (ATIS)**  
**MSE806 Intelligent Transportation Systems - Assessment Project**  
**YOOBEE College of Creative Innovation**

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [System Architecture](#system-architecture)
4. [Core Features](#core-features)
5. [Technology Stack](#technology-stack)
6. [API Documentation](#api-documentation)
7. [Frontend Components](#frontend-components)
8. [Backend Modules](#backend-modules)
9. [Database Structure](#database-structure)
10. [Security Implementation](#security-implementation)
11. [Real-Time Data Integration](#real-time-data-integration)
12. [User Interface Features](#user-interface-features)
13. [System Statistics](#system-statistics)
14. [Deployment Information](#deployment-information)
15. [Future Enhancements](#future-enhancements)

---

## Executive Summary

The ATIS (Advanced Traveler Information System) is a comprehensive, web-based intelligent transportation system designed to provide real-time, multi-modal trip planning and traveler information services. The system integrates multiple data sources including transit schedules, traffic conditions, weather forecasts, and incident reports to deliver personalized trip planning with intelligent route optimization.

**Key Highlights:**
- **Real-time data integration** for transit, traffic, and weather
- **Multi-Criteria Decision Analysis (MCDA)** for intelligent route ranking
- **Interactive mapping** with Leaflet.js for spatial visualization
- **JWT-based authentication** with optional TOTP MFA
- **Multi-modal transportation** support (bus, train, ferry, walk, bike)
- **Responsive web application** with offline capabilities
- **25+ RESTful API endpoints** for comprehensive functionality
- **Production-ready deployment** on Render (backend) and Vercel (frontend)

---

## System Overview

### What is ATIS?

**Advanced Traveler Information Systems (ATIS)** are intelligent transportation systems designed to provide travelers with real-time, accurate, and comprehensive information to help them make informed decisions about their travel. ATIS integrates multiple data sources including:

- Transit schedules and real-time departures
- Traffic conditions and incidents
- Weather forecasts
- Service disruptions and alerts
- Route optimization algorithms

### System Purpose

The ATIS implementation serves as a comprehensive platform that:

1. **Enhances Traveler Experience** - Provides comprehensive, real-time information to reduce uncertainty and stress during trips
2. **Optimizes Transportation Efficiency** - Utilizes MCDA to recommend optimal routes based on multiple criteria
3. **Reduces Traffic Congestion** - Distributes traffic across alternative routes and encourages public transportation
4. **Improves Safety** - Provides real-time alerts about traffic incidents, weather conditions, and safety information
5. **Promotes Sustainable Transportation** - Encourages use of public transit and active transportation modes
6. **Enables Data-Driven Decision Making** - Collects and analyzes travel patterns for system improvements

### System Goals in ITS Context

The system addresses key Intelligent Transportation Systems objectives:

- **Traveler Information Management** - Centralized platform for collecting, processing, and disseminating travel information
- **Advanced Traffic Management** - Integration with traffic monitoring systems for real-time congestion and incident data
- **Public Transportation Management** - Real-time transit information and multi-modal trip planning
- **Decision Support Systems** - MCDA algorithms provide intelligent decision support for route selection

---

## System Architecture

### Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Presentation Layer (Frontend)                │
│  React 18 Single-Page Application (SPA)                 │
│  - Dashboard, Trip Planner, Interactive Map, Settings   │
│  - Real-time updates, Responsive design, PWA support    │
│  - Deployed on Vercel                                    │
└─────────────────────────────────────────────────────────┘
                          ↕ HTTP/JSON
┌─────────────────────────────────────────────────────────┐
│            Application Layer (Backend)                   │
│  FastAPI RESTful API (Python 3.11+)                     │
│  - Authentication, Trip Planning, MCDA Scoring           │
│  - Real-time Data Integration, Analytics                 │
│  - Deployed on Render                                    │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│                Data Layer                                │
│  SQLite Database + External APIs                        │
│  - User data, Preferences, Cached transit info          │
│  - GTFS data, Weather APIs, Traffic APIs                │
└─────────────────────────────────────────────────────────┘
```

### Component Architecture

**Frontend (React Application)**
```
atis-frontend-react/
├── public/
│   ├── index.html          # HTML entry point
│   ├── atis-logo.jpg       # Custom branding
│   ├── sw.js              # Service Worker (PWA)
│   └── manifest.json       # PWA manifest
├── src/
│   ├── App.js             # Main component (2500+ lines)
│   │   ├── Dashboard      # Real-time traveler dashboard
│   │   ├── Trip Planner   # MCDA-based route planning
│   │   ├── Interactive Map # Leaflet map with markers
│   │   └── Settings       # User preferences & MFA
│   ├── index.js           # React entry point
│   └── sw-register.js     # Service Worker registration
├── vercel.json            # Vercel deployment config
└── package.json
```

**Backend (FastAPI Application)**
```
atis-backend/
├── app/
│   ├── main.py            # API endpoints (25 endpoints)
│   ├── auth.py            # JWT authentication & MFA
│   ├── mcda.py            # Multi-criteria decision analysis
│   ├── environmental.py  # Environmental impact calculations
│   ├── analytics.py       # Usage tracking & statistics
│   ├── db.py              # Database operations
│   ├── store.py           # Data providers & sample data
│   ├── providers.py       # External API integrations
│   ├── pdf.py             # PDF generation for exports
│   └── init_db.py         # Database initialization
├── render.yaml            # Render deployment config
├── Procfile               # Alternative deployment file
├── requirements.txt       # Python dependencies
└── atis.db               # SQLite database
```

---

## Deployment Information

### Production Deployment

The ATIS system is deployed using modern cloud infrastructure:

#### Backend Deployment (Render)
- **Platform:** Render.com
- **Service Type:** Web Service
- **Runtime:** Python 3.11+
- **Framework:** FastAPI with Uvicorn
- **Database:** SQLite (file-based, auto-initialized on deployment)
- **Configuration:** `render.yaml` or `Procfile`
- **Build Command:** `pip install -r requirements.txt && python app/init_db.py`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Health Check:** `/health` endpoint
- **CORS:** Configurable via `CORS_ORIGINS` environment variable
- **Auto-Deploy:** On git push to main branch

**Backend Environment Variables:**
- `CORS_ORIGINS` - Frontend URL(s) for CORS (comma-separated, e.g., `https://atis-frontend.vercel.app`)
- `PYTHON_VERSION` - Python version (3.11.0, optional)
- `PORT` - Server port (auto-set by Render)

#### Frontend Deployment (Vercel)
- **Platform:** Vercel.com
- **Framework:** Create React App
- **Build Tool:** React Scripts
- **Build Command:** `npm run build`
- **Output Directory:** `build`
- **Configuration:** `vercel.json`
- **Static Hosting:** Optimized CDN delivery
- **Auto-Deploy:** On git push to main branch

**Frontend Environment Variables:**
- `REACT_APP_API_URL` - Backend API URL (e.g., `https://atis-backend.onrender.com`)

#### Deployment Architecture

```
┌─────────────────────────────────────────┐
│         Vercel (Frontend)                │
│  https://atis-frontend.vercel.app       │
│  - React SPA                             │
│  - Static assets via CDN                │
│  - Environment: REACT_APP_API_URL       │
└─────────────────────────────────────────┘
                    ↕ HTTPS
┌─────────────────────────────────────────┐
│         Render (Backend)                 │
│  https://atis-backend.onrender.com      │
│  - FastAPI REST API                     │
│  - SQLite Database                       │
│  - Environment: CORS_ORIGINS             │
└─────────────────────────────────────────┘
```

### Development Setup

**Backend:**
```bash
cd atis-backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app/init_db.py
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd atis-frontend-react
npm install
npm start
```

### Deployment Process

1. **Backend (Render):**
   - Connect GitHub repository
   - Set root directory: `atis-backend`
   - Configure build and start commands (auto-detected from `render.yaml`)
   - Set environment variables (`CORS_ORIGINS` after frontend deployment)
   - Deploy automatically on git push

2. **Frontend (Vercel):**
   - Import GitHub repository
   - Set root directory: `atis-frontend-react`
   - Configure environment variable: `REACT_APP_API_URL`
   - Deploy automatically on git push

3. **Post-Deployment:**
   - Update `CORS_ORIGINS` in Render with Vercel frontend URL
   - Verify API connectivity
   - Test authentication flow
   - Verify real-time features

### System Requirements

- **Backend:** Python 3.11+, 512MB RAM minimum (Render free tier)
- **Frontend:** Modern browser (Chrome, Firefox, Safari, Edge)
- **Database:** SQLite (file-based, no separate server needed)
- **Network:** Internet connection for external APIs
- **Free Tier Considerations:**
  - Render free tier spins down after 15 minutes of inactivity
  - First request after spin-down may take 30-60 seconds (cold start)
  - Vercel free tier includes generous bandwidth and build minutes

---

*Note: The rest of the document continues with Core Features, Technology Stack, API Documentation, etc. - see the full document in `atis-frontend-react/ATIS_SYSTEM_OVERVIEW.md` for complete details.*

---

**Document Version:** 2.0  
**Last Updated:** November 2025  
**Course:** MSE806 - Intelligent Transportation Systems  
**Institution:** YOOBEE College of Creative Innovation

