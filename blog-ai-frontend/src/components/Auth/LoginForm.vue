<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Hình minh họa AI -->
      <div class="illustration-container">
        <img
          src="@/assets/ai-illustration.jpg"
          alt="Hình minh họa AI"
          class="illustration-img"
        />
      </div>

      <!-- Form đăng nhập -->
      <div class="form-container">
        <h2 class="form-title">Chào mừng đến với AI Blog</h2>

        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
        <p v-if="error" class="error-message">{{ error }}</p>

        <form @submit.prevent="handleLogin" class="login-form">
          <!-- Input Email -->
          <div class="relative">
            <input
              v-model="email"
              type="email"
              placeholder="Email"
              class="input-field"
              required
              @input="validateEmail"
            />
            <img :src="emailIcon" class="input-icon" alt="biểu tượng email" />
          </div>
          <p v-if="emailError" class="error-message">{{ emailError }}</p>

          <!-- Input Password -->
          <div class="relative">
            <input
              v-model="password"
              type="password"
              placeholder="Mật khẩu"
              class="input-field"
              required
              @input="validatePassword"
            />
            <img :src="lockIcon" class="input-icon" alt="biểu tượng khóa" />
            <img :src="eyeIcon" class="eye-icon" alt="hiển thị mật khẩu" @click="togglePasswordVisibility" />
          </div>
          <p v-if="passwordError" class="error-message">{{ passwordError }}</p>

          <!-- Nút đăng nhập -->
          <button
            type="submit"
            class="login-button"
            :disabled="emailError || passwordError || !email || !password"
          >
            Đăng nhập
          </button>
        </form>

        <!-- Chân form -->
        <div class="form-footer">
          Chưa có tài khoản?
          <router-link to="/register" class="register-link">Đăng ký</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import authService from '@/services/authService';

export default {
  name: 'LoginForm',
  data() {
    return {
      email: '',
      password: '',
      error: '',
      emailError: '',
      passwordError: '',
      successMessage: '',
      // Nhập biểu tượng
      emailIcon: new URL('@/assets/icon-email.png', import.meta.url).href,
      lockIcon: new URL('@/assets/icon-lock.png', import.meta.url).href,
      eyeIcon: new URL('@/assets/icon-eye.png', import.meta.url).href,
    };
  },
  methods: {
    validateEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!this.email) {
        this.emailError = 'Email không được để trống.';
      } else if (!emailRegex.test(this.email)) {
        this.emailError = 'Định dạng email không hợp lệ.';
      } else {
        this.emailError = '';
      }
    },
    validatePassword() {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,15}$/;
      if (!this.password) {
        this.passwordError = 'Mật khẩu không được để trống.';
      } else if (!passwordRegex.test(this.password)) {
        this.passwordError = 'Mật khẩu phải có 8-15 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt (!@#$%^&*).';
      } else {
        this.passwordError = '';
      }
    },
       async handleLogin() {
  this.validateEmail();
  this.validatePassword();
  if (this.emailError || this.passwordError || !this.email || !this.password) {
    return;
  }

  try {
    this.error = '';
    this.successMessage = '';
    const result = await authService.login({
      email: this.email,
      password: this.password,
    });
    console.log('API Response từ login:', result);

    if (result.token) {
      localStorage.setItem('token', result.token);
      console.log('Token được lưu:', result.token);
      this.successMessage = 'Đăng nhập thành công! Đang chuyển hướng...';

      // 👇 Điều hướng theo vai trò
      const decoded = JSON.parse(atob(result.token.split('.')[1]));
      if (decoded.role === 'admin') {
        this.$router.push('/admin');
      } else {
        this.$router.push('/');
      }
    } else {
      this.error = result.msg || 'Email hoặc mật khẩu không đúng.';
      console.log('Không nhận được token:', result);
    }
  } catch (err) {
    console.error('Lỗi đăng nhập:', err);
    this.error = err.response?.data?.msg || err.message || 'Không thể kết nối đến máy chủ.';
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
    }
  }
}
,
    togglePasswordVisibility() {
      const passwordInput = this.$el.querySelector('input[type="password"]');
      if (passwordInput) {
        passwordInput.type = 'text';
        setTimeout(() => {
          passwordInput.type = 'password';
        }, 1000); // Trở lại sau 1 giây
      }
    },
  },
};
</script>

<style scoped>
/* Thông báo thành công */
.success-message {
  color: #22c55e;
  font-size: 0.875rem;
  text-align: center;
  margin-bottom: 1rem;
  font-weight: 600;
}

/* Container chính */
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom right, #f3f4f6, #bfdbfe);
}

/* Card chứa form và hình minh họa */
.login-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  border-radius: 1.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  width: 100%;
  max-width: 80rem;
}

/* Hình minh họa */
.illustration-container {
  display: none;
  flex: 0 0 50%;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: #f3f4f6;
}

@media (min-width: 768px) {
  .illustration-container {
    display: flex;
  }
}

.illustration-img {
  max-width: 450px;
  height: auto;
  object-fit: contain;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Container form đăng nhập */
.form-container {
  width: 100%;
  flex: 0 0 50%;
  padding: 2rem;
  background-color: white;
}

@media (min-width: 768px) {
  .form-container {
    padding: 3.5rem;
  }
}

/* Tiêu đề */
.form-title {
  font-size: 1.875rem;
  font-weight: 800;
  text-align: center;
  color: #1d4ed8;
  margin-bottom: 2rem;
}

@media (min-width: 768px) {
  .form-title {
    font-size: 2.25rem;
  }
}

/* Form */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Thông báo lỗi */
.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  text-align: left;
  margin-top: 0.25rem;
}

/* Nút đăng nhập */
.login-button {
  width: 100%;
  background: linear-gradient(to right, #3b82f6, #4f46e5);
  color: white;
  padding: 0.75rem;
  border-radius: 0.75rem;
  font-weight: 600;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.login-button:hover {
  background: linear-gradient(to right, #2563eb, #4338ca);
}

.login-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

/* Chân form */
.form-footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
}

/* Link đăng ký */
.register-link {
  color: #2563eb;
  text-decoration: none;
}

.register-link:hover {
  text-decoration: underline;
}

/* Input field */
.input-field {
  width: 100%;
  padding-left: 3rem;
  padding-right: 1rem;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  outline: none;
  transition: all 0.2s ease;
  position: relative;
}

.input-field:focus {
  box-shadow: 0 0 0 2px #93c5fd;
}

/* Biểu tượng input */
.input-icon {
  width: 1.25rem;
  height: 1.25rem;
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.7;
  object-fit: contain;
  transition: opacity 0.2s ease;
}

.input-field:focus + .input-icon,
.input-icon:hover {
  opacity: 1;
}

/* Biểu tượng mắt */
.eye-icon {
  width: 1.25rem;
  height: 1.25rem;
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.7;
  object-fit: contain;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.eye-icon:hover {
  opacity: 1;
}

/* Container tương đối */
.relative {
  position: relative;
  width: 100%;
}

/* Phương án dự phòng nếu hình ảnh không tải được */
.input-icon::after {
  content: '⚠️';
  display: none;
  font-size: 1rem;
  color: #ef4444;
}

.input-icon[src=""]:not([src=""])::after,
.input-icon:not([src])::after {
  display: block;
}

/* Animation fade-in */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out;
}
</style>