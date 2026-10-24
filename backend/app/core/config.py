from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Gatos da Corte API"
    app_env: str = "development"
    database_url: str = "postgresql+psycopg://gatos_app:change_me@localhost:5432/gatos_da_corte"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
