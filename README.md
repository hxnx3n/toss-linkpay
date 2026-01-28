# LinkPay

토스페이먼츠 API를 활용한 간편 결제 링크 서비스

## 기술 스택

- **Frontend**: React 18 + Vite 5 + TailwindCSS 3.4
- **Backend**: NestJS 10 + TypeORM
- **Database**: PostgreSQL 15
- **Payment**: TossPayments SDK
- **Container**: Docker & Docker Compose

## 시작하기

### Docker로 실행

```bash
docker-compose up --build
```

서비스 접속:
- Frontend: http://localhost
- Backend API: http://localhost:3000

### 로컬 개발

```bash
# Backend
cd backend
pnpm install
pnpm run start:dev

# Frontend
cd frontend
pnpm install
pnpm run dev
```

## 주요 기능

### 결제 링크 생성
- 다중 품목 지원
- 자동 금액 계산

### 결제 수단
- 카드 결제
- 계좌이체
- 가상계좌

### 관리자 기능
- 결제 내역 조회/검색/필터/정렬
- 결제 취소 및 환불
- 통계 대시보드

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/payments | 결제 링크 생성 |
| GET | /api/payments/:uuid | 결제 정보 조회 |
| POST | /api/payments/:uuid/confirm | 결제 승인 |
| POST | /api/payments/:uuid/cancel | 결제 취소 |
| POST | /api/payments/:uuid/refund | 환불 |
| DELETE | /api/payments/:uuid | 삭제 |
| POST | /api/payments/delete-all | 전체 삭제 |
| POST | /api/auth/login | 관리자 로그인 |

## 환경 변수

```env
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=linkpay
DATABASE_PASSWORD=linkpay123
DATABASE_NAME=linkpay
ADMIN_PASSWORD=admin1234
JWT_SECRET=your-secret-key
TOSS_CLIENT_KEY=test_ck_xxx
TOSS_SECRET_KEY=test_sk_xxx
```

## 프로젝트 구조

```
toss-linkpay/
├── docker-compose.yml
├── backend/
│   └── src/
│       ├── auth/
│       └── payment/
└── frontend/
    └── src/
        └── pages/
            ├── HomePage.tsx
            ├── PaymentPage.tsx
            ├── PaymentResultPage.tsx
            ├── AdminPage.tsx
            └── AdminLoginPage.tsx
```

## 라이선스

MIT