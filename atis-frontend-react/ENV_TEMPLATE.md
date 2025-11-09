# Environment Variables Template

Copy this file to `.env` in the `atis-frontend-react` directory and fill in the values.

## Required Variables

```bash
# Backend API URL
# For local development, leave empty to use proxy (http://localhost:8000)
# For production, set to your Render backend URL
# Example: https://atis-backend.onrender.com
REACT_APP_API_URL=
```

## Local Development

For local development, you can leave `REACT_APP_API_URL` empty. The Create React App proxy will forward requests to `http://localhost:8000` (as configured in `package.json`).

## Production Deployment (Vercel)

Set this in the Vercel dashboard under **Settings → Environment Variables**:
- `REACT_APP_API_URL` - Your Render backend URL (e.g., `https://atis-backend.onrender.com`)

**Important:** 
- Variable name must start with `REACT_APP_` for Create React App to include it in the build
- Set it for all environments (Production, Preview, Development)
- After setting, trigger a new deployment

