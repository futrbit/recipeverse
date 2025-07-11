import sqlite3
import os

# Paths
db_path = 'C:/Users/leebu/Desktop/recipeverse/backend/instance/recipeverse.db'
dump_path = 'dump.sql'
corrupted_db = db_path + '.corrupted'
new_db = db_path + '.new'

# Ensure dump.sql exists
if not os.path.exists(dump_path):
    print("Error: dump.sql not found. Please ensure it exists or recreate the database.")
    exit(1)

# Move corrupted database
if os.path.exists(db_path) and not os.path.exists(corrupted_db):
    os.rename(db_path, corrupted_db)
    print(f"Moved corrupted database to {corrupted_db}")

# Create new database and import dump
try:
    conn = sqlite3.connect(new_db)
    with open(dump_path, 'r') as f:
        conn.executescript(f.read())
    conn.commit()
    conn.close()
    print(f"Database restored to {new_db}")

    # Replace original database
    os.rename(new_db, db_path)
    print(f"Database moved to {db_path}")
except sqlite3.DatabaseError as e:
    print(f"Error restoring database: {e}")
    exit(1)