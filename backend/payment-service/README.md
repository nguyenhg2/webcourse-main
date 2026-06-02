# Payment Service

Go/Gin payment service for learning and classroom demo with Stripe PaymentIntent.

`STRIPE_SECRET_KEY` is required and is read only from server environment config. Do not send it from the frontend or request body.

## Routes

```text
POST /api/payments          Create Stripe PaymentIntent
GET  /api/payments/:id      Get payment detail
GET  /api/payments/history  Current user's payment history
GET  /api/payments          Admin/operator list
POST /api/coupons/validate  Validate coupon and return discount_amount
```

## Payment Flow

```text
Core Service reads courses from database
Core Service sends course_ids + amount to Payment Service
Payment Service validates coupon from database
Payment Service creates Stripe PaymentIntent
Payment Service saves payment to MongoDB with status=pending
Payment Service returns client_secret for Stripe Elements
```

If `final_amount` is `0`, the service saves `status=completed` because no card payment is needed.

## Payment Fields

```text
user_id, user_email, course_ids
amount, original_amount, discount_amount, final_amount
coupon_code, coupon_discount
method=stripe, status=pending|completed
stripe_payment_id, card_last4, card_brand, billing_address
created_at, updated_at
```

## Config

```text
MONGODB_URI             required
STRIPE_SECRET_KEY       required
PAYMENT_MONGODB_DB      default codecamp_payment
JWT_SECRET              default dev-secret
PAYMENT_INTERNAL_TOKEN  default dev-internal-token
PORT                    default 8002
```

## Check

```bash
go test ./...
```
