const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { addUser, findUserByEmail } = require('../models/userModel');

const register = (req, res) => {
  const { full_name, role, time_zone, email, password } = req.body;
  console.log('Registering user:', { full_name, role, time_zone, email });

  if (!full_name || !role || !time_zone || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  findUserByEmail(email, (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (result.length > 0) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = [full_name, role, time_zone, email, hashedPassword];

    addUser(newUser, (err, result) => {
      if (err) return res.status(500).json({ message: 'Failed to register user' });
      res.status(201).json({ message: 'User registered successfully' });
    });
  });
};

const login = (req, res) => {
  const { email, password } = req.body;

  findUserByEmail(email, (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (result.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = result[0];
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Login successful', token });
  });
};

module.exports = { register, login };
