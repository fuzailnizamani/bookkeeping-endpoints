const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { logger } = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
dotenv.config();
const app = express();
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn');

// Connect to MongoDB
console.log("Database URI:", process.env.DATABASE_URI);
connectDB();

const PORT = process.env.PORT || 3000;

// cutom middleeware logger
app.use(logger);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get('/', (req, res) => {
  res.send('hello world');
});

app.use(errorHandler);

mongoose.connection.once('open', () => {
  console.log('Connented to MongoDB');
  app.listen(PORT, (() => console.log(`Server running on port ${PORT}`)));
});