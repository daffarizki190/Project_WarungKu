# WarungKu — Full Library-Layer Architecture

Setiap layer adalah **library/package mandiri** yang bisa di-import secara independen.

---

## Struktur Lengkap

```
warungku/
│
├── packages/                          ← 10 Library packages
│   │
│   ├── lib-database/                  ← @warungku/lib-database
│   │   ├── data/
│   │   │   ├── products.json          ← JSON database (seed data)
│   │   │   ├── transactions.json      ← JSON database
│   │   │   └── debts.json             ← JSON database
│   │   └── src/index.js               ← JSON DB engine
│   │                                     exports: { read, write, findAll,
│   │                                               findById, insert, update,
│   │                                               remove, atomic, COLLECTIONS }
│   │
│   ├── lib-models/                    ← @warungku/lib-models
│   │   └── src/index.js               ← Domain entity factories
│   │                                     exports: { createProduct,
│   │                                               createTransaction,
│   │                                               createTransactionItem,
│   │                                               createDebt }
│   │
│   ├── lib-repositories/              ← @warungku/lib-repositories
│   │   └── src/index.js               ← Data access abstraction (no logic)
│   │                                     exports: { ProductRepository,
│   │                                               TransactionRepository,
│   │                                               DebtRepository }
│   │
│   ├── lib-middleware/                ← @warungku/lib-middleware
│   │   └── src/index.js               ← All Express middleware
│   │                                     exports: { requestLogger, errorLogger,
│   │                                               errorHandler, notFoundHandler,
│   │                                               asyncHandler, validateBody,
│   │                                               rateLimiter }
│   │
│   ├── lib-services/                  ← @warungku/lib-services
│   │   └── src/index.js               ← Business logic + validation
│   │                                     exports: { ProductService,
│   │                                               TransactionService,
│   │                                               DebtService }
│   │                                     (each has: validate(), CRUD, domain rules)
│   │
│   ├── lib-controllers/               ← @warungku/lib-controllers
│   │   └── src/index.js               ← HTTP req/res handlers
│   │                                     exports: { ProductController,
│   │                                               TransactionController,
│   │                                               DebtController }
│   │
│   ├── lib-routes/                    ← @warungku/lib-routes
│   │   └── src/index.js               ← Express Router modules
│   │                                     exports: { productRouter,
│   │                                               transactionRouter,
│   │                                               debtRouter,
│   │                                               mountRoutes }
│   │
│   ├── lib-store-product/             ← @warungku/lib-store-product
│   │   └── src/index.js               ← Zustand store (products)
│   │                                     import: { useProductStore }
│   │
│   ├── lib-store-cart/                ← @warungku/lib-store-cart
│   │   └── src/index.js               ← Zustand store (cart)
│   │                                     import: { useCartStore }
│   │
│   ├── lib-store-debt/                ← @warungku/lib-store-debt
│   │   └── src/index.js               ← Zustand store (debts)
│   │                                     import: { useDebtStore }
│   │
│   ├── lib-store-transaction/         ← @warungku/lib-store-transaction
│   │   └── src/index.js               ← Zustand store (transactions)
│   │                                     import: { useTransactionStore }
│   │
│   └── lib-ui/                        ← @warungku/lib-ui
│       └── src/
│           ├── components/index.jsx   ← Modal, Input, Badge, LoadingSpinner,
│           │                              StatCard, EmptyState
│           ├── hooks/index.js         ← useModal, useCookiePrefs (js-cookie)
│           ├── utils/index.js         ← formatRupiah, formatDate, formatDateTime,
│           │                              getInitials, getCategoryColor
│           └── index.js               ← Barrel re-export (semua di atas)
│
├── server/                            ← Express server (thin bootstrap only)
│   └── src/
│       └── server.js                  ← Security, parsers, mountRoutes(app)
│
└── client/                            ← React app (consumes library modules)
    └── src/
        ├── App.jsx                    ← Root: cookie routing, toast
        ├── index.js                   ← ReactDOM.createRoot
        ├── index.css                  ← Tailwind + design tokens
        ├── pages/
        │   ├── KasirPage.jsx          ← Consumes: lib-store-product, lib-store-cart,
        │   │                              lib-store-transaction, lib-store-debt
        │   ├── ProdukPage.jsx         ← Consumes: lib-store-product, lib-ui
        │   ├── HutangPage.jsx         ← Consumes: lib-store-debt, lib-ui
        │   └── RiwayatPage.jsx        ← Consumes: lib-store-transaction, lib-ui
        └── components/
            ├── ToastContainer.jsx
            ├── layout/Sidebar.jsx     ← useCookiePrefs dari lib-ui
            ├── layout/Topbar.jsx      ← useProductStore dari lib-store-product
            ├── kasir/ProductCard.jsx
            ├── kasir/CartPanel.jsx    ← useCartStore dari lib-store-cart
            ├── produk/ProductForm.jsx ← Input dari lib-ui
            └── hutang/DebtForm.jsx   ← Input dari lib-ui
```

---

## Dependency Chain (Backend)

```
server.js
  └── mountRoutes(app)
        └── @warungku/lib-routes
              ├── productRouter    → @warungku/lib-controllers → ProductController
              ├── transactionRouter                             → TransactionController
              └── debtRouter                                   → DebtController
                                         ↓
                              @warungku/lib-services
                              ├── ProductService.validate()
                              ├── TransactionService.processCheckout()  ← business rule
                              └── DebtService.processPay()              ← business rule
                                         ↓
                              @warungku/lib-repositories
                              ├── ProductRepository
                              ├── TransactionRepository
                              └── DebtRepository
                                         ↓
                              @warungku/lib-database  (JSON engine)
                                         ↓
                              data/products.json
                              data/transactions.json
                              data/debts.json
```

---

## Quick Start

```bash
# 1. Install
npm install

# 2. Setup env
cp .env.example .env

# 3. Run dev
npm run dev
# Server  → http://localhost:5000
# Client  → http://localhost:3000
```

## API Endpoints

| Method | Endpoint | Package |
|--------|----------|---------|
| GET    | /api/products | lib-routes → lib-controllers → lib-services → lib-repositories → lib-database |
| POST   | /api/products | (sama) |
| PUT    | /api/products/:id | (sama) |
| DELETE | /api/products/:id | (sama) |
| GET    | /api/transactions | (sama) |
| GET    | /api/transactions/summary/daily | (sama) |
| POST   | /api/transactions | atomic: deduct stock + save TX |
| GET    | /api/debts | (sama) |
| POST   | /api/debts | (sama) |
| PATCH  | /api/debts/:id/pay | atomic: mark paid + save TX |
| DELETE | /api/debts/:id | (sama) |
