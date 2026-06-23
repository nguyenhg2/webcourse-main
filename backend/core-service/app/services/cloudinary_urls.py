from datetime import datetime, timezone

import cloudinary
from cloudinary.utils import cloudinary_url

from app.core.config import settings


def cloudinary_configured() -> bool:
    return bool(
        settings.cloudinary_cloud_name
        and settings.cloudinary_api_key
        and settings.cloudinary_api_secret
    )


def signed_video_url(lesson: dict) -> str | None:
    public_id = lesson.get("video_public_id")
    if not public_id or not cloudinary_configured():
        return None

    cloudinary.config(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_api_secret,
        secure=True,
    )

    expires_at = int(datetime.now(timezone.utc).timestamp()) + int(
        settings.cloudinary_signed_url_ttl_seconds or 600
    )
    delivery_type = lesson.get("video_delivery_type") or "authenticated"
    video_format = lesson.get("video_format") or None
    version = lesson.get("video_version") or None

    url, _ = cloudinary_url(
        public_id,
        resource_type="video",
        type=delivery_type,
        secure=True,
        sign_url=True,
        expires_at=expires_at,
        format=video_format,
        version=version,
    )
    return url
