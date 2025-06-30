"use strict";

require('dotenv').config();

var express = require('express');

var cors = require('cors');

var authRoutes = require('./routes/authRoutes');

var postRoutes = require('./routes/postRoutes');

var userRoutes = require('./routes/userRoutes');

var paymentRoutes = require('./routes/paymentRoutes');

var adminRoutes = require('./routes/adminRoutes');

var upload = require('./config/multerConfig');

var multer = require('multer');

var sequelize = require('./config/sequelize'); // Import Sequelize


var app = express(); // Cấu hình CORS

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
  optionsSuccessStatus: 200
})); // Middleware parse JSON và FormData

app.use(express.json({
  limit: '10mb'
}));
app.use(express.urlencoded({
  extended: true,
  limit: '10mb'
})); // Phục vụ file tĩnh từ thư mục uploads

app.use('/uploads', express["static"]('uploads', {
  setHeaders: function setHeaders(res, path) {
    res.set('Cache-Control', 'public, max-age=31557600');
  }
})); // Middleware xử lý lỗi từ Multer

app.use(function (err, req, res, next) {
  if (err instanceof multer.MulterError) {
    console.error('Multer Error:', err.stack);
    return res.status(400).json({
      msg: "L\u1ED7i t\u1EA3i t\u1EC7p: ".concat(err.message),
      error: err.stack
    });
  } else if (err) {
    console.error('General Error:', err.stack);
    return res.status(500).json({
      msg: "L\u1ED7i m\xE1y ch\u1EE7: ".concat(err.message),
      error: err.stack
    });
  }

  next();
}); // Định tuyến API

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/user', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes); // Xử lý lỗi không tìm thấy route

app.use(function (req, res) {
  res.status(404).json({
    msg: 'Route không tồn tại.'
  });
}); // Xử lý lỗi chung

app.use(function (err, req, res, next) {
  console.error('Lỗi không xử lý:', err.stack);
  res.status(500).json({
    msg: 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.',
    error: err.stack
  });
});
var PORT = process.env.PORT || 5000;
app.listen(PORT, function _callee() {
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          console.log("Server \u0111ang ch\u1EA1y t\u1EA1i http://localhost:".concat(PORT, " - Ng\xE0y: ").concat(new Date().toLocaleString('vi-VN', {
            timeZone: 'Asia/Ho_Chi_Minh'
          })));
          _context.prev = 1;
          _context.next = 4;
          return regeneratorRuntime.awrap(sequelize.authenticate());

        case 4:
          console.log('Kết nối PostgreSQL thành công');
          _context.next = 7;
          return regeneratorRuntime.awrap(sequelize.sync({
            alter: true
          }));

        case 7:
          // Sử dụng alter để thay đổi cấu trúc mà không xóa dữ liệu
          console.log('Mô hình đã được đồng bộ hóa');
          _context.next = 13;
          break;

        case 10:
          _context.prev = 10;
          _context.t0 = _context["catch"](1);
          console.error('Lỗi kết nối hoặc đồng bộ hóa:', _context.t0);

        case 13:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[1, 10]]);
});