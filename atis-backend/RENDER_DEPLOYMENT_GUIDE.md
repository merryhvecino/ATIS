# Deploying ATIS HTML Documentation to Render

## Option 1: Static Site (Recommended for HTML files)

### Step 1: Create a Simple Structure

Create a folder with just your HTML files:
```
atis-docs/
├── index.html (rename ATIS_INFORMATION.html to index.html)
├── api-docs.html (rename API_DOCUMENTATION.html)
└── _redirects (optional, for routing)
```

### Step 2: Deploy to Render

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +"** → **"Static Site"**
3. **Connect your repository** (GitHub/GitLab) OR **Upload files directly**
4. **Settings**:
   - **Name**: `atis-documentation` (or any name)
   - **Build Command**: Leave empty (no build needed for static HTML)
   - **Publish Directory**: `.` (root directory)
   - **Environment**: Static
5. **Click "Create Static Site"**

### Step 3: Access Your Site

Render will give you a URL like:
- `https://atis-documentation.onrender.com` (main page)
- `https://atis-documentation.onrender.com/api-docs.html` (API docs)

---

## Option 2: Simple HTTP Server (Python)

If you want to serve it as a web service:

### Create `render.yaml`:

```yaml
services:
  - type: web
    name: atis-docs
    env: static
    buildCommand: ""
    staticPublishPath: .
```

### Or use Python SimpleHTTPServer:

Create `server.py`:
```python
import http.server
import socketserver
import os

PORT = 8000
DIRECTORY = "."

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at http://localhost:{PORT}")
    httpd.serve_forever()
```

---

## Quick Setup Script

Run this to prepare files for Render:

```powershell
# Create docs folder
mkdir atis-docs
copy atis-backend\ATIS_INFORMATION.html atis-docs\index.html
copy atis-backend\API_DOCUMENTATION.html atis-docs\api-docs.html
```

---

## Files to Upload to Render:

✅ **Required Files:**
- `ATIS_INFORMATION.html` (rename to `index.html` for main page)
- `API_DOCUMENTATION.html` (keep as is or rename to `api-docs.html`)

❌ **Don't upload:**
- Python files (`.py`)
- Database files (`.db`)
- `__pycache__` folders
- `node_modules`
- Other backend files

---

## Render Static Site Settings:

- **Build Command**: (leave empty)
- **Publish Directory**: `.` or `atis-docs` (if you created a subfolder)
- **Environment Variables**: None needed

---

## After Deployment:

Your documentation will be accessible at:
- Main page: `https://your-site.onrender.com/`
- API docs: `https://your-site.onrender.com/api-docs.html`

Share these links with your group! 🎉



