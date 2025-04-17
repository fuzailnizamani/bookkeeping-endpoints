const express = require('express');
const router = express.Router();
const {
  createCategory,
  getCategories,
  deleteCategory
} = require('../controllers/categoryController');
const { protect, businessAuthorize } = require('../middleware/authMiddleware');

router.post('/:businessId', protect, businessAuthorize('admin', 'owner'), createCategory);
router.get('/', protect, getCategories);
router.delete('/:businessId/:id', protect, businessAuthorize('admin', 'owner'), deleteCategory);

module.exports = router;