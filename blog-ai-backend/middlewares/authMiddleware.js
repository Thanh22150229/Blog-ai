const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ msg: 'Không tìm thấy token' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // lưu thông tin user đã decode
    next();
  } catch (error) {
    res.status(403).json({ msg: 'Token không hợp lệ hoặc hết hạn' });
  }
};

module.exports = verifyToken;
