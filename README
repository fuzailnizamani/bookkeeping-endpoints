# 📚 Bookkeeping API

A fully functional **RESTful API** for bookkeeping — including **user authentication**, **transactions**, **categories**, **reports**, and secure **email verification**.  
Built as a **personal project** to practice and demonstrate my **backend development skills** using **Node.js**, **Express.js**, and **MongoDB**.

## 🚀 Features
- ✅ User registration & login with JWT access/refresh tokens  
- ✅ Secure password reset via email token  
- ✅ Update and verify email address with secure token  
- ✅ CRUD operations for businesses, transactions, categories, and reports  
- ✅ Role-based access control (Admin/User)  
- ✅ Dashboard endpoints for summary stats  
- ✅ Centralized error handling & request logging  
- ✅ Tested & documented with a [Postman Collection](https://documenter.getpostman.com/view/41653364/2sB34ZrQE3)

## ⚙️ Tech Stack
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB + Mongoose  
- **Authentication:** JWT, Bcrypt, Cookies  
- **Email Service:** Nodemailer  
- **Utilities:** dotenv, cookie-parser, custom logger

## 📂 Project Structure
📦 bookkeeping-endpoints
┣ 📂 config          # DB connection
┣ 📂 controllers     # Route handlers
┣ 📂 models          # Mongoose schemas
┣ 📂 routes          # API endpoints
┣ 📂 middleware      # Auth, error handler, logger
┣ 📂 utils           # Helper functions (email, error response)
┣ 📄 server.js       # Entry point
┗ 📄 .env.example    # Sample environment variables

## 📬 API Documentation

Fully documented on [![Postman](https://img.shields.io/badge/Postman-orange?logo=postman&logoColor=white)](https://documenter.getpostman.com/view/41653364/2sB34ZrQE3)

## 🛠️ Getting Started

### 1️⃣ **Clone the Repository**
```bash
git clone https://github.com/fuzailnizamani/bookkeeping-endpoints.git
cd bookkeeping-endpoints
```

### 2️⃣ **Install Dependencies**

```bash
npm install
```

### 3️⃣ **Set up Environment Variables**

Copy `.env.example` to `.env` and fill in your own values:

```env
PORT=3000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=you@example.com
EMAIL_PASS=your_email_password
BASE_URL=http://localhost:3000
```

### 4️⃣ Start the App

```bash
npm run dev
```

## 🚦 Available Routes

### 🔐 Auth & User
* `POST /api/auth/register` – Register
* `POST /api/auth/login` – Login
* `POST /api/auth/refreshToken` – Refresh access token
* `POST /api/auth/forgot-password` – Request password reset
* `PUT /api/auth/reset-password/:resettoken` – Reset password
* `PUT /api/auth/update` – Update profile & email
* `PUT /api/auth/verify-email-change/:token` – Verify new email

### 📊 Business, Transactions, and More

* `GET/POST/PUT/DELETE /api/business`
* `GET/POST/PUT/DELETE /api/transactions`
* `GET/POST/PUT/DELETE /api/categories`
* `GET /api/reports`
* `GET /api/dashboard`

➡️ Use the [Postman Collection](https://documenter.getpostman.com/view/41653364/2sB34ZrQE3) for pre-configured examples.

## ✨ About

This backend API was built by **Fuzail Ahmed** as a self-learning project to sharpen skills in **Node.js**, **Express.js**, and **MongoDB**.
It features **secure authentication**, **email verification**, **role-based access**, and is structured with modular design for real-world bookkeeping systems.

## 📢 Connect with Me

[![LinkedIn](https://img.shields.io/badge/LinkedIn-blue?logo=linkedin\&logoColor=white)](https://www.linkedin.com/in/fuzail-nizamani-4a2256354)
[![GitHub](https://img.shields.io/badge/GitHub-black?logo=github\&logoColor=white)](https://github.com/fuzailnizamani)
[![Postman](https://img.shields.io/badge/Postman-orange?logo=postman\&logoColor=white)](https://documenter.getpostman.com/view/41653364/2sB34ZrQE3)

## 🪪 License

Open source — for educational and demonstration purposes only.
