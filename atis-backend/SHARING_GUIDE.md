# How to Share ATIS HTML Files with Your Group

## Option 1: OneDrive Sharing (Easiest - Recommended) ✅

Since your files are already in OneDrive, you can share them directly:

1. **Right-click** on the HTML file in File Explorer
2. Select **"Share"** or **"Copy link"**
3. Choose sharing permissions:
   - **"Anyone with the link"** - for easy access
   - **"People in your organization"** - if all group members are in same org
   - **"Specific people"** - add group member emails
4. Copy the link and send it to your group
5. When they open the link, they can view the HTML directly in their browser

**File Location:**
```
C:\Users\mdvec\OneDrive\Documents\YOOBEE-MSE\TERM2\MSE806 Intelligent Transportation Systems\ATIS\ATIS\atis-backend\ATIS_INFORMATION.html
```

## Option 2: Run a Local Web Server

If you want to host it locally and share via your network:

### Using Python (if installed):
```powershell
cd "C:\Users\mdvec\OneDrive\Documents\YOOBEE-MSE\TERM2\MSE806 Intelligent Transportation Systems\ATIS\ATIS\atis-backend"
python -m http.server 8000
```

Then share: `http://YOUR_IP_ADDRESS:8000/ATIS_INFORMATION.html`

### Using Node.js (if installed):
```powershell
npx http-server atis-backend -p 8000
```

## Option 3: Upload to GitHub Pages (Free Hosting)

1. Create a GitHub repository
2. Upload the HTML files
3. Enable GitHub Pages in repository settings
4. Share the public URL (e.g., `https://yourusername.github.io/repo-name/ATIS_INFORMATION.html`)

## Option 4: Use a File Sharing Service

- **Google Drive**: Upload and share link
- **Dropbox**: Upload and share link
- **WeTransfer**: For one-time sharing

## Option 5: Email the Files

Simply attach the HTML files to an email. Recipients can open them directly in their browser.

---

## Quick OneDrive Sharing Steps:

1. Open File Explorer
2. Navigate to: `OneDrive\Documents\YOOBEE-MSE\TERM2\MSE806 Intelligent Transportation Systems\ATIS\ATIS\atis-backend`
3. Right-click `ATIS_INFORMATION.html`
4. Click **"Share"**
5. Click **"Copy link"** or **"Share with specific people"**
6. Send the link to your group!

**Note:** Make sure the file permissions allow viewing. OneDrive will generate a web-viewable link.

