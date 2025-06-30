// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');

router.get('/me', verifyToken, (req, res) => {
  res.json({ user: req.user }); // req.user đã được gán từ middleware
});

module.exports = router;
