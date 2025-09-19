const { db } = require('../config/database');

const createAttendance = async (attendanceData) => {
  const { user_id, clock_in, photo_url } = attendanceData;
  const sql = 'INSERT INTO attendances (user_id, clock_in, photo_url) VALUES (?, ?, ?)';
  const [result] = await db.query(sql, [user_id, clock_in, photo_url]);
  return result.insertId;
};

const findAttendancesByUserId = async (userId) => {
  const sql = 'SELECT * FROM attendances WHERE user_id = ? ORDER BY clock_in DESC';
  const [attendances] = await db.query(sql, [userId]);
  return attendances;
};

const findAllAttendancesWithUserDetails = async () => {
  const sql = `
    SELECT 
      a.id, 
      a.clock_in, 
      a.photo_url, 
      a.created_at,
      u.full_name, 
      u.email,
      u.id as user_id
    FROM attendances a 
    JOIN users u ON a.user_id = u.id 
    ORDER BY a.clock_in DESC
  `;
  const [records] = await db.query(sql);
  return records;
};

const getTodayAttendance = async (userId) => {
  const sql = `
    SELECT * FROM attendances 
    WHERE user_id = ? 
    AND DATE(clock_in) = CURDATE()
  `;
  const [attendances] = await db.query(sql, [userId]);
  return attendances.length > 0 ? attendances[0] : null;
};

const getTodayAttendanceCount = async () => {
  const sql = `
    SELECT COUNT(DISTINCT user_id) as count 
    FROM attendances 
    WHERE DATE(clock_in) = CURDATE()
  `;
  const [result] = await db.query(sql);
  return result[0].count;
};

const getAttendanceStatsByDate = async (date) => {
  const sql = `
    SELECT 
      u.role,
      COUNT(DISTINCT a.user_id) as count
    FROM attendances a
    JOIN users u ON a.user_id = u.id
    WHERE DATE(a.clock_in) = ?
    GROUP BY u.role
  `;
  const [results] = await db.query(sql, [date]);
  
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

module.exports = {
  createAttendance,
  findAttendancesByUserId,
  findAllAttendancesWithUserDetails,
  getTodayAttendance,
  getTodayAttendanceCount,
  getAttendanceStatsByDate
};
