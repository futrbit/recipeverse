import sqlite3
import os

# Define the database path
database_path = r"C:\Users\leebu\Desktop\recipeverse\backend\database.db"

try:
    # Ensure the directory exists
    os.makedirs(os.path.dirname(database_path), exist_ok=True)
    # Attempt to connect to the database
    conn = sqlite3.connect(database_path)
    print("Connection successful!")
    conn.close()
except sqlite3.OperationalError as e:
    print(f"Error: {e}")