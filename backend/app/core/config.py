import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Explicitly load .env from backend directory or parent
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "CiviSense"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"
    
    # Database configuration (defaults to SQLite for zero-config local run, supports Postgres via env)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./civisense.db"
    )
    
    # Groq & LLM configuration
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    GROQ_TEMPERATURE: float = float(os.getenv("GROQ_TEMPERATURE", "0.2"))
    
    # Upload storage directory
    UPLOAD_DIR: Path = Path("uploads")
    
    # Allowed CORS Origins for frontend integration
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "*",
    ]

    class Config:
        case_sensitive = True
        extra = "allow"

settings = Settings()
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)