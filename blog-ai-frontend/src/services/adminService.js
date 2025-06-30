const API_URL = 'http://localhost:5000/api';

async function handleResponse(response) {
  const result = await response.json();
  if (!response.ok) {
    if (response.status === 404) throw new Error(`Không tìm thấy tài nguyên. (Mã lỗi: ${response.status})`);
    if (response.status === 401) throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
    throw new Error(result.msg || 'Có lỗi xảy ra. Vui lòng thử lại.');
  }
  return result;
}

function getToken() {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Không có token. Vui lòng đăng nhập.');
  return token;
}

const adminService = {
  async getUsers() {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Lỗi network khi lấy users:', error);
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối hoặc cấu hình CORS.');
    }
  },

  async updateUserRole(userId, data) {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Lỗi network khi cập nhật role:', error);
      throw new Error('Không thể kết nối đến server.');
    }
  },

  async updateSubscription(userId, data) {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/admin/users/${userId}/subscription`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Lỗi network khi cập nhật subscription:', error);
      throw new Error('Không thể kết nối đến server.');
    }
  },

  async deleteUser(userId) {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Lỗi network khi xóa user:', error);
      throw new Error('Không thể kết nối đến server.');
    }
  },

  async getUpgradeRequests() {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/admin/upgrade-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Lỗi network khi lấy yêu cầu nâng cấp:', error);
      throw error; // Ném lỗi để xử lý ở giao diện
    }
  },

  async approveUpgrade(userId, data) {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/admin/upgrade-requests/${userId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Lỗi network khi phê duyệt nâng cấp:', error);
      throw error;
    }
  },
};

export default adminService;