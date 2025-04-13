const express = require('express');
const router = express.Router();
const {
  createBusiness,
  inviteEmployee,
  getEmployees,
  handleInvitation,
  getMyBusiness,
  removeEmployee
} = require('../controllers/businessController');
const { protect, authorize, businessAuthorize } = require('../middleware/authMiddleware');

router.post('/', protect, createBusiness);
router.post(
  '/:businessId/invite',
  protect,
  businessAuthorize('admin'), // Only business owners/admins can invite
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

router.get(
  '/my-business',
  protect,
  getMyBusiness
);

router.delete(
  '/:businessId/employees/:employeeId',
  protect,
  businessAuthorize('admin'),
  removeEmployee
);

module.exports = router;