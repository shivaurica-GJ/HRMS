const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');
const { DOMAIN } = require('../config/emailDomain');

// Admin signup
exports.signupAdmin = async (req, res) => {
  const { 
    email, 
    password, 
    fullName, 
    phoneNumber, 
    businessName, 
    gstNumber, 
    businessAddress 
  } = req.body;

  if (!email.endsWith('shivaurica.com' || email.endsWith('gmail.com'))) {
    return res.status(400).json({ msg: 'Invalid email domain' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({
      email,
      password,
      role: 'admin',
      fullName,
      phoneNumber,
      businessName,
      gstNumber,
      businessAddress
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Create token
    const payload = { id: user.id };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', email);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Incorrect password');
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = { id: user.id, role: user.role };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' }, (err, token) => {
      if (err) {
        console.error('JWT error:', err);
        return res.status(500).json({ msg: 'Token generation failed' });
      }

      console.log('Login successful');
      res.json({ token, role: user.role });
    });
  } catch (err) {
    console.error('Login catch error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};
