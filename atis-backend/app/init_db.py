import sqlite3, os
DB_PATH = os.path.join(os.path.dirname(__file__), "atis.db")

STOPS = [
    ("1001", "Britomart Station", -36.8443, 174.7676),
    ("1002", "Wellesley St East (Uni)", -36.8524, 174.7692),
    ("1003", "SkyCity (Victoria St)", -36.8484, 174.7618),
    ("1004", "Aotea Square", -36.8520, 174.7633),
    ("1005", "Albany Station", -36.7223, 174.7079),
]

def main():
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute("DROP TABLE IF EXISTS stops")
    cur.execute("CREATE TABLE stops (stop_id TEXT PRIMARY KEY, name TEXT, lat REAL, lon REAL)")
    cur.executemany("INSERT INTO stops (stop_id, name, lat, lon) VALUES (?, ?, ?, ?)", STOPS)
    con.commit()
    con.close()
    print(f"Initialized DB at {DB_PATH} with {len(STOPS)} stops.")

if __name__ == "__main__":
    main()
