from pydantic_settings import BaseSettings
from pydantic import Field, field_validator


class Settings(BaseSettings):
    mongo_url: str = Field(alias="MONGODB_URI")
    mongo_db: str = Field(default="codecamp_core", alias="MONGODB_DB")
    payment_db: str = Field(default="codecamp_payment", alias="PAYMENT_MONGODB_DB")
    payment_service_url: str = Field(default="http://localhost:8002", alias="PAYMENT_SERVICE_URL")
    payment_internal_token: str = Field(default="dev-internal-token", alias="PAYMENT_INTERNAL_TOKEN")
    redis_url: str | None = Field(default="redis://localhost:6379", alias="REDIS_URL")
    jwt_secret: str = Field(default="dev-secret", alias="JWT_SECRET")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    cloudinary_cloud_name: str | None = Field(default=None, alias="CLOUDINARY_CLOUD_NAME")
    cloudinary_api_key: str | None = Field(default=None, alias="CLOUDINARY_API_KEY")
    cloudinary_api_secret: str | None = Field(default=None, alias="CLOUDINARY_API_SECRET")
    cloudinary_auth_token_key: str | None = Field(default=None, alias="CLOUDINARY_AUTH_TOKEN_KEY")
    cloudinary_signed_url_ttl_seconds: int = Field(default=600, alias="CLOUDINARY_SIGNED_URL_TTL_SECONDS")
    cloudinary_signed_url_cache_grace_seconds: int = Field(
        default=60, alias="CLOUDINARY_SIGNED_URL_CACHE_GRACE_SECONDS"
    )
    allow_legacy_public_video_urls: bool = Field(
        default=False, alias="ALLOW_LEGACY_PUBLIC_VIDEO_URLS"
    )
    access_token_expire_minutes: int = Field(
        default=60 * 12, alias="ACCESS_TOKEN_EXPIRE_MINUTES"
    )
    cors_origins: str = Field(default="*", alias="CORS_ORIGINS")

    @field_validator("jwt_secret", "jwt_algorithm", mode="before")
    @classmethod
    def default_when_blank(cls, value: str | None, info):
        if value is None or str(value).strip() == "":
            if info.field_name == "jwt_secret":
                return "dev-secret"
            if info.field_name == "jwt_algorithm":
                return "HS256"
        return value

    class Config:
        env_file = (".env", "../../.env")
        env_file_encoding = "utf-8-sig"
        extra = "ignore"
        populate_by_name = True

    @property
    def cors_origin_list(self) -> list[str]:
        if self.cors_origins == "*":
            return ["*"]
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
