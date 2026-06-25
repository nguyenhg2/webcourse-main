from dataclasses import dataclass
from datetime import datetime, timezone
import hashlib
import json
import logging
import time

import cloudinary
from cloudinary.utils import cloudinary_url
from redis.asyncio import Redis

from app.core.config import settings

logger = logging.getLogger(__name__)

_memory_cache: dict[str, dict] = {}
_redis: Redis | None = None


class PlaybackSigningError(RuntimeError):
    pass


@dataclass(frozen=True)
class SignedPlayback:
    url: str
    expires_at: int | None
    delivery: str


def cloudinary_configured() -> bool:
    return bool(
        settings.cloudinary_cloud_name
        and settings.cloudinary_api_key
        and settings.cloudinary_api_secret
    )


def _cloudinary_auth_token_key() -> str | None:
    key = (settings.cloudinary_auth_token_key or "").strip()
    if not key:
        return None
    try:
        bytes.fromhex(key)
    except ValueError as exc:
        raise PlaybackSigningError("CLOUDINARY_AUTH_TOKEN_KEY phai la chuoi hex hop le") from exc
    return key


def _redis_client() -> Redis | None:
    global _redis
    if not settings.redis_url:
        return None
    if _redis is None:
        _redis = Redis.from_url(settings.redis_url, decode_responses=True)
    return _redis


def _cache_key(lesson: dict) -> str:
    payload = {
        "public_id": lesson.get("video_public_id"),
        "delivery_type": lesson.get("video_delivery_type") or "authenticated",
        "format": lesson.get("video_format") or "",
        "version": lesson.get("video_version") or "",
        "token_auth": bool(settings.cloudinary_auth_token_key),
        "ttl": int(settings.cloudinary_signed_url_ttl_seconds or 600),
    }
    digest = hashlib.sha256(json.dumps(payload, sort_keys=True).encode("utf-8")).hexdigest()
    return f"cloudinary:signed-video:{digest}"


def _cache_still_fresh(item: dict, now: int) -> bool:
    cache_expires_at = item.get("cache_expires_at") or item.get("expires_at")
    if cache_expires_at is None:
        return False
    grace = max(int(settings.cloudinary_signed_url_cache_grace_seconds or 0), 0)
    return int(cache_expires_at) - grace > now


def _playback_from_cache_item(item: dict) -> SignedPlayback:
    expires_at = item.get("expires_at")
    return SignedPlayback(
        item["url"],
        int(expires_at) if expires_at else None,
        item.get("delivery") or "signed_url",
    )


async def _read_cache(key: str, now: int) -> SignedPlayback | None:
    item = _memory_cache.get(key)
    if item and _cache_still_fresh(item, now):
        return _playback_from_cache_item(item)

    redis = _redis_client()
    if not redis:
        return None

    try:
        raw = await redis.get(key)
    except Exception as exc:
        logger.warning("Cannot read signed video URL cache: %s", exc)
        return None

    if not raw:
        return None

    try:
        item = json.loads(raw)
    except json.JSONDecodeError:
        return None

    if not _cache_still_fresh(item, now):
        return None

    _memory_cache[key] = item
    return _playback_from_cache_item(item)


async def _write_cache(key: str, item: dict, now: int) -> None:
    _memory_cache[key] = item
    redis = _redis_client()
    if not redis:
        return

    grace = max(int(settings.cloudinary_signed_url_cache_grace_seconds or 0), 0)
    redis_ttl = max(int(item["cache_expires_at"]) - now - grace, 1)
    try:
        await redis.set(key, json.dumps(item), ex=redis_ttl)
    except Exception as exc:
        logger.warning("Cannot write signed video URL cache: %s", exc)


async def signed_video_playback(lesson: dict) -> SignedPlayback | None:
    public_id = lesson.get("video_public_id")
    if not public_id:
        legacy_url = lesson.get("video_url")
        if legacy_url and settings.allow_legacy_public_video_urls:
            return SignedPlayback(legacy_url, None, "legacy_public_url")
        return None

    if not cloudinary_configured():
        raise PlaybackSigningError("Thieu cau hinh Cloudinary de ky URL phat video")

    now = int(time.time())
    key = _cache_key(lesson)
    cached = await _read_cache(key, now)
    if cached:
        return cached

    ttl = max(int(settings.cloudinary_signed_url_ttl_seconds or 600), 120)
    cache_expires_at = now + ttl
    url, actual_expires_at, delivery = _sign_cloudinary_url(lesson, cache_expires_at)

    item = {
        "url": url,
        "expires_at": actual_expires_at,
        "cache_expires_at": cache_expires_at,
        "delivery": delivery,
    }
    await _write_cache(key, item, now)
    return SignedPlayback(url, actual_expires_at, delivery)


def signed_video_url(lesson: dict) -> str | None:
    public_id = lesson.get("video_public_id")
    if not public_id:
        if lesson.get("video_url") and settings.allow_legacy_public_video_urls:
            return lesson.get("video_url")
        return None

    if not cloudinary_configured():
        return None

    expires_at = int(datetime.now(timezone.utc).timestamp()) + int(
        settings.cloudinary_signed_url_ttl_seconds or 600
    )
    return _sign_cloudinary_url(lesson, expires_at)[0]


def _sign_cloudinary_url(lesson: dict, expires_at: int) -> tuple[str, int | None, str]:
    cloudinary.config(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_api_secret,
        secure=True,
    )

    delivery_type = lesson.get("video_delivery_type") or "authenticated"
    video_format = lesson.get("video_format") or None
    version = lesson.get("video_version") or None
    auth_token = None
    actual_expires_at = None
    delivery = "signed_url"

    token_key = _cloudinary_auth_token_key()
    if token_key:
        auth_token = {
            "key": token_key,
            "expiration": expires_at,
        }
        actual_expires_at = expires_at
        delivery = "auth_token"

    url, _ = cloudinary_url(
        lesson["video_public_id"],
        resource_type="video",
        type=delivery_type,
        secure=True,
        sign_url=True,
        auth_token=auth_token,
        expires_at=expires_at,
        format=video_format,
        version=version,
    )
    return url, actual_expires_at, delivery
