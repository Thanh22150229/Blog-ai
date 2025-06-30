<template>
  <div class="ai-blog-container">
    <!-- Sử dụng component Header -->
    <Header />

    <!-- Nội dung chính -->
    <main class="ai-main-content">
      <section class="profile-section animate-slide-in">
        <div class="profile-card">
          <!-- Tiêu đề -->
          <div class="header-container">
            <h2 class="hero-title">Hồ Sơ AI Của Bạn</h2>
            <div class="ai-orb"></div>
          </div>

          <!-- Thông tin người dùng -->
          <div class="profile-info-container">
            <h3 class="section-title">Thông Tin Cá Nhân</h3>
            <div v-if="user" class="profile-info">
              <div class="info-item">
                <span class="info-label">Email</span>
                <span class="info-value">{{ user.email }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Tên</span>
                <span class="info-value">{{ user.name }}</span>
              </div>
            </div>
            <div v-else class="loading-state">
              <div class="spinner"></div>
              <span>Đang tải thông tin...</span>
            </div>
          </div>

          <!-- Đổi mật khẩu -->
          <div class="password-section">
            <h3 class="section-title">Đổi Mật Khẩu</h3>
            <div class="input-group">
              <label class="input-label">Mật Khẩu Mới</label>
              <div class="input-wrapper">
                <img :src="lockIcon" class="input-icon" alt="Biểu tượng khóa" />
                <input
                  v-model="newPassword"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Nhập mật khẩu mới..."
                  class="input-field"
                  @input="validatePassword"
                />
                <button class="toggle-password" @click="showPassword = !showPassword">
                  <img
                    :src="showPassword ? eyeOffIcon : eyeIcon"
                    class="toggle-icon"
                    :alt="showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
                  />
                </button>
              </div>
              <p v-if="passwordError" class="error-message">{{ passwordError }}</p>
              <button
                class="cta-button save-button"
                @click="changePassword"
                :disabled="passwordError || !newPassword"
              >
                Lưu Mật Khẩu
              </button>
            </div>
          </div>

          <!-- Thông báo lỗi -->
          <div v-if="error" class="error-message">{{ error }}</div>
        </div>
      </section>
    </main>

    <!-- Sử dụng component Footer -->
    <Footer />
  </div>
</template>

<script>
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import authService from '@/services/authService';

export default {
  name: 'ProfilePage',
  components: {
    Header,
    Footer,
  },
  data() {
    return {
      user: null,
      newPassword: '',
      passwordError: '',
      error: '',
      isAuthenticated: false,
      showPassword: false,
      lockIcon: new URL('@/assets/icon-lock.png', import.meta.url).href,
      eyeIcon: new URL('@/assets/icon-eye.png', import.meta.url).href,
      eyeOffIcon: new URL('@/assets/icon-eye-off.png', import.meta.url).href,
    };
  },
  async created() {
    await this.checkAuthAndFetchData();
  },
  methods: {
    async checkAuthAndFetchData() {
      const token = localStorage.getItem('token');
      if (!token) {
        this.$router.push('/login');
        return;
      }
      this.isAuthenticated = true;
      await this.fetchUser();
    },
    async fetchUser() {
      try {
        const result = await authService.getUser();
        this.user = result.user || { email: 'user@example.com', name: 'Người dùng' };
      } catch (err) {
        console.error('Lỗi lấy thông tin người dùng:', err);
        this.error = 'Không thể tải thông tin người dùng. Vui lòng đăng nhập lại.';
        this.$router.push('/login');
      }
    },
    validatePassword() {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,15}$/;
      if (!this.newPassword) {
        this.passwordError = 'Mật khẩu không được để trống.';
      } else if (!passwordRegex.test(this.newPassword)) {
        this.passwordError = 'Mật khẩu phải có 8-15 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt (!@#$%^&*).';
      } else {
        this.passwordError = '';
      }
    },
    async changePassword() {
      this.validatePassword();
      if (this.passwordError || !this.newPassword) return;

      try {
        const result = await authService.changePassword({ password: this.newPassword });
        if (result.success) {
          this.error = '';
          this.newPassword = '';
          this.passwordError = '';
          this.showPassword = false;
          alert('Đổi mật khẩu thành công!');
        } else {
          this.error = result.msg || 'Lỗi khi đổi mật khẩu.';
        }
      } catch (err) {
        console.error('Lỗi đổi mật khẩu:', err);
        this.error = err.message || 'Không thể kết nối đến máy chủ.';
      }
    },
  },
};
</script>

<style scoped>
/* Định kiểu chung */
.ai-blog-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #1a202c;
  line-height: 1.6;
  background: linear-gradient(135deg, #edf2f7, #bfdbfe);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Main Content */
.ai-main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 1rem;
  flex: 1;
}

.profile-section {
  text-align: center;
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.profile-card {
  max-width: 600px;
  margin: 0 auto;
}

.header-container {
  position: relative;
  margin-bottom: 2rem;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1rem;
  text-transform: uppercase;
}

.ai-orb {
  position: absolute;
  top: -30px;
  right: -30px;
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, rgba(49, 130, 206, 0.3), transparent);
  border-radius: 50%;
  animation: pulse 4s infinite ease-in-out;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1.5rem;
  text-align: left;
}

.profile-info-container {
  background: #f7fafc;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.info-label {
  font-weight: 600;
  color: #4a5568;
}

.info-value {
  color: #2d3748;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #718096;
  padding: 1rem;
}

.spinner {
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid #3182ce;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.password-section {
  margin-top: 2rem;
}

.input-group {
  margin-bottom: 1.5rem;
  text-align: left;
}

.input-label {
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.input-wrapper {
  position: relative;
}

.input-field {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  outline: none;
  background: #fff;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.input-field:focus {
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
}

.input-icon {
  width: 1.25rem;
  height: 1.25rem;
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.6;
}

.toggle-password {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.toggle-icon {
  width: 1.25rem;
  height: 1.25rem;
  opacity: 0.6;
}

.cta-button {
  display: inline-block;
  background-color: #3182ce;
  color: #ffffff;
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: background-color 0.3s ease, transform 0.2s ease;
  border: none;
  cursor: pointer;
  width: 100%;
}

.save-button:hover:not(:disabled) {
  background-color: #2b6cb0;
  transform: translateY(-2px);
}

.save-button:disabled {
  background-color: #e2e8f0;
  cursor: not-allowed;
}

.error-message {
  color: #e53e3e;
  font-size: 0.875rem;
  text-align: center;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #fed7d7;
  border-radius: 6px;
}

/* Animations */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.5;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-in {
  animation: slide-in 0.6s ease-out;
}
</style>