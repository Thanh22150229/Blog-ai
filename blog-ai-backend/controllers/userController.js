const User = require('../models/User');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'id name email'); // Lấy danh sách cơ bản
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lấy danh sách người dùng.' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: 'Người dùng đã được xóa.' });
  } catch (error) {
    res.status(500).json({ error: 'Không thể xóa người dùng.' });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;
    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });
    res.status(200).json({ user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: 'Không thể cập nhật thông tin người dùng.' });
  }
};

module.exports = { getAllUsers, deleteUser, updateUser };
