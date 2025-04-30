const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  getRecentTransactions,
  getChartData
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/summary', protect, getDashboardSummary);
router.get('/recent-transactions', protect, getRecentTransactions);
router.get('/chart-data', protect, getChartData);

module.exports = router;