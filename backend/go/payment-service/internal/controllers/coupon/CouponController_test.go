package coupon

import "testing"

func TestNormalizeCode(t *testing.T) {
	if got := NormalizeCode(" code10 "); got != "CODE10" {
		t.Fatalf("expected CODE10, got %s", got)
	}
}

func TestCouponDiscount(t *testing.T) {
	percent := Coupon{Code: "SALE", Type: "percent", Discount: 20, Active: true}
	if !percent.validFor(100000) || percent.discountFor(100000) != 20000 {
		t.Fatal("percent coupon should be valid and discount 20%")
	}

	fixed := Coupon{Code: "FIX", Type: "fixed", Discount: 200000, Active: true}
	if fixed.discountFor(100000) != 100000 {
		t.Fatal("fixed discount should not exceed amount")
	}
}

func TestNewCouponValidation(t *testing.T) {
	_, err := newCoupon(CreateRequest{Code: "bad", Type: "percent", Discount: 101, Active: true})
	if err == nil {
		t.Fatal("percent discount greater than 100 should fail")
	}
}
