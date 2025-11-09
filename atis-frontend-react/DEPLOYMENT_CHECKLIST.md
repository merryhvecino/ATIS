# ✅ ATIS Deployment Checklist

Use this checklist to ensure your ATIS system is properly organized and ready for deployment.

## 📁 Folder Structure

- [x] `atis-backend/` - Backend code for Render
- [x] `atis-frontend-react/` - Frontend code for Vercel
- [x] `atis-docs/` - Documentation (optional deployment)
- [x] Root deployment guides present

## 🔧 Backend (Render) - `atis-backend/`

### Required Files
- [x] `render.yaml` - Render deployment configuration
- [x] `Procfile` - Alternative deployment file
- [x] `requirements.txt` - All dependencies listed
- [x] `app/main.py` - FastAPI entry point
- [x] `.gitignore` - Excludes cache, db, env files

### Files to Verify
- [x] `app/init_db.py` - Database initialization script
- [x] All Python modules in `app/` directory
- [x] `ENV_TEMPLATE.md` - Environment variables guide

### Files Excluded (via .gitignore)
- [x] `__pycache__/` - Not in repository
- [x] `*.db` - Database files not in repository
- [x] `.env` - Environment variables not in repository
- [x] `venv/` - Virtual environment not in repository

## 🎨 Frontend (Vercel) - `atis-frontend-react/`

### Required Files
- [x] `vercel.json` - Vercel deployment configuration
- [x] `package.json` - Dependencies and scripts
- [x] `package-lock.json` - Locked dependencies
- [x] `src/App.js` - Uses `REACT_APP_API_URL` env variable
- [x] `.gitignore` - Excludes node_modules, build, env files

### Files to Verify
- [x] `public/index.html` - HTML entry point
- [x] `public/manifest.json` - PWA manifest
- [x] `src/index.js` - React entry point
- [x] `ENV_TEMPLATE.md` - Environment variables guide

### Files Excluded (via .gitignore)
- [x] `node_modules/` - Not in repository
- [x] `build/` - Build output not in repository
- [x] `.env` - Environment variables not in repository
- [x] `.vercel/` - Vercel cache not in repository

## 📚 Documentation

- [x] `DEPLOYMENT_GUIDE.md` - Complete deployment guide
- [x] `QUICK_DEPLOY.md` - Quick reference
- [x] `DEPLOYMENT_READY.md` - Summary of changes
- [x] `FOLDER_STRUCTURE.md` - Folder organization guide

## 🔐 Environment Variables Setup

### Before Deploying Backend
- [ ] Generate JWT secret (optional, has default)
- [ ] Plan CORS origins (will set after frontend deployment)

### Before Deploying Frontend
- [ ] Get backend URL from Render
- [ ] Set `REACT_APP_API_URL` in Vercel

### After Both Deployed
- [ ] Update `CORS_ORIGINS` in Render with Vercel URL

## 🚀 Deployment Steps

### Step 1: Push to GitHub
- [ ] All changes committed
- [ ] Code pushed to GitHub repository
- [ ] Repository is public or connected to Render/Vercel

### Step 2: Deploy Backend (Render)
- [ ] Go to render.com
- [ ] Create new Web Service
- [ ] Connect GitHub repository
- [ ] Set root directory: `atis-backend`
- [ ] Verify build command and start command
- [ ] Deploy and wait for success
- [ ] Copy backend URL

### Step 3: Deploy Frontend (Vercel)
- [ ] Go to vercel.com
- [ ] Import GitHub repository
- [ ] Set root directory: `atis-frontend-react`
- [ ] Add environment variable: `REACT_APP_API_URL`
- [ ] Deploy and wait for success
- [ ] Copy frontend URL

### Step 4: Configure CORS
- [ ] Go back to Render dashboard
- [ ] Add/update `CORS_ORIGINS` environment variable
- [ ] Set to your Vercel frontend URL
- [ ] Wait for automatic redeploy

### Step 5: Test Deployment
- [ ] Visit frontend URL
- [ ] Test user registration
- [ ] Test login
- [ ] Test trip planning
- [ ] Test map features
- [ ] Check browser console for errors

## ✅ Final Verification

- [ ] Backend health check works: `/health`
- [ ] Backend API docs accessible: `/docs`
- [ ] Frontend loads without errors
- [ ] Frontend can communicate with backend
- [ ] No CORS errors in browser console
- [ ] Authentication works
- [ ] Trip planning works
- [ ] Map loads correctly

## 📝 Notes

- **Database:** SQLite database will be created automatically on first deployment via `init_db.py`
- **Free Tier Limits:** 
  - Render free tier spins down after 15 minutes of inactivity
  - First request after spin-down may take 30-60 seconds
- **Environment Variables:** Never commit `.env` files to repository
- **Build Times:** 
  - Backend: ~2-5 minutes
  - Frontend: ~1-3 minutes

---

**Status:** ✅ Ready for Deployment

Once all items are checked, you're ready to deploy!

