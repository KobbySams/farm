const express = require('express');
const router = express.Router();
const {
  loginUser,
  registerUser,
} = require('../controllers/auth.controller.js');

// @desc    Auth user & get token
// @route   POST /api/users/login
router.post('/login', loginUser);

// @desc    Register a new user
// @route   POST /api/users/register
router.post('/register', registerUser);

module.exports = router;