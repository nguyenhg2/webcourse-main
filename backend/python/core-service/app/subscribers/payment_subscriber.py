import asyncio
import logging
from contextlib import suppress

from redis.asyncio import Redis

from app.core.config import settings
from app.db.mongo import get_db
from app.models.enrollments import PaymentSuccessEvent
from app.services.enrollment_service import create_enrollments

logger = logging.getLogger(__name__)
payment_success_task: asyncio.Task | None = None


async def listen_payment_success():
    while True:
        redis = Redis.from_url(settings.redis_url, decode_responses=True)
        pubsub = redis.pubsub()
        try:
            await pubsub.subscribe("payment.success")
            logger.info("Subscribed to payment.success")

            async for message in pubsub.listen():
                if message.get("type") != "message":
                    continue

                try:
                    event = PaymentSuccessEvent.model_validate_json(message["data"])
                    db = get_db()
                    result = await create_enrollments(
                        db,
                        event.user_id,
                        event.course_ids,
                        event.payment_id,
                    )
                    await db["carts"].update_one(
                        {"user_id": event.user_id},
                        {"$pull": {"items": {"$in": event.course_ids}}},
                    )
                    logger.info(
                        "Processed payment.success payment_id=%s enrolled=%s skipped=%s",
                        event.payment_id,
                        len(result["enrolled"]),
                        len(result["skipped"]),
                    )
                except Exception as exc:
                    logger.warning("Cannot process payment.success event: %s", exc)
        except asyncio.CancelledError:
            raise
        except Exception as exc:
            logger.warning("Redis payment listener error: %s", exc)
            await asyncio.sleep(5)
        finally:
            with suppress(Exception):
                await pubsub.unsubscribe("payment.success")
            with suppress(Exception):
                await pubsub.close()
            with suppress(Exception):
                await redis.close()


async def start_payment_success_listener():
    global payment_success_task
    if payment_success_task or not settings.redis_url:
        return
    payment_success_task = asyncio.create_task(listen_payment_success())


async def stop_payment_success_listener():
    global payment_success_task
    if not payment_success_task:
        return

    payment_success_task.cancel()
    with suppress(asyncio.CancelledError):
        await payment_success_task
    payment_success_task = None
