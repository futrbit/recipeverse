import sqlite3

# Connect to the database
conn = sqlite3.connect('recipeverse.db')
cursor = conn.cursor()

# Add the credits column
try:
    cursor.execute("ALTER TABLE user ADD COLUMN credits INTEGER DEFAULT 7;")
    conn.commit()
    print("Successfully added 'credits' column to user table.")
except sqlite3.OperationalError as e:
    print(f"Error: {e}")
    if "duplicate column name" in str(e):
        print("The 'credits' column already exists.")
finally:
    conn.close()