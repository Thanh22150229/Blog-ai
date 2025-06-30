const pool = require('../config/db');

const createPost = async (post) => {
  const { id, user_id, title, content, image, status, summary, schedule_date } = post;
  const result = await pool.query(
    'INSERT INTO posts (id, user_id, title, content, image, status, summary, schedule_date, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING *',
    [id, user_id, title, content, image || null, status || 'Draft', summary || null, schedule_date || null]
  );
  return result.rows[0];
};

module.exports = {
  createPost,
};