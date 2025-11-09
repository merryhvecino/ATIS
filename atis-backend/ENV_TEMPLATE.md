# Environment Variables Template

Copy this file to `.env` in the `atis-backend` directory and fill in the values.

## Required Variables

```bash
# JWT Secret Key (generate a strong random string)
# Generate with: python -c "import secrets; print(secrets.token_urlsafe(32))"
JWT_SECRET=your-secret-key-here

# CORS Origins (comma-separated URLs, or * for all)
# For production, set to your Vercel frontend URL
# Example: https://atis-frontend.vercel.app
CORS_ORIGINS=*

# Port (Render sets this automatically via $PORT)
PORT=8000

# Environment
ENVIRONMENT=production
```

## Optional Variables

```bash
# Database Path (defaults to app/atis.db)
DATABASE_PATH=app/atis.db

# Python Version (for local development)
PYTHON_VERSION=3.11.0
```

## For Render Deployment

Set these in the Render dashboard under **Environment** tab:
- `CORS_ORIGINS` - Your Vercel frontend URL
- `PYTHON_VERSION` - `3.11.0` (optional, Render auto-detects)

**Note:** Render automatically sets `PORT` - you don't need to set it manually.

