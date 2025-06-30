require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const upload = require('./config/multerConfig');
const multer = require('multer');
const sequelize = require('./config/sequelize'); // Import Sequelize

const app = express();

// Cấu hình CORS
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Middleware parse JSON và FormData
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Phục vụ file tĩnh từ thư mục uploads
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path) => {
    res.set('Cache-Control', 'public, max-age=31557600');
  }
}));

// Middleware xử lý lỗi từ Multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer Error:', err.stack);
    return res.status(400).json({ msg: `Lỗi tải tệp: ${err.message}`, error: err.stack });
  } else if (err) {
    console.error('General Error:', err.stack);
    return res.status(500).json({ msg: `Lỗi máy chủ: ${err.message}`, error: err.stack });
  }
  next();
});

// Định tuyến API
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/user', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Xử lý lỗi không tìm thấy route
app.use((req, res) => {
  res.status(404).json({ msg: 'Route không tồn tại.' });
});

// Xử lý lỗi chung
app.use((err, req, res, next) => {
  console.error('Lỗi không xử lý:', err.stack);
  res.status(500).json({ msg: 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.', error: err.stack });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Server đang chạy tại http://localhost:${PORT} - Ngày: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`);
  try {
    await sequelize.authenticate();
    console.log('Kết nối PostgreSQL thành công');
    await sequelize.sync({ alter: true }); // Sử dụng alter để thay đổi cấu trúc mà không xóa dữ liệu
    console.log('Mô hình đã được đồng bộ hóa');
  } catch (error) {
    console.error('Lỗi kết nối hoặc đồng bộ hóa:', error);
  }
});