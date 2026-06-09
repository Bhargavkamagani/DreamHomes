from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect, text

from app.api.routes import router
from app.database.session import Base, engine
from app.models import entities
from app.settings import settings


def create_database_tables():
    Base.metadata.create_all(bind=engine)
    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE projects ADD COLUMN IF NOT EXISTS cover_image_url VARCHAR(500)"))
        connection.execute(text("ALTER TABLE contractor_profiles ADD COLUMN IF NOT EXISTS about TEXT"))
        connection.execute(text("ALTER TABLE contractor_profiles ADD COLUMN IF NOT EXISTS gstin VARCHAR(60)"))
        connection.execute(text("ALTER TABLE contractor_profiles ADD COLUMN IF NOT EXISTS pan VARCHAR(60)"))
        connection.execute(text("ALTER TABLE contractor_profiles ADD COLUMN IF NOT EXISTS website VARCHAR(255)"))
        connection.execute(text("ALTER TABLE contractor_profiles ADD COLUMN IF NOT EXISTS business_type VARCHAR(120)"))
        connection.execute(text("ALTER TABLE contractor_profiles ADD COLUMN IF NOT EXISTS registration_year INTEGER"))
        connection.execute(text("ALTER TABLE contractor_profiles ADD COLUMN IF NOT EXISTS team_size VARCHAR(80)"))
        connection.execute(text("ALTER TABLE contractor_profiles ADD COLUMN IF NOT EXISTS insurance_available BOOLEAN DEFAULT FALSE"))
        connection.execute(text("ALTER TABLE contractor_profiles ADD COLUMN IF NOT EXISTS service_locations TEXT"))
        connection.execute(text("ALTER TABLE contractor_profiles ADD COLUMN IF NOT EXISTS services_offered TEXT"))
        connection.execute(text("ALTER TABLE contractor_profiles ADD COLUMN IF NOT EXISTS equipment_owned TEXT"))
        connection.execute(text("ALTER TABLE contractor_profiles ADD COLUMN IF NOT EXISTS documents TEXT"))
        connection.execute(text("ALTER TABLE contractor_profiles ADD COLUMN IF NOT EXISTS company_logo_url VARCHAR(500)"))
        connection.execute(text("ALTER TABLE supplier_profiles ADD COLUMN IF NOT EXISTS about TEXT"))
        connection.execute(text("ALTER TABLE supplier_profiles ADD COLUMN IF NOT EXISTS gstin VARCHAR(60)"))
        connection.execute(text("ALTER TABLE supplier_profiles ADD COLUMN IF NOT EXISTS pan VARCHAR(60)"))
        connection.execute(text("ALTER TABLE supplier_profiles ADD COLUMN IF NOT EXISTS website VARCHAR(255)"))
        connection.execute(text("ALTER TABLE supplier_profiles ADD COLUMN IF NOT EXISTS business_type VARCHAR(120)"))
        connection.execute(text("ALTER TABLE supplier_profiles ADD COLUMN IF NOT EXISTS registration_year INTEGER"))
        connection.execute(text("ALTER TABLE supplier_profiles ADD COLUMN IF NOT EXISTS delivery_locations TEXT"))
        connection.execute(text("ALTER TABLE supplier_profiles ADD COLUMN IF NOT EXISTS documents TEXT"))
        connection.execute(text("ALTER TABLE supplier_profiles ADD COLUMN IF NOT EXISTS gallery TEXT"))
        connection.execute(text("ALTER TABLE supplier_profiles ADD COLUMN IF NOT EXISTS store_logo_url VARCHAR(500)"))
        connection.execute(text("ALTER TABLE conversations ADD COLUMN IF NOT EXISTS conversation_type VARCHAR(40) DEFAULT 'DIRECT'"))
        connection.execute(text("ALTER TABLE conversations ADD COLUMN IF NOT EXISTS direct_key VARCHAR(120)"))
        connection.execute(text("ALTER TABLE conversations ADD COLUMN IF NOT EXISTS last_message TEXT"))
        connection.execute(text("ALTER TABLE conversations ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMP"))
        connection.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_conversations_direct_key ON conversations (direct_key) WHERE direct_key IS NOT NULL"))
        connection.execute(text("ALTER TABLE messages ADD COLUMN IF NOT EXISTS receiver_id INTEGER REFERENCES users(id)"))
        connection.execute(text("ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type VARCHAR(30) DEFAULT 'TEXT'"))
        connection.execute(text("ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP"))


create_database_tables()

app = FastAPI(title="Gharbano MVP API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

upload_path = Path(settings.upload_directory)
upload_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(upload_path)), name="uploads")
app.include_router(router)


@app.on_event("startup")
def create_database_tables_on_startup():
    create_database_tables()


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/health/db")
def database_health_check():
    inspector = inspect(engine)
    with engine.connect() as connection:
        database_name = connection.execute(text("SELECT current_database()")).scalar()
    return {
        "database": database_name,
        "tables": sorted(inspector.get_table_names(schema="public")),
    }
