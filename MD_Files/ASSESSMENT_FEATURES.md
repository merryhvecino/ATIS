# 🎓 Assessment Features Documentation

## MSE806 Intelligent Transportation Systems - ATIS Enhancement

**Last Updated:** November 8, 2025  
**Version:** 2.1 (Aligned with live ATIS build, CO₂ references removed)  
**Student:** MSE Program  
**Course:** MSE806 - Intelligent Transportation Systems

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Feature 1: Multi-Criteria Decision Analysis (MCDA)](#feature-1-multi-criteria-decision-analysis-mcda)
3. [Feature 2: Real-Time Traveler Dashboard & Live Departures](#feature-2-real-time-traveler-dashboard--live-departures)
4. [Feature 3: Interactive Map, Traffic & Nearby Stops](#feature-3-interactive-map-traffic--nearby-stops)
5. [Feature 4: Authentication & Security (JWT + TOTP MFA)](#feature-4-authentication--security-jwt--totp-mfa)
6. [Technical Implementation](#technical-implementation)
7. [System Implementation](#system-implementation)
8. [Testing & Validation](#testing--validation)
9. [Results & Metrics](#results--metrics)
10. [Results and Analysis](#results-and-analysis)
11. [Conclusion](#conclusion)

---

## Overview

The ATIS project evolved from a simple prototype into a fully featured traveler information system. The current build includes:

- 🏆 Route planning with MCDA-based scoring and transparent explanations
- 🚏 Live Departure Board for nearby stops (auto-refresh + manual refresh)
- 🌍 Interactive map with user location, route visualization, traffic overlays, and stop discovery
- 🔐 Authentication with JWT and optional TOTP-based MFA (Google Authenticator)
- 📲 Modern dashboard with metrics, transit status, weather, shortcuts, and recent activity

> Note: All CO₂/“carbon footprint” features have been removed from this assessment document and the UI per request. The MCDA model no longer displays an environmental criterion in the breakdown.

---

## Feature 1: Multi-Criteria Decision Analysis (MCDA)

### Purpose

Provide fair, explainable ranking of route options using multiple practical criteria relevant to travelers.

### Criteria & Default Weights (Aligned to current app)

| Criterion | Weight | Description |
|-----------|--------|-------------|
| **Time** | 40% | Trip duration and speed |
| **Cost** | 25% | Estimated fare |
| **Comfort** | 20% | Transfers and walking effort |
| **Reliability** | 15% | Historical/on-time performance proxy |

### Scoring Methodology

- Normalization to 0–1 for each criterion (min–max, with appropriate inversion for “lower is better” metrics)
- Weighted sum → 0–100 composite score
- Ranked list with breakdown per criterion

### Frontend Experience

- Route cards show the MCDA score badge and “Why this route?” expansion
- Breakdown per criterion with progress bars
- Clear recommendation text for quick decisions

### Screenshots

- trip_planning_results.png — 3 options with MCDA scores visible  
- mcda_breakdown.png — expanded view showing criterion-level scores

---

## Feature 2: Real-Time Traveler Dashboard & Live Departures

### Purpose

Give riders a quick snapshot of what matters now: next services nearby, system status, weather, shortcuts, and activity.

### Capabilities

- Live Departure Board for top nearby stops (auto-refresh every 30s)
- Expandable stop cards with richer details (platform/bay, vehicle type, accessibility, occupancy)
- Manual refresh action + live indicator
- Transit status summary and weather preview

### APIs Used

- `GET /stops/nearby?lat=..&lng=..`  
- `GET /departures?stop_id=..`

---

## Feature 3: Interactive Map, Traffic & Nearby Stops

### Purpose

Help users explore the network, set origins/destinations, visualize routes, and understand live conditions.

### Capabilities

- Map recenter to “My Location”
- Toggle traffic incidents layer
- View nearby stops; click for details
- Drawn routes between origin and destination

### APIs Used

- `GET /alerts` (traffic, alerts feed)  
- `GET /weather/point?lat=..&lng=..`  
- `GET /stops/nearby?lat=..&lng=..`

---

## Feature 4: Authentication & Security (JWT + TOTP MFA)

### What’s Implemented

- Email/username + password login with JWT issuance
- Route protection via Bearer tokens
- Optional TOTP MFA (Google/Microsoft Authenticator, Authy)
- MFA setup flow (QR code), enable/disable with code verification

### Key Endpoints

- `POST /auth/register`, `POST /auth/login`, `POST /auth/verify`, `GET /me`  
- `GET /auth/mfa/setup`, `POST /auth/mfa/enable`, `POST /auth/mfa/disable`, `GET /auth/mfa/status`

---

## Technical Implementation

### Backend Architecture (FastAPI)

```
atis-backend/app/
├── mcda.py              # Multi-criteria scoring
├── auth.py              # Users, JWT, TOTP MFA
├── main.py              # API endpoints
└── providers.py         # (Optional) real-data providers switch
```

### Core Protected APIs (JWT)

- `GET /stops/nearby` • `GET /departures` • `POST /plan` • `POST /routes/suggest`  
- `GET /alerts` • `GET /weather/point` • (plus analytics endpoints if enabled)

### Frontend (React)

- Live dashboard components (departures, status, weather, shortcuts, activity)
- Map (Leaflet) with traffic overlays and location controls
- Planner with MCDA scoring and breakdown
- Settings: MFA management UX (QR code, code verification)

---

## System Implementation

### Runtime, Frameworks, and Libraries

- Backend: Python 3.11, FastAPI, Uvicorn (reload for development)
- Frontend: React 18
- Map: Leaflet + React-Leaflet
- Security: PyJWT (JWT), pyotp (TOTP), qrcode (QR generation)
- Styling: Custom CSS with glassmorphism accents

### Repository Layout

```
ATIS/
├── atis-backend/
│   └── app/
│       ├── main.py          # API endpoints and route protection
│       ├── auth.py          # Users, password hashing, JWT, TOTP
│       ├── mcda.py          # Route scoring (time, cost, comfort, reliability)
│       ├── providers.py     # Optional real-data providers
│       ├── store.py         # Sample data (departures, alerts, weather)
│       └── db.py            # Nearby stops query and haversine distance
└── atis-frontend-react/
    └── src/
        └── App.js           # UI views, dashboard, map, planner, settings
```

### Configuration

- Backend environment variable: `JWT_SECRET` (defaults to a development value)
- CORS: allow-all for development in `main.py`
- Providers: switch inside `main.py` to use real sources if available

### Running Locally

- Backend (from project root):
  - `python -m uvicorn atis-backend.app.main:app --reload`
  - If using conda: `conda run -n <env> python -m uvicorn atis-backend.app.main:app --reload`
- Frontend:
  - `cd atis-frontend-react`
  - `npm install` (first time)
  - `npm start`

### Authentication and Authorization

1. Registration and Login
   - `POST /auth/register` issues JWT
   - `POST /auth/login` verifies credentials (and MFA if enabled), then issues JWT
2. Route Protection
   - Protected routes require `Authorization: Bearer <token>`
3. TOTP MFA (Optional)
   - `GET /auth/mfa/setup` → QR code (data URL) + secret
   - `POST /auth/mfa/enable` with `{ code }`
   - `POST /auth/mfa/disable` with `{ code }`
   - `GET /auth/mfa/status` → enabled flag
   - Frontend Settings page manages setup and status

### Core Data Flows

- Live Departures
  - Client calls `GET /stops/nearby?lat=..&lng=..` using user location
  - Selects nearest stops; calls `GET /departures?stop_id=..` per stop
  - Auto-refresh every 30s; manual refresh button available
  - Expandable cards display platform/bay, vehicle type, accessibility, occupancy
- Planner with MCDA
  - `POST /plan` returns itineraries
  - MCDA scores calculated (time, cost, comfort, reliability) and shown with breakdown
  - “Why this route?” explanation aids decision-making
- Map and Alerts
  - Leaflet map with origin/destination markers and route polyline
  - Traffic/alerts overlay from `GET /alerts`
  - Recenter to “My Location”

### State, Persistence, and Refresh

- Client state managed with React `useState`/`useEffect`
- Token, username, and login timestamp persisted to `localStorage`
- Token verification gate prevents UI flicker on first load
- Intervals are cleaned up on unmount to avoid leaks

### Error Handling and Resilience

- Strict coordinate validation for map markers
+- Defensive checks for missing fields in API responses
+- Functions used by hooks are hoisted or declared before use to avoid runtime errors
+- Stable empty and loading states across widgets

### Security Notes

- Passwords hashed with user-specific salt (demo-ready); can be upgraded to bcrypt/argon2
- JWT (HS256) with issuer and expiration; validated on every protected request
- Optional TOTP MFA increases account security without external services

## System Implementation Report

### Objectives and Scope

The goal was to evolve a basic router into a complete traveler information platform that supports secure access, explainable route selection, and live operational context. Implementation priorities were clarity (explainable MCDA), timeliness (live departures and status), and reliability (stable UI, resilient APIs, guarded rendering).

### Architecture Summary

- React single‑page application consuming a FastAPI backend over HTTP.
- Stateless authentication with JWT; optional TOTP MFA at login for stronger identity assurance.
- Feature modules:
  - Planner + MCDA scoring (time, cost, comfort, reliability)
  - Live Departures and Nearby Stops
  - Interactive Map with traffic/alerts
  - Settings with MFA management

### Backend Implementation (FastAPI)

- Endpoints in `main.py` orchestrate helpers in `mcda.py`, `auth.py`, `store.py`, and `db.py`.
- Authentication:
  - Registration and login issue signed JWTs (HS256) with issuer and expiry.
  - Protected routes use a `require_auth` dependency to verify tokens per request.
  - MFA flow: QR provisioning, enable/disable with code verification, and status.
- Planning and MCDA:
  - `POST /plan` returns itineraries with MCDA composite score and per‑criterion breakdown.
  - Reroute endpoint suggests alternatives when conditions warrant a change.
- Real‑time feeds:
  - `GET /stops/nearby` ranks stops by haversine distance.
  - `GET /departures` returns upcoming services for selected stops.
  - `GET /alerts` aggregates alerts/incidents; `GET /weather/point` returns a concise forecast.

### Frontend Implementation (React)

- Views:
  - Dashboard with Live Departure Board, transit status, weather, shortcuts, recent activity.
  - Planner with MCDA scores and “Why this route?” explanations.
  - Map with location recenter, route visualization, traffic overlay, nearby stops.
  - Settings with MFA setup (QR), enable/disable, and status.
- State and persistence:
  - Token and username stored in `localStorage`.
  - Initial token verification gate prevents flicker.
  - Interval‑based refresh for departures with cleanup on unmount.

### Data Flow (Typical)

1. User logs in; server issues JWT (MFA code required if enabled).
2. Client stores token and calls protected APIs with `Authorization: Bearer <token>`.
3. Dashboard obtains nearby stops using browser location, then fetches departures for top stops.
4. Planner requests itineraries; MCDA scores and breakdown are rendered.
5. Map displays stops, route, and incidents to provide spatial context.

### Error Handling and Resilience

- Coordinate validation before rendering map markers.
- Defensive checks for undefined/missing API fields across widgets.
- Functions referenced by hooks are declared before use to avoid runtime reference errors.
- Consistent loading and empty states for all live components.

### Performance Considerations

- Lightweight polling cadence for departures; intervals cleared on unmount.
- Bounded results (nearest stops, limited departures per stop) to avoid over‑fetch.
- Scoped state to limit re‑renders; simple memoization where helpful.

### Security Posture

- JWT‑protected core endpoints; issuer and expiration validated each call.
- Optional TOTP MFA via authenticator apps; QR provisioning avoids external SMS/email services.
- Passwords hashed with user‑specific salts (demo baseline), compatible with stronger hashers.

### Deployment Notes

- Development:
  - API: `python -m uvicorn atis-backend.app.main:app --reload`
  - UI: `npm start` in `atis-frontend-react`
- Production recommendations:
  - Reverse proxy (TLS termination, CORS, compression)
  - Strong `JWT_SECRET` via environment
  - Process manager for API; static hosting/CDN for UI assets

### Limitations and Next Steps

- Reliability is a proxy signal; integrating historical performance feeds will strengthen confidence.
- MCDA weights are profile‑based; exposing sliders would enable deeper personalization.
- Polling works for demos; push updates (WebSockets/SSE) would reduce latency in busy corridors.

---

## Testing & Validation

### API/Integration

1. Authentication flow  
   - Register → Login → Token persisted → Access protected endpoints
2. MFA flow  
   - Setup (QR) → Verify code → Enable → Login requires code → Disable with code
3. Planner + MCDA  
   - Multiple options scored and ranked; breakdown displayed correctly
4. Live Departures  
   - Nearby stops populated; departures refresh every 30s; manual refresh works
5. Map & Alerts  
   - My Location recenters map; traffic layer toggles; stops clickable

### Frontend UX

- No “blinking” on initial load (token verification gate)
- Clear empty/error states for live data widgets

---

## Results & Metrics

### Implementation Scale

| Metric | Value |
|--------|-------|
| **Total Source** | 3,500+ lines |
| **API Endpoints** | 25+ |
| **Major Features** | MCDA, Live Departures, Map/Traffic, Auth+MFA |
| **Security** | JWT + TOTP MFA |

### Observations

- MCDA improves decision quality by surfacing trade‑offs (time/cost/comfort/reliability) instead of single‑criterion optimization
- Transparent “Why this route?” breakdown improves trust and learnability
- Live Departures and Map context reduce uncertainty and support better choices

---

## Results and Analysis

This project began as a lightweight router and matured into a complete traveler support system. The final build aligns tightly with real rider needs by combining secure access, explainable planning, and live operational context.

First, route planning moved beyond “fastest path” to transparent multi‑criteria scoring. Each alternative is explained across time, cost, comfort, and reliability, with a clear “Why this route?” breakdown. This transparency reduces re‑queries and helps users accept a recommendation quickly because the rationale is visible, not implicit.

Second, real‑time features center the experience on the next actionable choice. The Live Departure Board aggregates nearby stops, refreshes automatically, and offers a manual refresh for control. Expandable cards provide practical details such as platform/bay, vehicle type, accessibility, and occupancy indicators. The map anchors this data spatially with “My Location,” route visualization, traffic overlays, and nearby stop discovery—giving riders situational awareness at a glance.

Third, robustness and security were elevated to production‑friendly practices. JWT protects the main APIs, and optional TOTP MFA strengthens account security without external services. The app eliminates startup flicker by verifying tokens before rendering, validates incoming data to avoid runtime map errors, and balances auto‑refresh intervals for responsiveness without unnecessary load.

Together, these changes shift the product from route finding to decision support. Users receive clear trade‑offs, timely context, and a consistent interface that lowers uncertainty and effort. The system’s architecture and UI now reflect everyday traveler workflows: decide, act, and adapt—confidently.

---

## Conclusion

The ATIS system demonstrates an integrated traveler experience: secure sign‑in (JWT+MFA), transparent MCDA‑driven planning, live operational context (departures, alerts, weather), and a modern dashboard. The document and UI have been updated to remove CO₂/“carbon footprint” content and focus on rider‑centric operational features that are live in the current build.

**Prepared for:** MSE806 Intelligent Transportation Systems Assessment  
**Institution:** YOOBEE College of Creative Innovation  
**Date:** November 8, 2025  
**Status:** ✅ Complete and aligned with current system

