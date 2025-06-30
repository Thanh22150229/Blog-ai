const pool = require('../config/db');

const createUser = async (user) => {
  const { id, name, email, password } = user;
  const result = await pool.query(
    'INSERT INTO users (id, name, email, password) VALUES ($1, $2, $3, $4) RETURNING id, name, email',
    [id, name, email, password]
  );
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

module.exports = {
  createUser,
  findUserByEmail,
};
