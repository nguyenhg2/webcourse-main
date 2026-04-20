import time
import logging
from fastapi import Request, HTTPException
import redis.asyncio as redis 

class RateLimiter:
    def __init__(self, host="localhost", port=6379, db=0):
        self.redis = redis.Redis(host=host, port=port, db=db, decode_responses=True)
        self.limit = 100 
        self.window = 60 

    async def check_rate_limit(self, request: Request):
        client_ip = request.client.host
        key = f"rate_limit:{client_ip}"

        try:
            async with self.redis.pipeline(transaction=True) as pipe:
                now = time.time()
                await pipe.zremrangebyscore(key, 0, now - self.window)
                await pipe.zcard(key)
                await pipe.zadd(key, {str(now): now})
                await pipe.expire(key, self.window)
                
                _, current_requests, _, _ = await pipe.execute()
            if current_requests > self.limit:
                logging.warning(f"Rate limit exceeded for IP: {client_ip}")
                raise HTTPException(
                    status_code=429, 
                    detail="Too many requests. Please try again later."
                )
                
        except redis.ConnectionError:
            logging.error("Could not connect to Redis for Rate Limiting")
            return
limiter = RateLimiter(host="localhost", port=6379)