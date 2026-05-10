# ServEase - Complete Setup Guide

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn
- Git

---

## 🔧 Backend Setup

### Step 1: Install Dependencies

```bash
cd servease-backend
npm install
```

### Step 2: Create Environment File

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

**Edit `.env` file:**

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/servease
# Or use MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/servease

# JWT Secret (Change this in production!)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Server Port
PORT=5000

# Environment
NODE_ENV=development
```

### Step 3: Start MongoDB

**Option A: Local MongoDB**
```bash
mongod
```

**Option B: MongoDB Atlas (Cloud)**
- Go to https://www.mongodb.com/cloud/atlas
- Create a cluster and get connection string
- Update `MONGO_URI` in `.env`

### Step 4: Run Backend

```bash
npm run dev
```

**Expected Output:**
```
MongoDB connected successfully
ServEase Backend running on port 5000
```

---

## 🎨 Frontend Setup

### Option A: Live Server (VS Code)

1. Install Live Server extension in VS Code
2. Right-click `front-end/ServEase1.html`
3. Select "Open with Live Server"
4. Frontend runs on `http://localhost:5500`

### Option B: Python HTTP Server

```bash
cd front-end
python -m http.server 8000
```

Frontend runs on `http://localhost:8000`

### Option C: Using npx

```bash
cd front-end
npx http-server
```

---

## 📊 API Endpoints Reference

### Authentication
```
POST   /api/auth/register       - Register new user
POST   /api/auth/login          - Login user
GET    /api/auth/me             - Get current user (Protected)
PUT    /api/auth/updateprofile  - Update profile (Protected)
GET    /api/auth/logout         - Logout (Protected)
```

### Users
```
GET    /api/users               - Get all users
GET    /api/users/:id           - Get user by ID
GET    /api/users/search/providers - Search providers
PUT    /api/users/:id           - Update user (Protected)
DELETE /api/users/:id           - Delete user (Protected)
```

### Bookings
```
POST   /api/bookings            - Create booking (Protected)
GET    /api/bookings/user       - Get user bookings (Protected)
GET    /api/bookings/provider   - Get provider tasks (Protected)
GET    /api/bookings/:bookingId - Get booking details (Protected)
PUT    /api/bookings/:bookingId/status  - Update status (Protected)
PUT    /api/bookings/:bookingId/cancel  - Cancel booking (Protected)
POST   /api/bookings/:bookingId/rate    - Add rating (Protected)
```

### Dashboard
```
GET    /api/dashboard           - Get dashboard data (Protected)
GET    /api/dashboard/bookings  - Get booking history (Protected)
GET    /api/dashboard/chores    - Get active chores (Protected)
GET    /api/dashboard/services  - Get completed services (Protected)
GET    /api/dashboard/task/:id  - Get task details (Protected)
POST   /api/dashboard/task/:id/cancel - Cancel task (Protected)
```

### Services
```
GET    /api/services            - Get all services
GET    /api/services/:id        - Get service by ID
GET    /api/services/category/:category - Get by category
POST   /api/services            - Create service (Admin)
```

### Providers
```
GET    /api/providers           - Get all providers
GET    /api/providers/:id       - Get provider by ID
POST   /api/providers/register  - Register as provider (Protected)
PUT    /api/providers/profile   - Update profile (Protected)
GET    /api/providers/tasks/list - Get provider tasks (Protected)
```

### Tasks
```
GET    /api/tasks               - Get all tasks
GET    /api/tasks/user/mytasks  - Get user tasks (Protected)
POST   /api/tasks               - Create task (Protected)
GET    /api/tasks/:id           - Get task by ID
PUT    /api/tasks/:id           - Update task (Protected)
PUT    /api/tasks/:id/accept    - Accept task (Protected)
PUT    /api/tasks/:id/complete  - Complete task (Protected)
PUT    /api/tasks/:id/cancel    - Cancel task (Protected)
DELETE /api/tasks/:id           - Delete task (Protected)
```

### Reviews & Payments
```
GET    /api/reviews             - Get reviews
POST   /api/reviews             - Create review

GET    /api/payments            - Get payments
POST   /api/payments            - Create payment
```

---

## 🧪 Testing the Application

### 1. Test Health Check

```bash
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "ServEase API is running",
  "timestamp": "2026-05-10T..."
}
```

### 2. Test User Registration

**Navigate to:** `http://localhost:5500/front-end/ServRegister.html`

1. Fill in user details
2. Select role (Client or Provider)
3. Click "Create account"
4. Should redirect to dashboard

### 3. Test Login

**Navigate to:** `http://localhost:5500/front-end/ServEase1.html`

1. Enter email and password
2. Select role
3. Click "Sign in"
4. Should redirect to dashboard

### 4. Test Booking

**Navigate to:** `http://localhost:5500/front-end/booking-modal.html`

1. Fill booking details
2. Select date and time
3. Enter service location
4. Click "Confirm Booking"

---

## 🐛 Troubleshooting

### Issue: MongoDB Connection Error

**Solution:**
```bash
# Check if MongoDB is running
# For local MongoDB:
mongod

# For MongoDB Atlas:
# - Verify connection string in .env
# - Check network access in Atlas settings
# - Whitelist your IP address
```

### Issue: CORS Error

**Check:**
- Backend is running on port 5000
- Frontend is making requests to `http://localhost:5000`
- CORS is enabled in server.js

### Issue: JWT Token Error

**Solution:**
- Clear localStorage in browser
- Login again to get new token
- Check JWT_SECRET in .env

### Issue: "authenticateToken is not a function"

**Fix in routes:**
```javascript
// Wrong:
const { authenticateToken } = require("../middleware/auth");

// Correct:
const { auth } = require("../middleware/auth");
router.post("/", auth, controller.method);
```

### Issue: MongoDB Models Not Found

**Fix:**
```bash
# Make sure models exist:
# servease-backend/models/User.js
# servease-backend/models/Booking.js
# servease-backend/models/Service.js
# servease-backend/models/Provider.js
```

---

## 📦 Project Structure

```
ServEase/
├── servease-backend/
│   ├── controllers/      # Business logic
│   ├── middleware/       # Auth, error handling
│   ├── models/           # Database schemas
│   ├── routes/           # API endpoints
│   ├── server.js         # Main server file
│   ├── package.json
│   └── .env.example
│
└── front-end/
    ├── ServEase1.html           # Login page
    ├── ServRegister.html        # Registration page
    ├── booking-modal.html       # Booking form
    ├── payment-checkout.html    # Payment page
    ├── order-tracking.html      # Tracking page
    └── ... (other pages)
```

---

## ✅ Checklist

- [ ] Node.js installed
- [ ] MongoDB running (local or Atlas)
- [ ] `.env` file created with MongoDB URI
- [ ] Backend dependencies installed (`npm install`)
- [ ] Backend running (`npm run dev`)
- [ ] Frontend server running (Live Server or http-server)
- [ ] Can access login page (`http://localhost:5500`)
- [ ] Can register user
- [ ] Can login user
- [ ] Can create booking

---

## 🚀 Deployment

### Deploy Backend (Heroku)

```bash
# Create Procfile
echo "web: node servease-backend/server.js" > Procfile

# Push to Heroku
git push heroku master
```

### Deploy Frontend (GitHub Pages / Netlify)

1. Commit all frontend files to GitHub
2. Go to repository settings
3. Enable GitHub Pages
4. Or use Netlify: `netlify deploy --prod front-end/`

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation
3. Check MongoDB connection
4. Verify .env configuration

---

**Happy coding! 🎉**
