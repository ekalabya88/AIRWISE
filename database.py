"""
AirWise Database Module
Manages SQLite database for users, aqi_history, notification_settings, and alert_logs.
"""
import sqlite3
import os
import json
from datetime import datetime

DB_DIR = os.path.join(os.path.dirname(__file__), 'database')
DB_PATH = os.path.join(DB_DIR, 'aqi_history.db')

def init_db():
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Users table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        home_city TEXT DEFAULT 'Bhubaneswar',
        sensitivity_group TEXT DEFAULT 'general',
        alert_threshold TEXT DEFAULT 'moderate',
        notify_enabled INTEGER DEFAULT 1,
        saved_locations TEXT DEFAULT '["Bhubaneswar", "Delhi", "Mumbai"]',
        created_at TEXT NOT NULL
    )
    ''')

    # AQI History table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS aqi_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        city TEXT NOT NULL,
        station_name TEXT,
        aqi INTEGER NOT NULL,
        pm25 REAL,
        pm10 REAL,
        category TEXT NOT NULL,
        recorded_at TEXT NOT NULL
    )
    ''')

    # Notification & Alert logs table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS alert_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        location TEXT NOT NULL,
        aqi INTEGER NOT NULL,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        precautions TEXT NOT NULL,
        read INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')

    conn.commit()
    conn.close()

def get_connection():
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

if __name__ == '__main__':
    init_db()
    print(f"Database initialized successfully at {DB_PATH}")
