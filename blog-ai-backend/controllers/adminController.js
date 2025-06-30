const pool = require('../config/db');

// Helper function để xử lý phản hồi và lỗi
const handleResponse = (res, data, statusCode = 200) => {
  res.status(statusCode).json(data);
};

const handleError = (res, err, defaultMessage = 'Lỗi máy chủ.') => {
  console.error('Lỗi:', err.message);
  handleResponse(res, { msg: err.message || defaultMessage }, 500);
};

// Kiểm tra vai trò hợp lệ
const validRoles = ['user', 'plus', 'pro', 'admin'];
const validPlans = ['plus', 'pro'];

// Controller functions
const getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, subscription_end_date, daily_post_count, last_post_date FROM users ORDER BY created_at DESC'
    );
    handleResponse(res, { users: result.rows });
  } catch (err) {
    handleError(res, err);
  }
};

const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, name, email, role, subscription_end_date, daily_post_count, last_post_date FROM users WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return handleResponse(res, { msg: 'Người dùng không tồn tại.' }, 404);
    }
    handleResponse(res, result.rows[0]);
  } catch (err) {
    handleError(res, err);
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !validRoles.includes(role)) {
      return handleResponse(res, { msg: 'Role không hợp lệ.' }, 400);
    }

    const result = await pool.query(
      'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, role',
      [role, id]
    );

    if (result.rows.length === 0) {
      return handleResponse(res, { msg: 'Người dùng không tồn tại.' }, 404);
    }

    handleResponse(res, result.rows[0]);
  } catch (err) {
    handleError(res, err);
  }
};

const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { plan, end_date } = req.body;

    if (!plan || !validPlans.includes(plan) || !end_date) {
      return handleResponse(res, { msg: 'Plan hoặc end_date không hợp lệ.' }, 400);
    }

    const userResult = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      return handleResponse(res, { msg: 'Người dùng không tồn tại.' }, 404);
    }

    await pool.query(
      'UPDATE users SET role = $1, subscription_end_date = $2, updated_at = NOW() WHERE id = $3',
      [plan, end_date, id]
    );

    handleResponse(res, { msg: 'Cập nhật subscription thành công.' });
  } catch (err) {
    handleError(res, err);
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, name', [id]);
    if (result.rows.length === 0) {
      return handleResponse(res, { msg: 'Người dùng không tồn tại.' }, 404);
    }
    handleResponse(res, { msg: 'Người dùng đã được xóa.' });
  } catch (err) {
    handleError(res, err);
  }
};

// Hàm hiển thị yêu cầu nâng cấp
const getUpgradeRequests = async (req, res) => {
  try {
    // Thêm log để debug
    console.log('Executing getUpgradeRequests query...');
    const result = await pool.query(
      'SELECT p.userId, u.name, u.email, p.plan, p.amount, p.status, p.createdAt ' +
      'FROM Payments p JOIN users u ON p.userId = u.id WHERE p.status = $1 ORDER BY p.createdAt DESC',
      ['pending']
    );
    console.log('Query result:', result.rows);
    if (result.rows.length === 0) {
      return handleResponse(res, { requests: [], msg: 'Không có yêu cầu nâng cấp nào.' });
    }
    handleResponse(res, { requests: result.rows });
  } catch (err) {
    console.error('Error in getUpgradeRequests:', err.stack);
    handleError(res, err, 'Không thể tải danh sách yêu cầu nâng cấp.');
  }
};

module.exports = {
  getUsers,
  getUser,
  updateUserRole,
  updateSubscription,
  deleteUser,
  getUpgradeRequests,
};