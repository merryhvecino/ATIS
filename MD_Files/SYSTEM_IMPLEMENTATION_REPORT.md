# 🧩 System Implementation Report – ATIS

## Document Meta

- Version: 1.0 (Aligned with current live build; no CO2 content)
- Date: 2025-11-08
- Course: MSE806 – Intelligent Transportation Systems

---

## 1. Objectives and Scope

The implementation goal was to evolve a simple route finder into a complete Advanced Traveler Information System (ATIS) focused on:

- Secure access (JWT with optional TOTP MFA)
-, Explainable route selection via Multi-Criteria Decision Analysis (MCDA)
-, Real-time traveler context (live departures, status, alerts, weather)
-, Spatial grounding through an interactive map (nearby stops, incidents, routing)

The system aims to reduce rider uncertainty at decision time and make trade-offs transparent without overwhelming the user interface.

---

## 2. High-Level Architecture

- Client: React single-page application
- Server: FastAPI (Python) over HTTP/JSON
- Auth: Stateless JWT Bearer tokens; optional TOTP MFA
- Map: Leaflet with React-Leaflet bindings
- Data: Live/simulated feeds for stops, departures, alerts, weather

```
Client (React)
  ├─ Dashboard (departures, status, weather, shortcuts, activity)
  ├─ Planner (MCDA scoring + “Why this route?”)
  ├─ Map (O/D markers, route polyline, nearby stops, traffic/alerts)
  └─ Settings (JWT session, MFA setup/enable/disable/status)

API (FastAPI)
  ├─ Auth: register/login/me, MFA setup/enable/disable/status
  ├─ Plan: itineraries + MCDA scoring
  ├─ Real-time: stops nearby, departures, alerts, weather point
  └─ Utilities: reroute suggestions, (optional) analytics
```

---

## 3. Backend Implementation (FastAPI)

### 3.1 Core Modules

- `main.py`: Route handlers, dependency guards, CORS
- `auth.py`: User store, salted password hash, JWT issue/verify, TOTP MFA (pyotp), QR generation
- `mcda.py`: MCDA scoring for time, cost, comfort, reliability
- `db.py`: Nearby stops using haversine distance; sorted by proximity
- `store.py`: Sample data providers for departures/alerts/weather when real feeds are not present

### 3.2 Authentication & Authorization

- Login/Register → issue signed JWT (HS256) with issuer/exp
- Protected endpoints check `Authorization: Bearer <token>` using a dependency guard
- Optional MFA:
  - Setup: provisioning URI + QR image (data URL)
  - Enable/Disable: verify 6-digit TOTP code
  - Status: return enabled flag

### 3.3 Planning and MCDA

- `POST /plan` returns route alternatives enriched with a composite MCDA score and per-criterion breakdown:
  - Time (duration), Cost (fare), Comfort (transfers/walking), Reliability (proxy)
- “Why this route?” explanation is generated from the breakdown for UI presentation

### 3.4 Real-Time Endpoints

- `GET /stops/nearby?lat&lng&radius` → ranked nearest stops
- `GET /departures?stop_id` → upcoming services for a stop
- `GET /alerts` → traffic/incidents; `GET /weather/point` → short forecast

---

## 4. Frontend Implementation (React)

### 4.1 Views

- Dashboard: Live Departure Board (auto-refresh + manual refresh), transit status, weather, shortcuts, recent activity
- Planner: Alternatives with MCDA scores and criterion breakdown; clear “Why this route?” text
- Map: My Location recenter, O/D markers, route line, nearby stops, traffic/alerts overlay
- Settings: MFA setup (QR), enable/disable, and status; session/logout

### 4.2 State & Persistence

- `localStorage`: token, username, login timestamp
- Token verification gate blocks first render → prevents “blinking”
- Intervals for departures refresh (30s), cleared on unmount

### 4.3 Error Handling & Resilience

- Coordinate validation before rendering markers
- Defensive checks for missing/undefined fields
- Functions used by hooks are declared before use (resolves hoisting issues)
- Consistent loading/empty states across widgets

---

## 5. Data Flows (Typical)

1) Login (optionally with 6-digit TOTP) → receive JWT  
2) Client stores JWT → all protected calls include `Authorization: Bearer <token>`  
3) Dashboard gets user location → `stops/nearby` → per-stop `departures` in parallel  
4) Planner → `plan` → show MCDA scores and breakdown → user selects route  
5) Map displays stops/route/alerts to ground decisions spatially

---

## 6. Security Posture

- JWT with issuer and expiry validated per request
- Optional TOTP MFA (authenticator apps) with QR provisioning
- Password hashing with user-specific salts (demo baseline; compatible with bcrypt/argon2)
- Protected endpoints: stops, departures, plan, reroute, alerts, weather, analytics (if enabled)

---

## 7. Performance Considerations

- Bounded results (top N nearest stops; limited departures per stop)
- Lightweight polling for departures (30s cadence)
- Scoped state to limit re-renders; simple memoization where helpful

---

## 8. Deployment Notes

### 8.1 Development

- API: `python -m uvicorn atis-backend.app.main:app --reload`
- UI: `cd atis-frontend-react && npm start`

### 8.2 Production Recommendations

- Reverse proxy (TLS termination, CORS policy, compression)
- Strong `JWT_SECRET` from environment
- Process manager for API; static asset hosting/CDN for UI

---

## 9. Limitations & Next Steps

- Reliability currently a proxy; integrate historical service performance feeds
- MCDA weights are profile-based; add user-tunable sliders for personalization
- Migrate from polling to push updates (WebSockets/SSE) for lower latency

---

## 10. API Surface (Summary)

- Auth: `POST /auth/register`, `POST /auth/login`, `GET /me`, `POST /auth/verify`  
- MFA: `GET /auth/mfa/setup`, `POST /auth/mfa/enable`, `POST /auth/mfa/disable`, `GET /auth/mfa/status`  
- Planner: `POST /plan`, `POST /routes/suggest`  
- Real-time: `GET /stops/nearby`, `GET /departures`, `GET /alerts`, `GET /weather/point`

---

## 11. How to Export this Report to PDF

- Option A: Open this Markdown in your editor’s preview and “Print to PDF”  
- Option B (Pandoc):

```
pandoc MD_Files/SYSTEM_IMPLEMENTATION_REPORT.md -o System_Implementation_Report.pdf
```

---

## 12. Conclusion

The implemented system is cohesive and production-leaning: secure sign-in (JWT+MFA), explainable MCDA-driven planning, live operational context (departures, alerts, weather), and a clear UI anchored by the map. The platform moves users from “route finding” to confident, real-time decision support.

