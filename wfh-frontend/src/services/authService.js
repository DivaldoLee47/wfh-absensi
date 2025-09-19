const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { 
  createUser, 
  findUserByEmail, 
  getUserWithoutPassword 
} = require('../models/User');

const registerUser = async (userData) => {
  const { full_name, email, password, role } = userData;

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error('Email already in use');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const userId = await createUser({
    full_name,
    email,
    password: hashedPassword,
    role: role || 'employee'
  });

  return { userId, message: 'User registered successfully' };
};

const loginUser = async (credentials) => {
  const { email, password } = credentials;

  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });

  return {
    token,
    user: getUserWithoutPassword(user),
    message: 'Logged in successfully'
  };
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyToken
};
