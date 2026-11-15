import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal, get_db_status
from .seed_data import seed_database
from .routes import auth, inventory, waste, analytics, surplus, suggestions, reports

# Create database tables if they do not exist
Base.metadata.create_all(bind=engine)

# Auto seed default records and demo users on boot
db = SessionLocal()
try:
    seed_database(db)
finally:
    db.close()

app = FastAPI(
    title="SmartBite – College Food Waste Management System API",
    description="Backend API for tracking canteen food preparation, consumption, leftover waste analytics, and surplus donations.",
    version="1.0.0"
)

# Enable CORS for React frontend (Vite default port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(inventory.router)
app.include_router(waste.router)
app.include_router(analytics.router)
app.include_router(surplus.router)
app.include_router(suggestions.router)
app.include_router(reports.router)

@app.get("/")
def root():
    status = get_db_status()
    return {
        "system": "SmartBite – College Food Waste Management System",
        "status": "online",
        "version": "1.0.0",
        "database_engine": status["engine"],
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    status = get_db_status()
    return {
        "status": "healthy",
        "database": status
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
