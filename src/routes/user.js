const express = require('express');
const UserController = require('../controllers/UserController');

const router = express.Router();

// router.get('/', UserController.getAllUsers);
router.get('/', UserController.getUser);
router.post('/', UserController.createUser);
router.put('/', UserController.updatedUser);
// router.delete('/:id', UsersController.deleteUser);
router.get('/login', UserController.loginUser);

module.exports = router;