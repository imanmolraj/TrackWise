from datetime import datetime, timedelta
import sqlite3, hashlib, os
from flask import Flask, request, jsonify, g
from flask_cors import CORS
import jwt
SECRET_KEY = os.environ.get("TRACKWISE_SECRET", "dev-secret-change-me")
DATABASE = os.environ.get("TRACKWISE_DB", "trackwise.db")
JWT_ALG = "HS256"; TOKEN_TTL_MIN = 60*24
app = Flask(__name__); CORS(app, supports_credentials=True)
def get_db():
    db = getattr(g, "_db", None)
    if db is None:
        db = g._db = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
    return db
@app.teardown_appcontext
def close_db(exc):
    db = getattr(g, "_db", None)
    if db is not None: db.close()
def init_db():
    db = get_db()
    with app.open_resource("schema.sql") as f:
        db.executescript(f.read().decode("utf-8"))
    db.commit()
def hash_pw(pw:str)->str: return hashlib.sha256(pw.encode("utf-8")).hexdigest()
def create_token(uid:int,email:str):
    payload = {"sub": uid, "email": email, "exp": datetime.utcnow()+timedelta(minutes=TOKEN_TTL_MIN), "iat": datetime.utcnow()}
    return jwt.encode(payload, SECRET_KEY, algorithm=JWT_ALG)
def require_auth(func):
    from functools import wraps
    @wraps(func)
    def wrapper(*a, **kw):
        auth = request.headers.get("Authorization","")
        token = auth.split("Bearer ")
        token = token[1] if len(token)==2 else None
        if not token: return jsonify({"error":"Missing token"}), 401
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALG])
            request.user_id = int(payload["sub"])
        except Exception:
            return jsonify({"error":"Invalid token"}), 401
        return func(*a, **kw)
    return wrapper
@app.route("/api/health")
def health(): return {"ok": True, "time": datetime.utcnow().isoformat()}
@app.route("/api/init", methods=["POST"])
def api_init(): init_db(); return {"ok": True}
@app.route("/api/register", methods=["POST"])
def register():
    d = request.get_json(force=True); name=d.get("name","").strip(); email=d.get("email","").strip().lower(); pw=d.get("password","")
    if not (name and email and pw): return {"error":"name, email, password required"}, 400
    db=get_db(); r=db.execute("SELECT id FROM users WHERE email=?",(email,)).fetchone()
    if r: return {"error":"Email already registered"}, 409
    db.execute("INSERT INTO users(name,email,password_hash) VALUES(?,?,?)",(name,email,hash_pw(pw))); db.commit()
    uid = db.execute("SELECT id FROM users WHERE email=?",(email,)).fetchone()["id"]
    return {"token": create_token(uid,email), "user": {"id": uid, "name": name, "email": email}}
@app.route("/api/login", methods=["POST"])
def login():
    d = request.get_json(force=True); email=d.get("email","").strip().lower(); pw=d.get("password","")
    if not (email and pw): return {"error":"email and password required"}, 400
    db=get_db(); r=db.execute("SELECT id,name,email,password_hash FROM users WHERE email=?",(email,)).fetchone()
    if not r or r["password_hash"] != hash_pw(pw): return {"error":"Invalid credentials"}, 401
    return {"token": create_token(r["id"], r["email"]), "user": {"id": r["id"], "name": r["name"], "email": r["email"]}}
@app.route("/api/expenses", methods=["GET"])
@require_auth
def list_expenses():
    db=get_db(); rows=db.execute("SELECT id,amount,date,category,description FROM expenses WHERE user_id=? ORDER BY date DESC, id DESC",(request.user_id,)).fetchall()
    return {"items":[dict(x) for x in rows]}
@app.route("/api/expenses", methods=["POST"])
@require_auth
def add_expense():
    d=request.get_json(force=True)
    try: amount=float(d.get("amount",0))
    except Exception: return {"error":"amount must be a number"}, 400
    date=d.get("date") or datetime.utcnow().date().isoformat()
    cat=(d.get("category") or "Other").strip(); desc=(d.get("description") or "").strip()
    if amount<=0: return {"error":"amount must be > 0"}, 400
    db=get_db(); db.execute("INSERT INTO expenses(user_id,amount,date,category,description) VALUES(?,?,?,?,?)",(request.user_id,amount,date,cat,desc)); db.commit(); return {"ok":True}
@app.route("/api/expenses/<int:exp_id>", methods=["DELETE"])
@require_auth
def del_exp(exp_id):
    db=get_db(); db.execute("DELETE FROM expenses WHERE id=? AND user_id=?", (exp_id, request.user_id)); db.commit(); return {"ok":True}
@app.route("/api/budgets", methods=["GET"])
@require_auth
def get_budgets():
    db=get_db(); rows=db.execute("SELECT id,category,budget_amount FROM budgets WHERE user_id=?", (request.user_id,)).fetchall()
    return {"items":[dict(x) for x in rows]}
@app.route("/api/budgets", methods=["POST"])
@require_auth
def upsert_budget():
    d=request.get_json(force=True); cat=(d.get("category") or "").strip()
    try: amt=float(d.get("budget_amount",0))
    except Exception: return {"error":"budget_amount must be a number"}, 400
    if not cat or amt<0: return {"error":"valid category and non-negative budget_amount required"}, 400
    db=get_db(); r=db.execute("SELECT id FROM budgets WHERE user_id=? AND category=?", (request.user_id,cat)).fetchone()
    if r: db.execute("UPDATE budgets SET budget_amount=? WHERE id=?", (amt,r["id"]))
    else: db.execute("INSERT INTO budgets(user_id,category,budget_amount) VALUES(?,?,?)", (request.user_id,cat,amt))
    db.commit(); return {"ok":True}
@app.route("/api/overview", methods=["GET"])
@require_auth
def overview():
    db=get_db(); now=datetime.utcnow(); ym=now.strftime("%Y-%m")
    rows=db.execute("SELECT category, SUM(amount) as total FROM expenses WHERE user_id=? AND substr(date,1,7)=? GROUP BY category",(request.user_id,ym)).fetchall()
    by_cat={r["category"]: r["total"] for r in rows}
    rows=db.execute("SELECT substr(date,1,7) as ym, SUM(amount) as total FROM expenses WHERE user_id=? GROUP BY ym ORDER BY ym DESC LIMIT 6",(request.user_id,)).fetchall()
    trend=[{"month":r["ym"],"total":r["total"]} for r in rows][::-1]
    rows=db.execute("SELECT b.category,b.budget_amount,COALESCE(SUM(e.amount),0) as actual FROM budgets b LEFT JOIN expenses e ON b.user_id=e.user_id AND b.category=e.category AND substr(e.date,1,7)=? WHERE b.user_id=? GROUP BY b.category,b.budget_amount",(ym,request.user_id)).fetchall()
    budget_vs=[dict(r) for r in rows]
    return {"by_category":by_cat,"trend":trend,"budget_vs":budget_vs,"month":ym}
if __name__ == "__main__":
    if not os.path.exists(DATABASE):
        with app.app_context(): init_db()
    app.run(host="0.0.0.0", port=5000, debug=True)
