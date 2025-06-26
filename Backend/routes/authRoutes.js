const express = require('express');
const router = express.Router();
const { signupAdmin, login } = require('../controllers/authController');

router.post('/signup', signupAdmin);
router.post('/login', login);

module.exports = router;