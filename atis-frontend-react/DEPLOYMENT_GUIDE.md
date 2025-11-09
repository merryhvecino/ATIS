# ATIS Deployment Guide
## Render (Backend) + Vercel (Frontend)

This guide will help you deploy the ATIS system to production.

---

## 📋 Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Render Account** - Sign up at [render.com](https://render.com) (free tier available)
3. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free tier available)
4. **Python 3.11+** - For local testing
5. **Node.js 16+** - For local testing

---

## 🚀 Part 1: Deploy Backend to Render

### Step 1: Prepare Your Repository

Ensure your repository has:
- ✅ `atis-backend/render.yaml` (already created)
- ✅ `atis-backend/requirements.txt`
- ✅ `atis-backend/app/main.py`
- ✅ All backend files in `atis-backend/app/`

### Step 2: Deploy to Render

1. **Go to Render Dashboard**
   - Visit [dashboard.render.com](https://dashboard.render.com)
   - Sign in or create an account

2. **Create New Web Service**
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub repository
   - Select the repository containing your ATIS code

3. **Configure Service Settings**
   - **Name:** `atis-backend` (or your preferred name)
   - **Environment:** `Python 3`
   - **Build Command:** 
     ```bash
     pip install -r requirements.txt && python app/init_db.py
     ```
   - **Start Command:**
     ```bash
     uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Root Directory:** `atis-backend`

4. **Set Environment Variables** (Optional but recommended)
   - Click **"Environment"** tab
   - Add variables:
     - `PYTHON_VERSION` = `3.11.0`
     - `CORS_ORIGINS` = `https://your-vercel-app.vercel.app` (set after frontend deployment)

5. **Deploy**
   - Click **"Create Web Service"**
   - Render will build and deploy your backend
   - Wait for deployment to complete (usually 2-5 minutes)

6. **Get Your Backend URL**
   - Once deployed, you'll get a URL like: `https://atis-backend.onrender.com`
   - **Save this URL** - you'll need it for the frontend!

### Step 3: Test Backend

Visit your backend URL:
- Health check: `https://your-backend.onrender.com/health`
- API docs: `https://your-backend.onrender.com/docs`

---

## 🎨 Part 2: Deploy Frontend to Vercel

### Step 1: Prepare Your Repository

Ensure your repository has:
- ✅ `atis-frontend-react/vercel.json` (already created)
- ✅ `atis-frontend-react/package.json`
- ✅ `atis-frontend-react/src/App.js` (updated to use env variable)

### Step 2: Deploy to Vercel

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign in or create an account

2. **Import Project**
   - Click **"Add New..."** → **"Project"**
   - Import your GitHub repository
   - Select the repository containing your ATIS code

3. **Configure Project Settings**
   - **Framework Preset:** Create React App
   - **Root Directory:** `atis-frontend-react`
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `build` (auto-detected)

4. **Set Environment Variables**
   - Click **"Environment Variables"**
   - Add:
     - **Name:** `REACT_APP_API_URL`
     - **Value:** `https://your-backend.onrender.com` (use your Render backend URL)
     - **Environment:** Production, Preview, Development (check all)

5. **Deploy**
   - Click **"Deploy"**
   - Vercel will build and deploy your frontend
   - Wait for deployment to complete (usually 1-3 minutes)

6. **Get Your Frontend URL**
   - Once deployed, you'll get a URL like: `https://atis-frontend.vercel.app`
   - **Save this URL**

### Step 3: Update Backend CORS (Important!)

1. **Go back to Render Dashboard**
   - Open your backend service
   - Go to **"Environment"** tab

2. **Update CORS_ORIGINS**
   - Update `CORS_ORIGINS` to your Vercel URL:
     ```
     https://your-frontend.vercel.app
     ```
   - Or use multiple origins (comma-separated):
     ```
     https://your-frontend.vercel.app,https://your-frontend-git-main.vercel.app
     ```

3. **Redeploy Backend**
   - Render will automatically redeploy when you save environment variables
   - Wait for redeployment to complete

---

## ✅ Part 3: Verify Deployment

### Test Your Deployed System

1. **Frontend**
   - Visit your Vercel URL
   - Should load the ATIS dashboard

2. **Backend API**
   - Visit `https://your-backend.onrender.com/docs`
   - Should show FastAPI documentation

3. **Integration Test**
   - Try registering a new user on the frontend
   - Try planning a trip
   - Check browser console for any errors

### Common Issues & Solutions

**Issue: CORS errors in browser**
- **Solution:** Make sure `CORS_ORIGINS` in Render includes your Vercel URL
- Check that the URL matches exactly (including https://)

**Issue: API calls failing**
- **Solution:** Verify `REACT_APP_API_URL` in Vercel matches your Render backend URL
- Check that backend is running (visit `/health` endpoint)

**Issue: Build fails on Vercel**
- **Solution:** Check build logs in Vercel dashboard
- Ensure `package.json` has correct build script
- Verify all dependencies are listed

**Issue: Backend crashes on Render**
- **Solution:** Check Render logs
- Verify database initialization runs successfully
- Check that all Python dependencies are in `requirements.txt`

---

## 🔧 Environment Variables Reference

### Backend (Render)

| Variable | Description | Example |
|----------|-------------|---------|
| `CORS_ORIGINS` | Allowed frontend origins (comma-separated) | `https://atis.vercel.app` |
| `PYTHON_VERSION` | Python version | `3.11.0` |
| `PORT` | Server port (auto-set by Render) | `8000` |

### Frontend (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `https://atis-backend.onrender.com` |

---

## 📝 File Structure for Deployment

```
ATIS/
├── atis-backend/
│   ├── render.yaml          ✅ Render configuration
│   ├── requirements.txt     ✅ Python dependencies
│   ├── app/
│   │   ├── main.py         ✅ FastAPI app (updated for CORS)
│   │   ├── auth.py
│   │   ├── db.py
│   │   └── ... (other modules)
│   └── .env.example        ✅ Environment variable template
│
├── atis-frontend-react/
│   ├── vercel.json         ✅ Vercel configuration
│   ├── package.json        ✅ Node dependencies
│   ├── src/
│   │   └── App.js         ✅ Updated to use env variable
│   └── .env.example       ✅ Environment variable template
│
└── DEPLOYMENT_GUIDE.md    ✅ This file
```

---

## 🔄 Updating Deployments

### Update Backend

1. Push changes to GitHub
2. Render automatically detects changes and redeploys
3. Check deployment logs in Render dashboard

### Update Frontend

1. Push changes to GitHub
2. Vercel automatically detects changes and redeploys
3. Check deployment logs in Vercel dashboard

---

## 🎯 Quick Checklist

### Before Deployment
- [ ] Code is pushed to GitHub
- [ ] `render.yaml` exists in `atis-backend/`
- [ ] `vercel.json` exists in `atis-frontend-react/`
- [ ] `App.js` uses `process.env.REACT_APP_API_URL`
- [ ] `main.py` supports `CORS_ORIGINS` environment variable

### Backend Deployment (Render)
- [ ] Service created and connected to GitHub
- [ ] Build command set correctly
- [ ] Start command set correctly
- [ ] Root directory set to `atis-backend`
- [ ] Deployment successful
- [ ] Health check endpoint works (`/health`)

### Frontend Deployment (Vercel)
- [ ] Project imported from GitHub
- [ ] Root directory set to `atis-frontend-react`
- [ ] `REACT_APP_API_URL` environment variable set
- [ ] Build successful
- [ ] Frontend loads correctly

### Post-Deployment
- [ ] Backend CORS updated with frontend URL
- [ ] Frontend can communicate with backend
- [ ] User registration works
- [ ] Trip planning works
- [ ] Map loads correctly

---

## 📞 Support

If you encounter issues:

1. **Check Logs**
   - Render: Service → Logs tab
   - Vercel: Project → Deployments → View Function Logs

2. **Verify Environment Variables**
   - Ensure all variables are set correctly
   - Check for typos in URLs

3. **Test Endpoints**
   - Backend health: `https://your-backend.onrender.com/health`
   - Backend docs: `https://your-backend.onrender.com/docs`

4. **Common Solutions**
   - Clear browser cache
   - Hard refresh (Ctrl+Shift+R)
   - Check browser console for errors

---

## 🎉 Success!

Once deployed, you'll have:
- ✅ Backend API running on Render
- ✅ Frontend app running on Vercel
- ✅ Full ATIS system accessible worldwide
- ✅ Automatic deployments on git push

**Your ATIS system is now live!** 🚀

---

**Last Updated:** November 2025  
**Version:** 1.0

