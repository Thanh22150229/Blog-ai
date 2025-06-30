// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const { login, register } = require('../controllers/authController');

// Thêm route /me
router.get('/me', verifyToken, (req, res) => {
  res.json({ user: req.user }); // Sử dụng thông tin user từ middleware
});

router.post('/register', register);
router.post('/login', login);

module.exports = router;