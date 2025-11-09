# ATIS Frontend

React frontend for the Advanced Traveler Information System.

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start
```

App runs on: `http://localhost:3000`

The app uses a proxy to forward API requests to `http://localhost:8000` (backend).

## 📦 Deployment to Vercel

This frontend is configured for deployment to Vercel.

### Files for Deployment

- `vercel.json` - Vercel deployment configuration
- `package.json` - Dependencies and build scripts
- `src/App.js` - Main React component (uses `REACT_APP_API_URL`)

### Vercel Settings

- **Root Directory:** `atis-frontend-react`
- **Framework:** Create React App (auto-detected)
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `build` (auto-detected)

### Environment Variables (Vercel)

Set this in Vercel dashboard:

- `REACT_APP_API_URL` - Backend API URL (e.g., `https://atis-backend.onrender.com`)

**Important:** Variable name must start with `REACT_APP_` for Create React App to include it in the build.

## 🎨 Features

- Interactive map with Leaflet.js
- Real-time trip planning
- Multi-Criteria Decision Analysis (MCDA)
- Live departure board
- Traffic alerts and weather
- User authentication
- Progressive Web App (PWA) support
- Offline capabilities

## 🔧 Configuration

### API URL

The app uses `process.env.REACT_APP_API_URL` for the backend API URL.

- **Local Development:** Leave empty (uses proxy from `package.json`)
- **Production:** Set to your Render backend URL

### Build

```bash
# Create production build
npm run build

# Build output in build/ directory
```

## 📚 Documentation

- `ENV_TEMPLATE.md` - Environment variables guide
- See root `DEPLOYMENT_GUIDE.md` for complete deployment instructions

## 🛠️ Dependencies

See `package.json` for complete list.

Key dependencies:
- React 18 - UI library
- React-Leaflet - Map components
- Leaflet.js - Mapping library

## 📱 PWA Features

- Service Worker for offline support
- Web App Manifest
- Installable on mobile devices

