const express = require('express');
const router = express.Router();
const userController = require('../../controllers/usersController');
const { protect , authorize} = require('../.././middleware/authMiddleware');

router.route('/')
  .get(authorize('Admin'), userController.getAllUser)
  .delete(userController.deleteUser);

router.route('/:id')
  .get(userController.getUser);

module.exports = router;