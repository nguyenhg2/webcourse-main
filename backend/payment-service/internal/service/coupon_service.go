package service

import (
	"context"

	"payment-service/internal/model"
	"payment-service/internal/repository"
)

type CouponService struct {
	repo *repository.CouponRepo
}

func NewCouponService(repo *repository.CouponRepo) *CouponService {
	return &CouponService{repo: repo}
}

func (s *CouponService) ValidateCoupon(ctx context.Context, code string, amount int64) (bool, int64, error) {
	if code == "" || amount < 0 {
		return false, 0, nil
	}

	coupon, err := s.repo.ValidateCoupon(ctx, code)
	if err != nil {
		return false, 0, nil
	}
	if coupon.MaxUses > 0 && coupon.Used >= coupon.MaxUses {
		return false, 0, nil
	}

	discount := discountAmount(amount, coupon.Type, coupon.Discount)
	return true, discount, nil
}

func (s *CouponService) ListActiveCoupons(ctx context.Context) ([]*model.Coupon, error) {
	return s.repo.ListActiveCoupons(ctx)
}

func (s *CouponService) UseCoupon(ctx context.Context, code string) error {
	return s.repo.UseCoupon(ctx, code)
}
