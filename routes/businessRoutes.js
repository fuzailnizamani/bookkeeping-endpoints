const express = require('express');
const router = express.Router();
const {
  createBusiness,
  inviteEmployee,
  getEmployees,
  handleInvitation
} = require('../controllers/businessController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, createBusiness);
router.post(
  '/:businessId/invite',
  protect,
  authorize('admin'), // Only business owners/admins can invite
  inviteEmployee
);
router.get(
  '/:businessId/employees',
  protect,
  getEmployees
);

router.put(
  '/invite/accept',
  protect,
  handleInvitation
);
router.put(
  '/invite/reject',
  protect,
  handleInvitation
);

module.exports = router;