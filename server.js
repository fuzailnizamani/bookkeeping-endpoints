const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { logger } = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
dotenv.config();
const app = express();
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/api/users');
const isEmailVerified = require('./routes/auth');
const businessRoutes = require('./routes/businessRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cookieParser = require('cookie-parser');
// Connect to MongoDB
console.log("Database URI:", process.env.DATABASE_URI);
connectDB();

const PORT = process.env.PORT || 3000;

// cutom middleeware logger
app.use(logger);

app.use(cors());
app.use(express.json());
// middleware for cookies
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/auth', isEmailVerified);
app.use('/api/business', businessRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
//...after routes
app.use(errorHandler);

mongoose.connection.once('open', () => {
  console.log('Connented to MongoDB');
  app.listen(PORT, (() => console.log(`Server running on port ${PORT}`)));
});