import os, json, time, hashlib, hmac
from typing import Optional, Tuple
import jwt
import pyotp
import qrcode
import io
import base64

USERS_PATH = os.path.join(os.path.dirname(__file__), "users.json")
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
JWT_ISSUER = "atis-demo"
JWT_EXP_SECONDS = 60*60*8

def _load_users():
    if os.path.exists(USERS_PATH):
        return json.loads(open(USERS_PATH).read())
    return {}

def _save_users(data):
    with open(USERS_PATH, "w", encoding="utf-8") as f:
        f.write(json.dumps(data, indent=2))

def _hash_password(password: str, salt: str) -> str:
    return hashlib.sha256((salt + ":" + password).encode()).hexdigest()

def register_user(username: str, password: str) -> bool:
    users = _load_users()
    if username in users:
        return False
    salt = hashlib.sha256(os.urandom(16)).hexdigest()[:16]
    mfa_secret = pyotp.random_base32()  # Generate MFA secret
    users[username] = {
        "salt": salt, 
        "pw": _hash_password(password, salt), 
        "created": int(time.time()),
        "mfa_secret": mfa_secret,
        "mfa_enabled": False  # User must enable it after setup
    }
    _save_users(users)
    return True

def verify_user(username: str, password: str) -> bool:
    users = _load_users()
    u = users.get(username)
    if not u: return False
    return hmac.compare_digest(_hash_password(password, u["salt"]), u["pw"])

def issue_token(username: str) -> str:
    now = int(time.time())
    payload = {"sub": username, "iss": JWT_ISSUER, "iat": now, "exp": now + JWT_EXP_SECONDS}
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"], issuer=JWT_ISSUER)
    except Exception:
        return None

# ========== MFA Functions ==========

def get_mfa_secret(username: str) -> Optional[str]:
    """Get user's MFA secret"""
    users = _load_users()
    u = users.get(username)
    return u.get("mfa_secret") if u else None

def is_mfa_enabled(username: str) -> bool:
    """Check if MFA is enabled for user"""
    users = _load_users()
    u = users.get(username)
    return u.get("mfa_enabled", False) if u else False

def enable_mfa(username: str) -> bool:
    """Enable MFA for user"""
    users = _load_users()
    if username not in users:
        return False
    users[username]["mfa_enabled"] = True
    _save_users(users)
    return True

def disable_mfa(username: str) -> bool:
    """Disable MFA for user"""
    users = _load_users()
    if username not in users:
        return False
    users[username]["mfa_enabled"] = False
    _save_users(users)
    return True

def verify_mfa_code(username: str, code: str) -> bool:
    """Verify MFA code"""
    secret = get_mfa_secret(username)
    if not secret:
        return False
    totp = pyotp.TOTP(secret)
    # Allow 1 period before/after for clock skew (90 second window)
    return totp.verify(code, valid_window=1)

def generate_qr_code(username: str) -> Optional[str]:
    """Generate QR code for MFA setup (returns base64 encoded PNG)"""
    secret = get_mfa_secret(username)
    if not secret:
        return None
    
    # Create provisioning URI
    totp = pyotp.TOTP(secret)
    uri = totp.provisioning_uri(name=username, issuer_name="ATIS Transport")
    
    # Generate QR code
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(uri)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    img_base64 = base64.b64encode(buffer.getvalue()).decode()
    
    return f"data:image/png;base64,{img_base64}"
