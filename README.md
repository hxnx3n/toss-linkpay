# LinkPay - 간편 결제 링크 서비스

결제 UUID를 생성하고, 해당 UUID로 결제를 진행할 수 있는 간편 결제 링크 서비스입니다.

## 기술 스택

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: NestJS + TypeORM
- **Database**: PostgreSQL
- **Container**: Docker & Docker Compose

## 시작하기

### Docker로 실행 (권장)

```bash
# 프로젝트 루트에서 실행
docker-compose up --build
```

서비스가 시작되면:
- Frontend: http://localhost (nginx)
- Backend API: http://localhost:3000
- PostgreSQL: localhost:5432

### 로컬 개발 환경

#### Backend

```bash
cd backend
pnpm install
pnpm run start:dev
```

#### Frontend

```bash
cd frontend
pnpm install
pnpm run dev
```

## API 엔드포인트

### 결제 링크 생성
```
POST /api/payments
{
  "title": "결제 제목",
  "amount": 10000,
  "description": "설명 (선택)"
}
```

### 결제 정보 조회
```
GET /api/payments/:uuid
```

### 결제 처리
```
POST /api/payments/:uuid/process
{
  "payerName": "홍길동",
  "payerEmail": "test@example.com",
  "cardNumber": "1234567890123456",
  "expiryDate": "1225",
  "cvv": "123"
}
```

### 결제 취소
```
POST /api/payments/:uuid/cancel
```

### 모든 결제 목록 조회
```
GET /api/payments
```

## 사용 방법

1. 홈페이지에서 결제 제목, 금액, 설명을 입력하여 결제 링크 생성
2. 생성된 UUID를 복사하거나 결제 페이지로 이동
3. 결제 페이지에서 결제 정보 입력 후 결제 진행
4. 결제 결과 확인

## 테스트

- 카드번호가 `0000`으로 시작하면 결제 실패 처리됩니다.
- 그 외의 카드번호는 결제 성공 처리됩니다.

## 프로젝트 구조

```
toss-linkpay/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       └── payment/
│           ├── payment.module.ts
│           ├── payment.controller.ts
│           ├── payment.service.ts
│           ├── entities/
│           │   └── payment.entity.ts
│           └── dto/
│               ├── create-payment.dto.ts
│               └── process-payment.dto.ts
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── index.css
        └── pages/
            ├── HomePage.tsx
            ├── PaymentPage.tsx
            └── PaymentResultPage.tsx
```