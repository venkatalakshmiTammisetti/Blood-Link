# 🩸 Blood-Link — Emergency Blood Donation System

Production-structured full-stack app connecting **patients**, **verified donors**, and **admins** for emergency blood coordination.

## Tech Stack

| Layer | Stack |
|-------|--------|
| Frontend | React (Vite), TailwindCSS, Axios, React Router |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Auth | JWT + bcrypt |
| OTP | Mock (logged to server console) |

## Project Structure

```
bloodlink/
├── backend/
│   ├── controllers/
│   ├── db/
│   │   ├── connection.js
│   │   └── schema.sql
│   ├── middleware/
│   ├── routes/
│   ├── scripts/
│   ├── utils/
│   └── server.js
├── frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── utils/
└── README.md
```

## Prerequisites

- **Node.js** 18+
- **MySQL** 8+

## Setup

### 1. Database

```bash
mysql -u root -p < backend/db/schema.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL password and JWT_SECRET
npm install
node scripts/create-admin.js   # optional admin user
node server.js
```

API runs at **http://localhost:5000**

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:5173**

## Default Admin (optional)

After running `create-admin.js`:

- Email: `admin@bloodlink.com`
- Password: `Admin@123`

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Register donor/patient |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/send-otp` | Send mock OTP |
| POST | `/api/auth/verify-otp` | Verify OTP |
| GET | `/api/auth/me` | Current user (JWT) |
| GET | `/api/user/:id` | Get profile |
| PUT | `/api/user/:id` | Update profile |
| POST | `/api/request/create` | Patient creates request |
| GET | `/api/request/nearby` | Donor nearby requests |
| GET | `/api/request/mine` | User request history |
| GET | `/api/request/active` | Active request |
| PUT | `/api/request/accept/:id` | Donor accepts |
| PUT | `/api/request/complete/:id` | Mark completed |
| GET | `/api/notifications/:userId` | List notifications |
| PUT | `/api/notifications/:userId/read` | Mark all read |
| GET | `/api/admin/stats` | Admin stats |
| GET | `/api/admin/requests` | All requests (admin) |

Frontend API calls are centralized in `frontend/src/api/endpoints.js`.

## User Flow

1. **Donor** registers → OTP verify → Aadhaar + profile → dashboard
2. **Patient** registers → creates blood request
3. Backend matches donors (blood group, available, verified, age ≥ 18, within radius)
4. Donors get **notifications** → accept request
5. Donor opens **Google Maps** link to patient location
6. Either party marks request **completed**

## Mock OTP

OTP is printed in the **backend terminal** and returned in the API response (`mockOtp`) for development. Set `MOCK_OTP=123456` in `.env` for a fixed OTP.

## Environment Variables

See `backend/.env.example`:

- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`
- `MATCH_RADIUS_KM` (default 50)

## License

MIT
