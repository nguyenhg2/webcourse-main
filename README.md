# Webcourse

Web app for selling and managing programming courses.

## Services

```text
backend/core-service      Core course, lesson, enrollment, user data
backend/payment-service   Payment and coupon workflows
backend/media-service     Cloudinary upload/delete, no database
backend/blog-service      Blog and contact workflows
backend/api-gateway       Single HTTP gateway for frontend
frontend                  React/Vite app
```

## Required `.env`

```env
MONGODB_URI=
MONGODB_DB=codecamp_core
PAYMENT_MONGODB_DB=codecamp_payment
BLOG_MONGODB_DB=codecamp_php
JWT_SECRET=
STRIPE_SECRET_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

For local Stripe demo, use test-mode keys only: `sk_test...` for `STRIPE_SECRET_KEY` and `pk_test...` for `VITE_STRIPE_PUBLISHABLE_KEY`. Use Stripe test card `4242 4242 4242 4242` with any future expiry date and any CVC.

## Run

```bash
docker compose up --build
```

Open the app at:

```text
http://localhost:5173
```

Gateway routes:

```text
http://localhost:8000/core
http://localhost:8000/payment
http://localhost:8000/media
http://localhost:8000/blog
```

## Build Frontend

```bash
cd frontend && npm run build
```
