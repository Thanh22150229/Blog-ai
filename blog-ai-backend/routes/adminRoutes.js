const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUserRole,
  updateSubscription,
  deleteUser,
  getUpgradeRequests, // Thêm hàm mới
} = require('../controllers/adminController');
const verifyAdmin = require('../middlewares/adminMiddleware');

// Định tuyến cho admin
router.get('/users', verifyAdmin, getUsers);
router.get('/users/:id', verifyAdmin, getUser);
router.patch('/users/:id/role', verifyAdmin, updateUserRole);
router.patch('/users/:id/subscription', verifyAdmin, updateSubscription);
router.delete('/users/:id', verifyAdmin, deleteUser);

// Thêm endpoint cho yêu cầu nâng cấp
router.get('/upgrade-requests', verifyAdmin, getUpgradeRequests);

module.exports = router;