from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_path: str
    allowed_origin: str

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()