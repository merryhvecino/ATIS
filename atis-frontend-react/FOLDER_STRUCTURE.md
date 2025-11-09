# ATIS Project Folder Structure

This document describes the organized folder structure for the ATIS deployment-ready project.

```
ATIS/
├── .gitignore                          # Root gitignore
├── README.md                           # Main project README
├── DEPLOYMENT_GUIDE.md                 # Complete deployment guide
├── DEPLOYMENT_READY.md                 # Deployment readiness summary
├── QUICK_DEPLOY.md                     # Quick deployment checklist
│
├── atis-backend/                       # Backend (Render deployment)
│   ├── .gitignore                      # Backend-specific gitignore
│   ├── render.yaml                     # Render deployment config
│   ├── Procfile                        # Alternative deployment file
│   ├── requirements.txt                # Python dependencies
│   ├── ENV_TEMPLATE.md                 # Environment variables guide
│   ├── README.md                       # Backend README
│   │
│   └── app/                           # Application code
│       ├── __init__.py
│       ├── main.py                    # FastAPI app (entry point)
│       ├── auth.py                    # Authentication & MFA
│       ├── db.py                      # Database operations
│       ├── analytics.py               # Analytics tracking
│       ├── environmental.py           # Environmental calculations
│       ├── mcda.py                    # MCDA scoring
│       ├── pdf.py                     # PDF generation
│       ├── providers.py               # External API providers
│       ├── store.py                  # Data store & samples
│       ├── init_db.py                # Database initialization
│       └── *.db, *.json              # (gitignored - not in repo)
│
├── atis-frontend-react/               # Frontend (Vercel deployment)
│   ├── .gitignore                     # Frontend-specific gitignore
│   ├── vercel.json                    # Vercel deployment config
│   ├── package.json                   # Node dependencies
│   ├── package-lock.json              # Locked dependencies
│   ├── ENV_TEMPLATE.md                # Environment variables guide
│   │
│   ├── public/                        # Static assets
│   │   ├── index.html
│   │   ├── manifest.json
│   │   ├── sw.js                      # Service Worker
│   │   └── atis-logo.jpg
│   │
│   ├── src/                           # Source code
│   │   ├── index.js                   # React entry point
│   │   ├── App.js                     # Main component
│   │   └── sw-register.js             # SW registration
│   │
│   └── build/                         # (gitignored - build output)
│
├── atis-docs/                          # Documentation site
│   ├── index.html                     # Main documentation page
│   ├── api-docs.html                  # API documentation
│   ├── ATIS_SYSTEM_OVERVIEW.md        # System overview
│   ├── README.md                      # Docs README
│   └── DEPLOY_TO_RENDER.txt           # Docs deployment guide
│
└── MD_Files/                          # Development documentation
    ├── ASSESSMENT_FEATURES.md
    ├── SYSTEM_IMPLEMENTATION_REPORT.md
    ├── AUTHENTICATION_GUIDE.md
    └── ... (other development docs)
```

## Deployment Structure

### For Render (Backend)
- **Root Directory:** `atis-backend`
- **Entry Point:** `app/main.py`
- **Config:** `render.yaml` or `Procfile`

### For Vercel (Frontend)
- **Root Directory:** `atis-frontend-react`
- **Build Output:** `build/`
- **Config:** `vercel.json`

### For Documentation (Optional)
- **Root Directory:** `atis-docs`
- **Files:** `index.html`, `api-docs.html`

## Files Excluded from Deployment

### Backend (.gitignore)
- `__pycache__/` - Python cache
- `*.db` - Database files
- `.env` - Environment variables
- `venv/` - Virtual environment

### Frontend (.gitignore)
- `node_modules/` - Dependencies
- `build/` - Build output
- `.env` - Environment variables
- `.vercel/` - Vercel cache

## Environment Variables

### Backend (Render)
- `CORS_ORIGINS` - Allowed frontend origins
- `PYTHON_VERSION` - Python version (3.11.0)
- `PORT` - Server port (auto-set by Render)

### Frontend (Vercel)
- `REACT_APP_API_URL` - Backend API URL

See `ENV_TEMPLATE.md` files in each directory for details.

