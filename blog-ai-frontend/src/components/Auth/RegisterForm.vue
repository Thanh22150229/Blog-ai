<script>
import authService from '@/services/authService';

export default {
  name: 'Register',
  data() {
    return {
      name: '',
      email: '',
      password: '',
      error: '',
      nameError: '',
      emailError: '',
      passwordError: '',
      successMessage: '',
      // Nhập biểu tượng
      userIcon: new URL('@/assets/icon-user.png', import.meta.url).href,
      emailIcon: new URL('@/assets/icon-email.png', import.meta.url).href,
      lockIcon: new URL('@/assets/icon-lock.png', import.meta.url).href,
      eyeIcon: new URL('@/assets/icon-eye.png', import.meta.url).href,
    };
  },
  methods: {
    validateName() {
      const nameRegex = /^[a-zA-Z0-9\s]+$/;
      if (!this.name) {
        this.nameError = 'Tên không được để trống.';
      } else if (!nameRegex.test(this.name)) {
        this.nameError = 'Tên chỉ được chứa chữ cái, số và khoảng trắng, không được chứa ký tự có dấu.';
      } else {
        this.nameError = '';
      }
    },
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
    async handleRegister() {
      this.validateName();
      this.validateEmail();
      this.validatePassword();
      if (this.nameError || this.emailError || this.passwordError || !this.name || !this.email || !this.password) {
        return;
      }

      try {
        this.error = '';
        this.successMessage = '';
        const result = await authService.register({
          name: this.name,
          email: this.email,
          password: this.password,
        });
        console.log('API Response:', result);

        if (result.msg === 'Đăng ký thành công') {
          this.successMessage = 'Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...';
          setTimeout(() => {
            this.$router.push('/login');
          }, 2000);
        } else {
          this.error = result.msg || 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.';
        }
      } catch (err) {
        console.error('Registration error:', err);
        this.error = err.response?.data?.msg || 'Không thể kết nối đến máy chủ. Vui lòng thử lại.';
      }
    },
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
<template>
  <div class="register-container">
    <div class="register-card">
      <div class="illustration-container">
        <img
          src="@/assets/ai-illustration.jpg"
          alt="AI Illustration"
          class="illustration-img"
        />
      </div>

      <div class="form-container">
        <h2 class="form-title">Tham gia AI Blog</h2>

        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
        <p v-if="error" class="error-message">{{ error }}</p>

        <form @submit.prevent="handleRegister" class="register-form">
          <div class="relative">
            <input
              v-model="name"
              type="text"
              placeholder="Họ và tên (không dấu)"
              class="input-field"
              required
              @input="validateName"
            />
            <img :src="userIcon" class="input-icon" alt="user icon" />
          </div>
          <p v-if="nameError" class="error-message">{{ nameError }}</p>

          <div class="relative">
            <input
              v-model="email"
              type="email"
              placeholder="Email"
              class="input-field"
              required
              @input="validateEmail"
            />
            <img :src="emailIcon" class="input-icon" alt="email icon" />
          </div>
          <p v-if="emailError" class="error-message">{{ emailError }}</p>

          <div class="relative">
            <input
              v-model="password"
              type="password"
              placeholder="Password"
              class="input-field"
              required
              @input="validatePassword"
            />
            <img :src="lockIcon" class="input-icon" alt="lock icon" />
            <img :src="eyeIcon" class="eye-icon" alt="show password" @click="togglePasswordVisibility" />
          </div>
          <p v-if="passwordError" class="error-message">{{ passwordError }}</p>

          <button
            type="submit"
            class="register-button"
            :disabled="nameError || emailError || passwordError || !name || !email || !password"
          >
            Register
          </button>
        </form>

        <div class="form-footer">
          Already have an account?
          <router-link to="/login" class="login-link">Login</router-link>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.success-message {
  color: #22c55e;
  font-size: 0.875rem;
  text-align: center;
  margin-bottom: 1rem;
  font-weight: 600;
}

.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom right, #f3f4f6, #bfdbfe);
}

.register-card {
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

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  text-align: left;
  margin-top: 0.25rem;
}

.register-button {
  width: 100%;
  background: linear-gradient(to right, #22c55e, #16a34a);
  color: white;
  padding: 0.75rem;
  border-radius: 0.75rem;
  font-weight: 600;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.register-button:hover {
  background: linear-gradient(to right, #16a34a, #15803d);
}

.register-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.form-footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
}

.login-link {
  color: #2563eb;
  text-decoration: none;
}

.login-link:hover {
  text-decoration: underline;
}

.input-field {
  width: 100%;
  padding-left: 3rem; /* Tăng khoảng cách để chứa biểu tượng */
  padding-right: 1rem;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  outline: none;
  transition: all 0.2s ease;
  position: relative; /* Đảm bảo input là container cho icon */
}

.input-field:focus {
  box-shadow: 0 0 0 2px #93c5fd;
}

/* Cải tiến vị trí và kiểu dáng của biểu tượng */
.input-icon {
  width: 1.25rem; /* Giảm kích thước biểu tượng để hài hòa */
  height: 1.25rem;
  position: absolute;
  left: 1rem; /* Điều chỉnh khoảng cách từ lề trái */
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.7; /* Tăng độ tương phản nhẹ */
  object-fit: contain; /* Đảm bảo hình ảnh không bị méo */
  transition: opacity 0.2s ease; /* Hiệu ứng khi hover */
}

.input-field:focus + .input-icon,
.input-icon:hover {
  opacity: 1; /* Tăng độ đậm khi focus hoặc hover */
}

/* Đảm bảo các container input có định vị tương đối */
.relative {
  position: relative;
  width: 100%;
}
.eye-icon {
  width: 1.25rem;
  height: 1.25rem;
  position: absolute;
  right: 0.75rem; /* Đảm bảo cách lề phải vừa đủ */
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