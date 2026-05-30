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


bloodlink/
├── backend/
│ ├── controllers/
│ ├── db/
│ │ ├── connection.js
│ │ └── schema.sql
│ ├── middleware/
│ ├── routes/
│ ├── scripts/
│ ├── utils/
│ └── server.js
├── frontend/
│ └── src/
│ ├── api/
│ ├── components/
│ ├── context/
│ ├── pages/
│ └── utils/
└── README.md


## Prerequisites

- Node.js 18+
- MySQL 8+

## Setup

### 1. Database

```bash
mysql -u root -p < backend/db/schema.sql
2. Backend
cd backend
cp .env.example .env
npm install
node scripts/create-admin.js
node server.js

Runs at:

http://localhost:5000
3. Frontend
cd frontend
npm install
npm run dev

Runs at:

http://localhost:5173
Default Admin
Email: admin@bloodlink.com
Password: Admin@123
API Routes
/api/auth/register → Register user
/api/auth/login → Login
/api/auth/send-otp → Send OTP
/api/auth/verify-otp → Verify OTP
/api/request/create → Create blood request
/api/request/nearby → Nearby donors
/api/request/accept/:id → Accept request
/api/request/complete/:id → Complete request
User Flow
Donor registers → OTP verification
Patient creates request
System finds matching donors
Donor accepts request
Location shared via Google Maps
Request completed
Mock OTP

OTP is printed in backend terminal for testing.

License

MIT


---

## 🔴 STEP 3: Save file

Press:

Ctrl + S


---

## 🔴 STEP 4: Go to terminal

Run:

```bash
git add README.md
🔴 STEP 5: Commit changes
git commit -m "Fix README merge conflict and clean structure"
🔴 STEP 6: Push to GitHub
git push origin main
🎉 RESULT AFTER THIS

✔ No errors
✔ Clean README on GitHub
✔ Project properly uploaded
✔ Professional look for resume

💡 IMPORTANT (WHY THIS HAPPENED)

This happened because:

GitHub already had a README
Your local system also had a README
Git merged them and created conflict markers

Now we removed that properly 👍

If you want next step, I can help you:
✔ 
deploy frontend + backend live
✔ 
make README recruiter-level (with badges + screenshots)
✔ 
improve project for placements

Just tell 👍

i have pasted # 🩸 Blood-Link — Emergency Blood Donation System

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


bloodlink/
├── backend/
│ ├── controllers/
│ ├── db/
│ │ ├── connection.js
│ │ └── schema.sql
│ ├── middleware/
│ ├── routes/
│ ├── scripts/
│ ├── utils/
│ └── server.js
├── frontend/
│ └── src/
│ ├── api/
│ ├── components/
│ ├── context/
│ ├── pages/
│ └── utils/
└── README.md


## Prerequisites

- Node.js 18+
- MySQL 8+

## Setup

### 1. Database


bash
mysql -u root -p < backend/db/schema.sql
2. Backend
cd backend
cp .env.example .env
npm install
node scripts/create-admin.js
node server.js

Runs at:

http://localhost:5000
3. Frontend
cd frontend
npm install
npm run dev

Runs at:

http://localhost:5173
Default Admin
Email: admin@bloodlink.com
Password: Admin@123
API Routes
/api/auth/register → Register user
/api/auth/login → Login
/api/auth/send-otp → Send OTP
/api/auth/verify-otp → Verify OTP
/api/request/create → Create blood request
/api/request/nearby → Nearby donors
/api/request/accept/:id → Accept request
/api/request/complete/:id → Complete request
User Flow
Donor registers → OTP verification
Patient creates request
System finds matching donors
Donor accepts request
Location shared via Google Maps
Request completed
Mock OTP

OTP is printed in backend terminal for testing.

License

MIT


---

## 🔴 STEP 3: Save file

Press:

Ctrl + S


---

## 🔴 STEP 4: Go to terminal

Run:
bash
git add README.md
🔴 STEP 5: Commit changes
git commit -m "Fix README merge conflict and clean structure"
🔴 STEP 6: Push to GitHub
git push origin main this now tell me whst to do

Good — you’re almost done, but your README paste has format issues (missing code blocks + broken sections). Don’t worry, I’ll guide you clearly.

🔴 STEP 1 — FIX YOUR README FIRST (IMPORTANT)

Right now your README is broken because:

❌ Problems in your paste:
Project structure is NOT inside ``` code block
Backend setup commands are broken
Step numbers are mixed with text
GitHub will not render it properly
✅ COPY THIS CLEAN VERSION (replace entire README)

👉 Delete everything and paste this EXACTLY:

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


bloodlink/
├── backend/
│ ├── controllers/
│ ├── db/
│ │ ├── connection.js
│ │ └── schema.sql
│ ├── middleware/
│ ├── routes/
│ ├── scripts/
│ ├── utils/
│ └── server.js
├── frontend/
│ └── src/
│ ├── api/
│ ├── components/
│ ├── context/
│ ├── pages/
│ └── utils/
└── README.md


## Prerequisites

- Node.js 18+
- MySQL 8+

## Setup

### 1. Database

```bash
mysql -u root -p < backend/db/schema.sql
2. Backend
cd backend
cp .env.example .env
npm install
node scripts/create-admin.js
node server.js

Runs at:
http://localhost:5000

3. Frontend
cd frontend
npm install
npm run dev

Runs at:
http://localhost:5173

Default Admin
Email: admin@bloodlink.com
Password: Admin@123
API Routes
/api/auth/register → Register user
/api/auth/login → Login
/api/auth/send-otp → Send OTP
/api/auth/verify-otp → Verify OTP
/api/request/create → Create blood request
/api/request/nearby → Nearby donors
/api/request/accept/:id → Accept request
/api/request/complete/:id → Complete request
User Flow
Donor registers → OTP verification
Patient creates request
System finds matching donors
Donor accepts request
Location shared via Google Maps
Request completed
Mock OTP

OTP is printed in backend terminal for testing.

License

MIT


---

# 🔴 STEP 2 — SAVE FILE
Press:

Ctrl + S


---

# 🔴 STEP 3 — NOW PUSH TO GITHUB

Open terminal and run ONE BY ONE:

### 1. Add file
```bash id="git1"
git add README.md
2. Commit
git commit -m "Fix README and clean structure"
3. Push
git push origin main