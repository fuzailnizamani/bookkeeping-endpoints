const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI);
    // useUnifiedTopology: true,
    // useNewUrlParser: true
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

module.exports = connectDB;