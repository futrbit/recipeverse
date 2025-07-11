import sqlite3

conn = sqlite3.connect('C:/Users/leebu/Desktop/recipeverse/backend/instance/recipeverse.db')
cursor = conn.cursor()
cursor.execute("SELECT * FROM user WHERE google_id = ?", ('104032329201519720434',))
print(cursor.fetchone())
conn.close()