FROM php:8.3-cli-alpine

RUN apk add --no-cache libcrypto3 libssl3 \
    && apk add --no-cache --virtual .build-deps autoconf g++ make linux-headers openssl-dev \
    && pecl install mongodb \
    && docker-php-ext-enable mongodb \
    && apk del .build-deps

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . .

RUN mkdir -p bootstrap/cache storage/framework/cache storage/framework/sessions storage/framework/views storage/logs \
    && chmod -R 775 bootstrap/cache storage

RUN composer install --no-dev --optimize-autoloader --no-interaction

RUN cp .env.example .env \
    && php artisan key:generate --force \
    && sed -i '/^MONGODB_URI=/d;/^MONGODB_DB=/d;/^BLOG_MONGODB_DB=/d;/^JWT_SECRET=/d' .env

EXPOSE 8003

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8003"]
