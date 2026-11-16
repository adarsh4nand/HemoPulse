import sqlite3
import os

def get_db_connection():
    # Point to the local SQLite file
    db_path = os.path.join(os.path.dirname(__file__), '..', 'hemopulse.db')
    conn = sqlite3.connect(db_path)
    
    # This magic line lets us access columns by name (e.g., row['full_name'])
    conn.row_factory = sqlite3.Row 
    return conn