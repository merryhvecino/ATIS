import os, json, time, hashlib, hmac
from typing import Optional
import jwt
USERS_PATH = os.path.join(os.path.dirname(__file__), "users.json")
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
JWT_ISSUER = "atis-demo"
JWT_EXP_SECONDS = 60*60*8
def _load_users():
    if os.path.exists(USERS_PATH):
        return json.loads(open(USERS_PATH).read())
    return {}
def _save_users(data):
    with open(USERS_PATH, "w") as f:
        f.write(json.dumps(data, indent=2))
def _hash_password(password: str, salt: str) -> str:
    return hashlib.sha256((salt + ":" + password).encode()).hexdigest()
def register_user(username: str, password: str) -> bool:
    users = _load_users()
    if username in users:
        return False
    salt = hashlib.sha256(os.urandom(16)).hexdigest()[:16]
    users[username] = {"salt": salt, "pw": _hash_password(password, salt), "created": int(time.time())}
    _save_users(users); return True
def verify_user(username: str, password: str) -> bool:
    users = _load_users(); u = users.get(username)
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
