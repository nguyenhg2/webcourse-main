from dataclasses import dataclass
import logging
import time

import httpx
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

def _redis_client() -> Redis | None:
    global _redis
    if not settings.redis_url:
        return None
    if _redis is None:
        _redis = Redis.from_url(settings.redis_url, decode_responses=True)
    return _redis

def _cache_key(object_key: str) -> str:
    return f"r2:signed-media:{object_key}:{int(settings.media_signed_url_ttl_seconds or 600)}"

def _cache_still_fresh(item: dict, now: int) -> bool:
    expires_at = item.get("expires_at")
    if not expires_at:
        return False
    return int(expires_at) - 60 > now

def _playback_from_cache_item(item: dict) -> SignedPlayback:
    return SignedPlayback(item["url"], int(item["expires_at"]), item.get("delivery") or "r2_signed_url")

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
        logger.warning("Cannot read signed media URL cache: %s", exc)
        return None

    if not raw:
        return None

    try:
        import json
        item = json.loads(raw)
    except Exception:
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

    ttl = max(int(item["expires_at"]) - now - 60, 1)
    try:
        import json
        await redis.set(key, json.dumps(item), ex=ttl)
    except Exception as exc:
        logger.warning("Cannot write signed media URL cache: %s", exc)

async def signed_video_playback(lesson: dict) -> SignedPlayback | None:
    object_key = (lesson.get("video_object_key") or "").strip()
    if not object_key:
        legacy_url = lesson.get("video_url")
        if legacy_url and settings.allow_legacy_public_video_urls:
            return SignedPlayback(legacy_url, None, "legacy_public_url")
        return None

    now = int(time.time())
    key = _cache_key(object_key)
    cached = await _read_cache(key, now)
    if cached:
        return cached

    url = f"{settings.media_service_url.rstrip('/')}/internal/files/signed-url"
    payload = {
        "object_key": object_key,
        "expires_in": int(settings.media_signed_url_ttl_seconds or 600),
    }
    headers = {"X-Internal-Token": settings.media_internal_token}

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPError as exc:
        raise PlaybackSigningError("Không tạo được URL phát video từ Media Service") from exc

    signed_url = data.get("url")
    if not signed_url:
        raise PlaybackSigningError("Media Service không trả về URL phát video")

    item = {
        "url": signed_url,
        "expires_at": int(data.get("expires_at") or now + int(settings.media_signed_url_ttl_seconds or 600)),
        "delivery": data.get("storage") or "r2_signed_url",
    }
    await _write_cache(key, item, now)
    return _playback_from_cache_item(item)
