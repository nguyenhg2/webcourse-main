package service

import (
	"context"
	"errors"
	"strings"
	"time"

	"payment-service/internal/model"
	"payment-service/internal/repository"

	"go.mongodb.org/mongo-driver/bson/primitive"
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

func (s *CouponService) ListCoupons(ctx context.Context) ([]*model.Coupon, error) {
	return s.repo.ListCoupons(ctx)
}

func (s *CouponService) CreateCoupon(ctx context.Context, req model.CreateCouponRequest) (*model.Coupon, error) {
	code := strings.ToUpper(strings.TrimSpace(req.Code))
	if code == "" {
		return nil, errors.New("coupon code is required")
	}
	if req.Type != "percentage" && req.Type != "fixed" {
		return nil, errors.New("coupon type must be percentage or fixed")
	}
	if req.Discount <= 0 {
		return nil, errors.New("discount must be greater than 0")
	}
	if req.Type == "percentage" && req.Discount > 100 {
		return nil, errors.New("percentage discount cannot be greater than 100")
	}
	if req.Expiry <= 0 {
		req.Expiry = time.Now().AddDate(1, 0, 0).Unix()
	}

	return s.repo.CreateCoupon(ctx, &model.Coupon{
		Code:     code,
		Discount: req.Discount,
		Type:     req.Type,
		MaxUses:  req.MaxUses,
		Expiry:   req.Expiry,
		Active:   req.Active,
	})
}

func (s *CouponService) SetCouponActive(ctx context.Context, id string, active bool) (*model.Coupon, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, errors.New("invalid coupon id")
	}
	return s.repo.SetCouponActive(ctx, objectID, active)
}

func (s *CouponService) UseCoupon(ctx context.Context, code string) error {
	return s.repo.UseCoupon(ctx, code)
}
