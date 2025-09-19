const { db } = require('../config/database');

const createUser = async (userData) => {
  const { full_name, email, password, role } = userData;
  const sql = 'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)';
  const [result] = await db.query(sql, [full_name, email, password, role]);
  return result.insertId;
};

const findUserByEmail = async (email) => {
  const sql = 'SELECT * FROM users WHERE email = ?';
  const [users] = await db.query(sql, [email]);
  return users.length > 0 ? users[0] : null;
};

const findAllUsers = async () => {
  const sql = 'SELECT id, full_name, email, role, created_at FROM users';
  const [users] = await db.query(sql);
  return users;
};

const updateUser = async (id, updateData) => {
  const { full_name, email, role } = updateData;
  const sql = 'UPDATE users SET full_name = ?, email = ?, role = ? WHERE id = ?';
  const [result] = await db.query(sql, [full_name, email, role, id]);
  return result.affectedRows > 0;
};

const updateUserProfile = async (id, updateData) => {
  const { full_name, email, password } = updateData;
  
  if (email) {
    const existingUser = await findUserByEmail(email);
    if (existingUser && existingUser.id !== parseInt(id)) {
      throw new Error('Email already in use');
    }
  }
  
  let sql, params;
  
  if (password) {
    sql = 'UPDATE users SET full_name = ?, email = ?, password = ? WHERE id = ?';
    params = [full_name, email, password, id];
  } else {
    sql = 'UPDATE users SET full_name = ?, email = ? WHERE id = ?';
    params = [full_name, email, id];
  }
  
  const [result] = await db.query(sql, params);
  return result.affectedRows > 0;
};

const findUserById = async (id) => {
  const sql = 'SELECT * FROM users WHERE id = ?';
  const [users] = await db.query(sql, [id]);
  return users.length > 0 ? users[0] : null;
};

const getUserStatistics = async () => {
  const sql = `
    SELECT 
      role,
      COUNT(*) as count
    FROM users 
    GROUP BY role
  `;
  const [results] = await db.query(sql);
  
  const stats = {
    total: 0,
    employees: 0,
    admins: 0
  };
  
  results.forEach(row => {
    stats.total += row.count;
    if (row.role === 'employee') {
      stats.employees = row.count;
    } else if (row.role === 'admin') {
      stats.admins = row.count;
    }
  });
  
  return stats;
};

const getUserWithoutPassword = (user) => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  findAllUsers,
  updateUser,
  updateUserProfile,
  getUserStatistics,
  getUserWithoutPassword
};
