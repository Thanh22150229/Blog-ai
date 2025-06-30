const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const Payment = require('../models/Payment'); // Giả sử bạn đã tạo model Payment

router.post('/confirm', verifyToken, async (req, res) => {
  const { plan, amount, userId } = req.body;
  try {
    console.log(`Yêu cầu nâng cấp từ user ${userId} - Plan: ${plan}, Amount: ${amount}`);
    await Payment.create({ userId, plan, amount, status: 'pending' });
    res.status(200).json({ msg: 'Yêu cầu đã được gửi' });
  } catch (err) {
    console.error('Lỗi xác nhận thanh toán:', err);
    res.status(500).json({ msg: 'Lỗi máy chủ nội bộ' });
  }
});

module.exports = router;