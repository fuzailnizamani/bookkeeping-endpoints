const express = require('express');
const router = express.Router();
const { uploadReceipt, getReceipt } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

router.post('/receipt', protect, uploadReceipt);
router.get('/receipt/:id', protect, getReceipt);

module.exports = router;