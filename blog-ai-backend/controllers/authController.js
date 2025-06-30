const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { createUser, findUserByEmail } = require('../models/userModel');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Kiểm tra email đã tồn tại
    const existingUser = await findUserByEmail(email);
    if (existingUser) return res.status(400).json({ msg: 'Email đã tồn tại' });

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const newUser = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
    };

    const user = await createUser(newUser);

    res.status(201).json({ msg: 'Đăng ký thành công', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Lỗi server' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user) return res.status(400).json({ msg: 'Email hoặc mật khẩu không đúng' });

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Email hoặc mật khẩu không đúng' });

    // Tạo token JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '2d' }
    );

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Lỗi server' });
  }
};

module.exports = {
  register,
  login,
};
