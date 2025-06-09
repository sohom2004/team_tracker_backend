const db = require('../db/db');

const addUser = (userData, callback) => {
  const sql = `INSERT INTO users (full_name, role, time_zone, email, password, status, team) VALUES (?, ?, ?, ?, ?, 'available', '?')`;
  db.query(sql, userData, callback);
};

const findUserByEmail = (email, callback) => {
  const sql = `SELECT * FROM users WHERE email = ?`;
  db.query(sql, [email], callback);
};

module.exports = { addUser, findUserByEmail };
