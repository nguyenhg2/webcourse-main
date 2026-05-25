FROM php:8.3-cli-alpine

RUN apk add --no-cache autoconf g++ make linux-headers \
    && pecl install mongodb \
    && docker-php-ext-enable mongodb \
    && apk del autoconf g++ make

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . .

RUN mkdir -p bootstrap/cache storage/framework/cache storage/logs \
    && chmod -R 775 bootstrap/cache storage

RUN composer install --no-dev --optimize-autoloader --no-interaction

RUN cp .env.example .env \
    && php artisan key:generate --force

EXPOSE 8003

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8003"]
