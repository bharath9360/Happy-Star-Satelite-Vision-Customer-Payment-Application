# Happy Star Satellite Vision – Monorepo

## Project Structure

```
├── backend/              # Node.js + Express (deploy to Vercel)
│   ├── config/
│   │   └── supabase.js   # Supabase client
│   ├── middleware/
│   │   └── auth.js        # JWT auth middleware
│   ├── routes/
│   │   ├── auth.js        # POST /api/auth/login, /seed-admin
│   │   ├── payment.js     # POST /api/payment/create-order, /verify
│   │   ├── customers.js   # CRUD /api/customers
│   │   └── transactions.js# GET  /api/transactions
│   ├── utils/
│   │   └── sms.js         # SMS placeholder utility
│   ├── server.js          # Main Express app
│   ├── vercel.json        # Vercel deployment config
│   └── .env.example       # Copy to .env and fill credentials
│
├── frontend/             # React + Bootstrap 5 (deploy to Netlify)
│   ├── src/
│   │   ├── api/axios.js              # Axios instance with JWT interceptor
│   │   ├── constants/pricing.js     # Village prices, offers, discounts
│   │   ├── components/
│   │   │   ├── PrivateRoute.jsx     # JWT route guard
│   │   │   └── AdminNavbar.jsx      # Admin navigation
│   │   ├── pages/
│   │   │   ├── CustomerForm.jsx     # Public payment page
│   │   │   ├── Login.jsx            # Admin login
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx   # Stats + quick actions
│   │   │       ├── BoxList.jsx          # CRUD customer list
│   │   │       ├── InsertBox.jsx        # Add customer
│   │   │       ├── EditBox.jsx          # Edit customer
│   │   │       ├── PaymentList.jsx      # Today + All payments
│   │   │       └── PaymentStats.jsx     # Charts & statistics
│   │   ├── App.jsx                  # React Router setup
│   │   └── index.css               # Global dark theme CSS
│   └── .env.example
│
└── supabase_schema.sql   # Run in Supabase SQL Editor

```

## Quick Start

### 1. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** and paste + run `supabase_schema.sql`
3. Go to **Project Settings → API** and copy:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_KEY`

### 2. Razorpay Setup

1. Sign up at [razorpay.com](https://razorpay.com)
2. Go to **Dashboard → Settings → API Keys**
3. Generate test keys and copy:
   - `Key ID` → `RAZORPAY_KEY_ID`
   - `Key Secret` → `RAZORPAY_KEY_SECRET`

### 3. Backend Setup

```bash
cd backend
cp .env.example .env         # Fill in all values
npm install
npm run dev                  # Starts on http://localhost:5000
```

**After starting, seed the admin user (one-time):**
```bash
curl -X POST http://localhost:5000/api/auth/seed-admin
# Default credentials: admin / admin@123
```

### 4. Frontend Setup

```bash
cd frontend
cp .env.example .env         # Fill in VITE_BACKEND_URL and VITE_RAZORPAY_KEY_ID
npm install
npm run dev                  # Starts on http://localhost:5173
```

## Routes

| URL | Description |
|-----|-------------|
| `/` | Customer payment form (public) |
| `/login` | Admin login |
| `/admin` | Dashboard (protected) |
| `/admin/customers` | Box List – all customers CRUD |
| `/admin/customers/new` | Insert Box |
| `/admin/customers/:id/edit` | Edit Box |
| `/admin/payments` | Payment records (today + all) |
| `/admin/stats` | Payment statistics & charts |

## API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payment/create-order` | Create Razorpay order |
| POST | `/api/payment/verify` | Verify & record payment |

### Protected (JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Admin login → returns JWT |
| GET | `/api/customers` | List customers (search, village, status filters) |
| POST | `/api/customers` | Add customer |
| GET | `/api/customers/:id` | Get single customer |
| PUT | `/api/customers/:id` | Update customer |
| PATCH | `/api/customers/:id/status` | Toggle active/inactive |
| DELETE | `/api/customers/:id` | Delete customer |
| GET | `/api/transactions` | All transactions (search, date filters) |
| GET | `/api/transactions/today` | Today's payments |
| GET | `/api/transactions/stats` | Dashboard statistics |
| GET | `/api/transactions/:id` | Transaction detail + customer snapshot |

## Deployment

### Backend → Vercel
1. Push `backend/` to a GitHub repo
2. Connect to Vercel → set **Root Directory** to `backend`
3. Add all `.env` variables in Vercel Environment Variables
4. Deploy!

### Frontend → Netlify
1. Push `frontend/` to a GitHub repo
2. Connect to Netlify → **Build command**: `npm run build`, **Publish directory**: `dist`
3. Add `.env` variables in Netlify Environment Variables:
   - `VITE_BACKEND_URL` = your Vercel backend URL
   - `VITE_RAZORPAY_KEY_ID` = your Razorpay key ID
4. Deploy!

## Pricing Configuration

Edit `frontend/src/constants/pricing.js` to change village prices or add new villages.

## SMS Integration

Edit `backend/utils/sms.js` and uncomment the Fast2SMS block, then add `FAST2SMS_API_KEY` to your `.env`.
