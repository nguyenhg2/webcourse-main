package payment

import (
	"context"
	"reflect"
	"testing"
)

func TestCleanCourseIDs(t *testing.T) {
	got := cleanCourseIDs([]string{" c1 ", "", "c2", "c1"})
	want := []string{"c1", "c2"}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("expected %v, got %v", want, got)
	}
}

func TestCardHelpers(t *testing.T) {
	if last4("4242 4242 4242 1111") != "1111" {
		t.Fatal("last4 should keep last four digits")
	}
	if cardBrand("American Express") != "amex" {
		t.Fatal("american express should become amex")
	}
}

func TestNewPaymentWithoutCoupon(t *testing.T) {
	payment, err := newPayment(context.Background(), nil, "user1", PaymentRequest{
		CourseIDs: []string{"course1", "course1"},
		Amount:    100000,
	})
	if err != nil {
		t.Fatal(err)
	}
	if payment.FinalAmount != 100000 || payment.Status != statusComplete {
		t.Fatal("payment amount or status is not correct")
	}
	if len(payment.CourseIDs) != 1 {
		t.Fatal("duplicate course ids should be removed")
	}
}
