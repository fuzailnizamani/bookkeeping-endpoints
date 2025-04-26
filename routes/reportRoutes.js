const express = require('express');
const router = express.Router();
const {
  getProfitLossReport,
  getCashFlowStatement,
  getExpenseBreakdown,
  getIncomeBreakdown
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/profit-loss', protect, getProfitLossReport);
router.get('/cash-flow', protect, getCashFlowStatement);
router.get('/expense-breakdown', protect, getExpenseBreakdown);
router.get('/income-breakdown', protect, getIncomeBreakdown);

module.exports = router;