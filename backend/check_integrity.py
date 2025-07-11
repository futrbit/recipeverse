import sqlite3

conn = sqlite3.connect('C:/Users/leebu/Desktop/recipeverse/backend/instance/recipeverse.db')
cursor = conn.cursor()
cursor.execute("PRAGMA integrity_check")
result = cursor.fetchall()
print(result)  # Should output [('ok',)]
conn.close()