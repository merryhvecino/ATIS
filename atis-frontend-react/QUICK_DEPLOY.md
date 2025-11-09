# 🚀 Quick Deployment Checklist

## Backend (Render) - 5 Steps

1. ✅ **Push code to GitHub**
2. ✅ **Go to [render.com](https://render.com) → New Web Service**
3. ✅ **Connect GitHub repo**
4. ✅ **Settings:**
   - Root Directory: `atis-backend`
   - Build: `pip install -r requirements.txt && python app/init_db.py`
   - Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. ✅ **Deploy & copy backend URL** (e.g., `https://atis-backend.onrender.com`)

## Frontend (Vercel) - 5 Steps

1. ✅ **Go to [vercel.com](https://vercel.com) → Add New Project**
2. ✅ **Import GitHub repo**
3. ✅ **Settings:**
   - Root Directory: `atis-frontend-react`
   - Framework: Create React App (auto-detected)
4. ✅ **Environment Variable:**
   - `REACT_APP_API_URL` = `https://your-backend.onrender.com`
5. ✅ **Deploy & copy frontend URL**

## Final Step

1. ✅ **Update Render CORS:**
   - Go to Render → Environment
   - Set `CORS_ORIGINS` = `https://your-frontend.vercel.app`
   - Save (auto-redeploys)

## ✅ Done!

Your ATIS system is now live at:
- Frontend: `https://your-frontend.vercel.app`
- Backend: `https://your-backend.onrender.com`

---

**Full guide:** See `DEPLOYMENT_GUIDE.md` for detailed instructions.

