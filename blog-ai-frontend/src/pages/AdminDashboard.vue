<template>
  <div class="admin-container">
    <Header @logout="handleLogout" />
    <main class="admin-main-content">
      <div class="admin-header">
        <h1 class="page-title"><i class="fas fa-users-cog"></i> Quản lý Người dùng</h1>
        <p class="page-subtitle">Hệ thống quản lý người dùng cho Blog AI tự động</p>
      </div>
      <div class="admin-content">
        <div v-if="error" class="error-message"><i class="fas fa-exclamation-circle"></i> {{ error }}</div>
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <span>Đang tải danh sách người dùng...</span>
        </div>
        <div v-else-if="users.length" class="users-table-wrapper">
          <table class="users-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Ngày hết hạn</th>
                <th>Bài đăng/ngày</th>
                <th>Bài gần nhất</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id" class="user-row">
                <td>{{ user.id }}</td>
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <select v-model="user.role" @change="updateRole(user.id, $event.target.value)" class="role-select">
                    <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
                  </select>
                </td>
                <td>
                  <input
                    v-model="user.subscription_end_date"
                    type="datetime-local"
                    class="date-input"
                    @change="updateSubscription(user.id, user.subscription_end_date)"
                  />
                </td>
                <td>{{ user.daily_post_count || 0 }}</td>
                <td>{{ user.last_post_date || 'Chưa có' }}</td>
                <td>
                  <button @click="deleteUser(user.id)" class="action-button delete-button">
                    <i class="fas fa-trash-alt"></i> Xóa
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="no-data-message"><i class="fas fa-info-circle"></i> Không có dữ liệu người dùng.</div>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script>
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import adminService from '@/services/adminService';

export default {
  components: { Header, Footer },
  data() {
    return {
      users: [],
      loading: true,
      error: '',
      roles: ['user', 'plus', 'pro', 'admin'],
    };
  },
  async created() {
    await this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      try {
        this.loading = true;
        this.error = '';
        const result = await adminService.getUsers();
        this.users = result.users.map(user => ({
          ...user,
          subscription_end_date: user.subscription_end_date
            ? new Date(user.subscription_end_date).toISOString().slice(0, 16)
            : '',
        }));
      } catch (err) {
        console.error('Lỗi lấy danh sách người dùng:', err);
        this.error = err.message || 'Không thể tải danh sách người dùng.';
      } finally {
        this.loading = false;
      }
    },
    async updateRole(userId, role) {
      try {
        this.error = '';
        await adminService.updateUserRole(userId, { role });
        this.error = 'Cập nhật vai trò thành công!';
      } catch (err) {
        console.error('Lỗi cập nhật vai trò:', err);
        this.error = err.message || 'Không thể cập nhật vai trò.';
      }
    },
    async updateSubscription(userId, endDate) {
      try {
        this.error = '';
        await adminService.updateSubscription(userId, { plan: this.users.find(u => u.id === userId).role, end_date: endDate });
        this.error = 'Cập nhật gói đăng ký thành công!';
      } catch (err) {
        console.error('Lỗi cập nhật gói đăng ký:', err);
        this.error = err.message || 'Không thể cập nhật gói đăng ký.';
      }
    },
    async deleteUser(userId) {
      if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
        try {
          this.error = '';
          await adminService.deleteUser(userId);
          this.users = this.users.filter(user => user.id !== userId);
          this.error = 'Xóa người dùng thành công!';
        } catch (err) {
          console.error('Lỗi xóa người dùng:', err);
          this.error = err.message || 'Không thể xóa người dùng.';
        }
      }
    },
    handleLogout() {
      localStorage.removeItem('token');
      this.$router.push('/login');
    },
  },
};
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

.admin-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%);
  color: #1a202c;
  font-family: 'Inter', sans-serif;
  display: flex;
  flex-direction: column;
}

.admin-main-content {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.admin-header {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e7ff;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1e40af;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.admin-content {
  background: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
}

.users-table-wrapper {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  min-width: 800px;
  border-collapse: collapse;
  table-layout: fixed;
}

.users-table th,
.users-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.users-table th {
  background-color: #f8fafc;
  font-weight: 600;
  color: #1e293b;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.users-table td {
  vertical-align: middle;
}

.user-row:hover {
  background-color: #f1f5f9;
}

.role-select,
.date-input {
  width: 100%;
  max-width: 150px;
  padding: 0.375rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.role-select:focus,
.date-input:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.action-button {
  padding: 0.375rem 0.75rem;
  border-radius: 0.25rem;
  color: #ffffff;
  font-weight: 500;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background-color: #ef4444;
  font-size: 0.875rem;
}

.action-button:hover {
  background-color: #dc2626;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #64748b;
  padding: 1rem;
}

.spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #3b82f6;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.error-message {
  color: #dc2626;
  font-size: 0.875rem;
  text-align: center;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #fee2e2;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.no-data-message {
  text-align: center;
  color: #64748b;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>