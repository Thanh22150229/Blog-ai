const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const verifyAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ msg: 'Không tìm thấy token' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Kiểm tra role là admin
    const user = await pool.query('SELECT role FROM users WHERE id = $1', [decoded.id]);
    if (!user.rows[0] || user.rows[0].role !== 'admin') {
      return res.status(403).json({ msg: 'Bạn không có quyền truy cập admin' });
    }

    next();
  } catch (error) {
    res.status(403).json({ msg: 'Token không hợp lệ hoặc hết hạn' });
  }
};

module.exports = verifyAdmin;