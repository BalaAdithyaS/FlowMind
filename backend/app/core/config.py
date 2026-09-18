from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "FlowMind API"
    APP_ENV: str = "development"
    
    # AI Config
    AI_PROVIDER: Literal["ollama", "mock"] = "ollama"
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "mistral:latest"
    
    # Database
    DATABASE_URL: str = "sqlite:///./flowmind.db"
    
    # Security
    JWT_SECRET: str = "change_me_to_a_secure_random_string"
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
