const express = require('express');
const router = express.Router();
const {
  addTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/add', protect, addTransaction);
router.get('/', protect, getTransactions);
router.get('/summary', protect, getSummary);
router.get('/:id', protect, getTransaction);
router.put('/:id', protect, updateTransaction);
router.delete('/:id', protect, deleteTransaction);

module.exports = router;