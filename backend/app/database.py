import os
import logging
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("smartbite_db")

DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "root")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "smartbite_db")

MYSQL_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
SQLITE_URL = "sqlite:///./smartbite.db"

engine = None
SessionLocal = None
DB_TYPE = "unknown"

try:
    # Attempt to connect to MySQL database
    test_engine = create_engine(
        MYSQL_URL,
        pool_pre_ping=True,
        pool_recycle=3600,
        connect_args={"connect_timeout": 3}
    )
    with test_engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    engine = test_engine
    DB_TYPE = "MySQL"
    logger.info(f"✅ Successfully connected to MySQL database '{DB_NAME}' on {DB_HOST}:{DB_PORT}")
except Exception as e:
    logger.warning(
        f"⚠️ Could not connect to MySQL ({e}). "
        f"Falling back automatically to local SQLite database (smartbite.db) "
        f"for seamless zero-friction local execution."
    )
    engine = create_engine(
        SQLITE_URL,
        connect_args={"check_same_thread": False}
    )
    DB_TYPE = "SQLite (Fallback)"
    logger.info("✅ SQLite fallback engine initialized successfully at ./smartbite.db")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_db_status():
    return {
        "engine": DB_TYPE,
        "mysql_target": f"{DB_USER}@{DB_HOST}:{DB_PORT}/{DB_NAME}",
        "active": True
    }
