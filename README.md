# 🚀 ATIS - Advanced Traveler Information System

**MSE806 Intelligent Transportation Systems - Assessment Project**

A comprehensive, real-time transportation planning system with advanced analytics, environmental impact analysis, and multi-criteria decision support.

---

## 🎓 Assessment Features (NEW!)

### Three Major Features for Academic Evaluation:

1. **🌱 Carbon Footprint Calculator**
   - Real-time CO₂ emission calculations
   - Modal comparison analysis
   - Environmental impact visualization
   - Tree equivalent metrics

2. **🏆 Multi-Criteria Decision Analysis (MCDA)**
   - Intelligent route scoring (0-100)
   - 5 criteria: Time, Cost, Comfort, Reliability, Environmental
   - Customizable weight profiles
   - AI-powered recommendations

3. **📊 Analytics Dashboard**
   - System usage tracking
   - Performance metrics
   - Environmental impact summaries
   - Research-ready data collection

**📖 Full Documentation:** See `ASSESSMENT_FEATURES.md` for complete technical details.

---

## ✨ Core Features

### 🗺️ Interactive Map & Trip Planning
- Leaflet-based interactive map
- Draggable origin marker
- Multi-modal route planning (bus/train/ferry/walk/bike)
- Real-time nearby stops display
- Optimization options: fastest, fewest transfers, most reliable

### 📍 Enhanced Location Search
- Geographic filtering (Auckland region)
- Type-specific icons (🏛️ 🏢 🚉 🎯 🏪)
- Suburb badges with color coding
- Detailed address display
- Smart result sorting

### 🔄 Dynamic Rerouting
- Alternative route suggestions
- Incident-aware recommendations
- Detailed comparison metrics
- Benefits and warnings analysis

### ⚠️ Real-Time Alerts
- Traffic incidents (accidents, roadworks)
- Weather alerts (wind, rain warnings)
- Service disruptions
- Safety advisories
- Severity-based filtering

### 🛟 Safety Features
- Emergency contacts (NZ: 111, Police: 105)
- Location sharing (Google Maps URL)
- Copy coordinates function
- Clickable phone numbers

### 📶 Offline Support
- Service Worker caching
- API response caching
- "Save offline snapshot" feature
- Graceful degradation when offline

### 🌍 Multilingual & Currency
- 4 languages: English, Spanish, Tagalog, 中文
- Currency converter (NZD, USD, EUR, AUD)
- Dynamic UI translation

### ⭐ User Reviews & Preferences
- Community feedback system
- 5-star ratings
- Location-based reviews
- Save home/work locations

### 🔐 Authentication System
- JWT token-based auth
- Secure registration/login
- Session persistence
- Password strength validation

### 🧾 Export & Sharing
- PDF export of itineraries
- Route comparison charts
- Analytics data export

---

## 🏗️ Architecture

### Backend (Python + FastAPI)
```
atis-backend/
├── app/
│   ├── main.py              # API endpoints (25 endpoints)
│   ├── environmental.py     # CO₂ calculations [NEW]
│   ├── mcda.py             # Multi-criteria scoring [NEW]
│   ├── analytics.py        # Usage tracking [NEW]
│   ├── auth.py             # JWT authentication
│   ├── db.py               # SQLite connection
│   ├── store.py            # Data providers
│   ├── providers.py        # External APIs
│   └── pdf.py              # PDF generation
├── requirements.txt
└── atis.db                 # SQLite database
```

### Frontend (React 18)
```
atis-frontend-react/
├── public/
│   ├── index.html          # HTML + global CSS
│   ├── atis-logo.jpg       # Custom logo
│   ├── sw.js              # Service worker
│   └── manifest.json       # PWA manifest
├── src/
│   ├── App.js             # Main component (2500+ lines)
│   ├── index.js           # Entry point
│   └── sw-register.js     # SW registration
└── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 16+
- npm or yarn

### 1. Backend Setup
```bash
cd atis-backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app/init_db.py
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs on: `http://localhost:8000`  
API docs: `http://localhost:8000/docs`

### 2. Frontend Setup
```bash
cd atis-frontend-react
npm install
npm start
```

Frontend runs on: `http://localhost:3000`

### 3. First Time Use
1. Open `http://localhost:3000`
2. Create an account (registration page)
3. Login with your credentials
4. Start planning trips!

---

## 🧪 Test Assessment Features

### Quick Test (5 minutes)

1. **Carbon Footprint:**
   - Go to "Plan" tab
   - Set origin: "Auckland CBD"
   - Set destination: "Auckland Airport"
   - Click "Find itineraries"
   - Expand any itinerary details
   - View "🌍 Environmental Impact Analysis"

2. **MCDA Scoring:**
   - Same trip as above
   - Check MCDA scores on each route (e.g., "78.5/100")
   - View "🏆 Multi-Criteria Decision Score" breakdown
   - Compare ranks (#1, #2, #3)

3. **Analytics Dashboard:**
   - Click "Analytics" tab in navigation
   - View summary statistics
   - Check environmental impact totals
   - Review MCDA insights

**📖 Detailed Testing Guide:** See `QUICK_START_ASSESSMENT.md`

---

## 📊 API Endpoints

### Core Endpoints
- `GET /health` - Health check
- `POST /plan` - Trip planning (with MCDA & environmental data)
- `POST /routes/suggest` - Alternative routes
- `GET /stops/nearby` - Nearby transit stops
- `GET /departures` - Real-time departures
- `GET /alerts` - Traffic & weather alerts
- `GET /weather/point` - Weather forecast

### Assessment Feature Endpoints [NEW]
- `POST /environmental/compare` - Compare emissions
- `GET /environmental/impact` - Cumulative impact
- `POST /mcda/score` - Score routes
- `GET /mcda/profiles` - Get weight profiles
- `POST /analytics/track/trip` - Track trip
- `GET /analytics/summary` - System statistics
- `GET /analytics/routes/popular` - Popular routes
- `GET /analytics/usage/heatmap` - Usage patterns
- `GET /analytics/modes` - Mode statistics

### Authentication
- `POST /auth/register` - Create account
- `POST /auth/login` - Login
- `POST /auth/verify` - Verify token
- `GET /me` - Get current user

### Other
- `POST /export/itinerary` - Export PDF
- `GET /reviews` - Get reviews
- `POST /reviews` - Add review (auth required)
- `GET /prefs` - Get preferences
- `POST /prefs` - Save preferences (auth required)

---

## 🎯 Key Technologies

- **Backend:** FastAPI, Python 3.11, Uvicorn
- **Frontend:** React 18, Leaflet.js
- **Database:** SQLite3
- **Maps:** OpenStreetMap, Nominatim
- **PDF:** ReportLab
- **Auth:** PyJWT, bcrypt
- **PWA:** Service Workers, Web App Manifest
- **Styling:** CSS-in-JS (inline styles)

---

## 📈 Project Statistics

### Implementation Metrics
| Metric | Value |
|--------|-------|
| **Total Lines of Code** | 3,500+ |
| **Backend Endpoints** | 25 |
| **Frontend Components** | 15+ |
| **Features Implemented** | 20+ |
| **Documentation Pages** | 17 |
| **Development Time** | ~30 hours |

### Feature Coverage
- ✅ Real-time data integration
- ✅ Multi-modal trip planning
- ✅ Interactive mapping
- ✅ User authentication
- ✅ Offline support
- ✅ Environmental analysis [NEW]
- ✅ MCDA optimization [NEW]
- ✅ Analytics dashboard [NEW]
- ✅ PDF export
- ✅ Multilingual support
- ✅ Mobile responsive
- ✅ PWA capabilities

---

## 🎓 Academic Significance

### ITS Concepts Demonstrated

1. **Multi-Modal Integration**
   - Seamless routing across bus/train/ferry/walk/bike
   - Mode-specific optimization strategies

2. **Real-Time Information Systems**
   - Live departures and service alerts
   - Dynamic rerouting based on incidents

3. **Sustainability Metrics** [NEW]
   - Carbon footprint calculations
   - Environmental impact quantification
   - Modal comparison analysis

4. **Multi-Criteria Optimization** [NEW]
   - Weighted scoring across 5 criteria
   - Pareto-optimal route selection
   - User preference customization

5. **Data-Driven Planning** [NEW]
   - Usage analytics tracking
   - Performance monitoring
   - Evidence-based improvements

6. **User-Centric Design**
   - Personalized preferences
   - Accessibility options
   - Multi-language support

---

## 📚 Documentation

### Available Guides

1. **ASSESSMENT_FEATURES.md** - Comprehensive technical documentation
2. **QUICK_START_ASSESSMENT.md** - 5-minute testing guide
3. **ASSESSMENT_IMPLEMENTATION_SUMMARY.md** - Implementation overview
4. **FEATURES.md** - Original features list
5. **ENHANCED_FEATURES.md** - UI enhancement details
6. **DETAILED_ITINERARY_FEATURES.md** - Itinerary display features
7. **AUTHENTICATION_GUIDE.md** - Security implementation
8. **CURRENT_STATUS.md** - System status
9. **BEFORE_AFTER_COMPARISON.md** - UI improvements
10. **LOCATION_SEARCH_FEATURE.md** - Search functionality

---

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check Python version
python --version  # Should be 3.11+

# Reinstall dependencies
pip install -r requirements.txt

# Initialize database
python app/init_db.py
```

### Frontend Won't Start
```bash
# Clear node modules
rm -rf node_modules package-lock.json
npm install

# Clear cache
npm cache clean --force
```

### Features Not Showing
- Hard refresh browser (Ctrl+Shift+R)
- Check browser console for errors
- Verify backend is running on port 8000
- Check if logged in (authentication required)

---

## 🔒 Security Features

- JWT token-based authentication
- Password hashing (SHA256 + salt)
- Token expiration (8 hours)
- Protected API endpoints
- CORS configuration
- Session verification

---

## 📱 Mobile Support

- ✅ Responsive design (mobile-first)
- ✅ Touch-friendly UI elements
- ✅ PWA installable
- ✅ Offline capabilities
- ✅ Optimized for small screens

---

## 🌟 Highlights

### What Makes This Special

1. **Complete ITS Solution** - All major components integrated
2. **Research-Ready** - Analytics for academic evaluation
3. **Production Quality** - Clean code, error handling, documentation
4. **Sustainability Focus** - Environmental impact analysis
5. **Intelligent Optimization** - MCDA-based route ranking
6. **User-Centric** - Personalization and preferences
7. **Modern Stack** - Latest technologies and best practices

---

## 🎯 Assessment Readiness

### ✅ Complete Checklist

- [x] Core functionality working
- [x] Assessment features implemented
- [x] Backend API complete (25 endpoints)
- [x] Frontend fully integrated
- [x] Documentation comprehensive
- [x] Testing scenarios prepared
- [x] Demo-ready
- [x] Screenshots capturable
- [x] Code commented
- [x] Error handling robust

---

## 📞 Support & Contact

For questions or issues:
1. Check documentation files
2. Review browser console
3. Check backend logs
4. Verify API endpoints at `/docs`

---

## 📄 License

Academic Project - MSE806 Intelligent Transportation Systems  
YOOBEE College of Creative Innovation  
November 2025

---

## 🙏 Acknowledgments

- **OpenStreetMap** - Map data and tiles
- **Nominatim** - Geocoding service
- **FastAPI** - Modern Python web framework
- **React** - UI library
- **Leaflet** - Interactive mapping

---

## ⭐ Project Status

**Version:** 2.0  
**Status:** ✅ Complete and Ready for Assessment  
**Last Updated:** November 3, 2025  
**Stability:** Production-Ready  
**Documentation:** Comprehensive  

---

**Made with 💙 for intelligent, sustainable transportation**
