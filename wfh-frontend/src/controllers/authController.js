const { registerUser, loginUser } = require('../services/authService');

const register = async (req, res) => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Registration error:', error);

    if (error.message === 'Email already in use') {
      return res.status(409).json({ message: error.message });
    }

    res.status(500).json({ message: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  try {
    const result = await loginUser(req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error('Login error:', error);

    if (error.message === 'Invalid credentials') {
      return res.status(401).json({ message: error.message });
    }

    res.status(500).json({ message: 'Server error during login' });
  }
};

module.exports = {
  register,
  login
};
