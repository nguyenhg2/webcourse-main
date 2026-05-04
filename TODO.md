# Fix Login Error (CORS due to backend down)

## Steps (bcrypt fixed - test auth):\n- Fixed bcrypt in requirements.txt
- [x] 1. Start services: docker-compose up -d backend frontend ✅
- [ ] 2. Seed DB: docker-compose --profile seed run --rm seed ❌ (bcrypt Python 3.13 issue - skip, use register)
- [x] 3. Test login: http://localhost:5173/dang-nhap (register new or seed fixed later) ✅
- [x] 4. Backend rebuilt with bcrypt==4.1.3 - auth hash/verify works ✅

