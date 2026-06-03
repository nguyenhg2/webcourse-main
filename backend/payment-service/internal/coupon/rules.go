package coupon

import (
	"errors"
	"strings"
	"time"
)

const (
	couponTypeFixed      = "fixed"
	couponTypePercent    = "percent"
	couponTypePercentage = "percentage"
)

func newCoupon(req CreateRequest) (*Coupon, error) {
	code := NormalizeCode(req.Code)
	couponType := normalizeType(req.Type)
	discount := req.Discount

	if code == "" {
		return nil, errors.New("coupon code is required")
	}
	if couponType == "" {
		return nil, errors.New("coupon type must be percentage or fixed")
	}
	if discount <= 0 {
		return nil, errors.New("discount must be greater than 0")
	}
	if couponType == couponTypePercentage && discount > 100 {
		return nil, errors.New("percentage discount cannot be greater than 100")
	}

	expiry := req.Expiry
	if expiry <= 0 {
		expiry = time.Now().Add(365 * 24 * time.Hour).Unix()
	}

	maxUses := req.MaxUses
	if maxUses < 0 {
		maxUses = 0
	}

	active := req.Active
	return &Coupon{
		Code:          code,
		DiscountType:  couponType,
		DiscountValue: discount,
		MaxUses:       maxUses,
		ExpiresAt:     expiry,
		IsActive:      &active,
		Type:          couponType,
		Discount:      discount,
		Expiry:        expiry,
		Active:        &active,
	}, nil
}

func NormalizeCode(code string) string {
	return strings.ToUpper(strings.TrimSpace(code))
}

func normalizeType(value string) string {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case couponTypePercent, couponTypePercentage:
		return couponTypePercentage
	case couponTypeFixed:
		return couponTypeFixed
	default:
		return ""
	}
}

func (c Coupon) validFor(amount int64) bool {
	if amount < 0 {
		return false
	}
	if !c.active() || c.expired() || c.outOfUses() {
		return false
	}
	if amount < c.MinOrder {
		return false
	}
	return c.discountValue() > 0
}

func (c Coupon) discountFor(amount int64) int64 {
	discount := discountAmount(amount, c.discountType(), c.discountValue())
	if c.MaxDiscount > 0 && discount > c.MaxDiscount {
		discount = c.MaxDiscount
	}
	return positive(min(discount, amount))
}

func discountAmount(amount int64, couponType string, discount int64) int64 {
	if amount <= 0 || discount <= 0 {
		return 0
	}

	switch normalizeType(couponType) {
	case couponTypePercentage:
		return amount * discount / 100
	case couponTypeFixed:
		return min(discount, amount)
	default:
		return 0
	}
}

func (c Coupon) active() bool {
	if c.IsActive != nil {
		return *c.IsActive
	}
	if c.Active != nil {
		return *c.Active
	}
	return false
}

func (c Coupon) expired() bool {
	expiresAt := c.ExpiresAt
	if expiresAt == 0 {
		expiresAt = c.Expiry
	}
	return expiresAt > 0 && expiresAt < time.Now().Unix()
}

func (c Coupon) outOfUses() bool {
	used := c.UsedCount
	if used == 0 {
		used = c.Used
	}
	return c.MaxUses > 0 && used >= c.MaxUses
}

func (c Coupon) discountType() string {
	if strings.TrimSpace(c.DiscountType) != "" {
		return c.DiscountType
	}
	return c.Type
}

func (c Coupon) discountValue() int64 {
	if c.DiscountValue > 0 {
		return c.DiscountValue
	}
	return c.Discount
}

func (c Coupon) response() CouponResponse {
	used := c.UsedCount
	if used == 0 {
		used = c.Used
	}

	expiry := c.ExpiresAt
	if expiry == 0 {
		expiry = c.Expiry
	}

	return CouponResponse{
		ID:       c.ID.Hex(),
		Code:     c.Code,
		Type:     normalizeType(c.discountType()),
		Discount: c.discountValue(),
		MaxUses:  c.MaxUses,
		Used:     used,
		Expiry:   expiry,
		Active:   c.active(),
	}
}

func min(a, b int64) int64 {
	if a < b {
		return a
	}
	return b
}

func positive(value int64) int64 {
	if value < 0 {
		return 0
	}
	return value
}
