# Payment Service

Go service for payment, coupon, and payment-history workflows.

## Structure

```text
cmd/main.go              Starts the app, connects MongoDB/Redis, loads config
internal/router          Registers HTTP routes
internal/payment         Payment creation, confirmation, history, and events
internal/coupon          Coupon validation and administration
internal/middleware      JWT, role checks, CORS
internal/config          Environment config
```

## Routes

```text
/api/payments
/api/coupons
```

## Data

Uses `PAYMENT_MONGODB_DB` with the existing `payments` and `coupons` collections.

## Check

```bash
go test ./...
```
