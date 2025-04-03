const express = require('express');
const router = express.Router();
const userController = require('../../controllers/usersController');

router.route('/')
  .get(userController.getAllUser)
  .delete(userController.deleteUser);

router.route('/:id')
  .get(userController.getUser);

module.exports = router;