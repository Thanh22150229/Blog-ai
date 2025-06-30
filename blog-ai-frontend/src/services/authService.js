// src/services/authService.js
const API_URL = 'http://localhost:5000/api';

const authService = {
  async register(userData) {
    console.log('Gửi request đăng ký:', userData);
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const result = await response.json();
    console.log('Phản hồi từ server (register):', result);
    if (!response.ok) throw new Error(result.msg || 'Lỗi đăng ký');
    return result;
  },

  async login(credentials) {
    console.log('Gửi request đăng nhập:', credentials);
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const result = await response.json();
    console.log('Phản hồi từ server (login):', result);
    if (!response.ok) throw new Error(result.msg || 'Lỗi đăng nhập');
    return result;
  },

  async getUser() {
    const response = await fetch(`${API_URL}/user/me`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.msg || 'Lỗi lấy thông tin người dùng');
    return result;
  },

  async changePassword(data) {
    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.msg || 'Lỗi đổi mật khẩu');
    return result;
  },
};

export default authService;