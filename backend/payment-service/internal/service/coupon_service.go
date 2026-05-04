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
	return &CouponService{
		repo: repo,
	}
}

func (s *CouponService) ValidateCoupon(ctx context.Context, code string, amount int64) (bool, int64, error) {
	coupon, err := s.repo.ValidateCoupon(ctx, code)
	if err != nil {
		return false, 0, err
	}
	if !coupon.Active {
		return false, 0, nil
	}
	// TODO: validate amount vs discount type if needed
	return true, coupon.Discount, nil
}

func (s *CouponService) ListActiveCoupons(ctx context.Context) ([]*model.Coupon, error) {
	// TODO: implement cursor/pagination with repo
	// Mock for compile
	return []*model.Coupon{}, nil
}

func (s *CouponService) UseCoupon(ctx context.Context, code string) error {
	return s.repo.UseCoupon(ctx, code)
}
