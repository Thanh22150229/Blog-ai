<template>
  <header class="ai-header">
    <div class="header-content">
      <h1 class="logo">
        <router-link to="/">Blog AI</router-link>
      </h1>
      <button class="hamburger" @click="toggleMenu" v-if="isMobile">
        <span class="hamburger-icon">⋮</span>
      </button>
      <nav class="main-nav" :class="{ 'is-open': isMenuOpen }">
        <ul class="nav-list">
          <li><router-link to="/Pricing" @click="closeMenu">Nâng cấp gói của bạn</router-link></li>
          <li><router-link to="/create-post" @click="closeMenu">Tạo bài viết</router-link></li>
          <li><router-link to="/history" @click="closeMenu">Lịch sử bài viết</router-link></li>
          <li><router-link to="/profile" @click="closeMenu">Hồ sơ</router-link></li>
          <li v-if="!isAuthenticated"><router-link to="/login" @click="closeMenu">Đăng nhập</router-link></li>
          <li v-if="!isAuthenticated"><router-link to="/register" @click="closeMenu">Đăng ký</router-link></li>
          <li v-if="isAuthenticated" class="user-info">
            <span class="user-name">{{ userName }}</span>
            <button class="logout-button" @click="logout">Đăng xuất</button>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script>
import authService from '@/services/authService';

export default {
  data() {
    return {
      isAuthenticated: false,
      userName: 'Người dùng',
      isMenuOpen: false,
      isMobile: window.innerWidth <= 768,
    };
  },
  async created() {
    await this.checkAuthStatus();
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    async checkAuthStatus() {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await authService.getUser();
          this.isAuthenticated = true;
          this.userName = userData.user?.name || 'Người dùng';
          console.log('User data:', userData);
        } catch (err) {
          console.error('Lỗi kiểm tra trạng thái:', err);
          this.isAuthenticated = false;
          localStorage.removeItem('token');
        }
      }
    },
    logout() {
      localStorage.removeItem('token');
      this.isAuthenticated = false;
      this.userName = 'Người dùng';
      this.isMenuOpen = false;
      this.$router.push('/login');
    },
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
    closeMenu() {
      this.isMenuOpen = false;
    },
    handleResize() {
      this.isMobile = window.innerWidth <= 768;
      if (!this.isMobile) {
        this.isMenuOpen = false; // Close menu on larger screens
      }
    },
  },
};
</script>

<style scoped>
.ai-header {
  width: 100%;
  background-color: #2d3748;
  color: #ffffff;
  padding: 1.5rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  box-sizing: border-box;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
}

.logo {
  font-size: 0.99rem;
  font-weight: bold;
  color: #e96544;
  letter-spacing: 1px;
  transition: color 0.3s ease, transform 0.3s ease;
}

.logo a {
  color: #fd5151;
  text-decoration: none;
}

.logo a:hover {
  color: #4299e1;
  transform: scale(1.05);
}

.main-nav {
  display: flex;
  align-items: center;
}

.main-nav .nav-list {
  display: flex;
  list-style: none;
  gap: 1.5rem;
  align-items: center;
  margin: 0;
}

.nav-list li a {
  color: #ffffff;
  text-decoration: none;
  font-size: 1rem;
  transition: color 0.3s ease;
}

.nav-list li a:hover {
  color: #63b3ed;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-name {
  color: #ffffff;
  font-size: 1rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

.logout-button {
  background-color: #ef4444;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.3s ease;
  white-space: nowrap;
}

.logout-button:hover {
  background-color: #dc2626;
}

.hamburger {
  display: none;
  background: none;
  border: none;
  color: #ffffff;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
}

.hamburger-icon {
  display: inline-block;
  transform: rotate(90deg);
  font-weight: bold;
}

@media (max-width: 768px) {
  .hamburger {
    display: block;
  }

  .main-nav {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background-color: #2d3748;
    padding: 1rem 0;
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: transform 0.3s ease, opacity 0.3s ease, visibility 0.3s ease;
  }

  .main-nav.is-open {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  .main-nav .nav-list {
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    padding: 0 2rem;
  }

  .nav-list li {
    width: 100%;
    text-align: center;
  }

  .user-info {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0;
  }

  .user-name {
    max-width: 100%;
  }

  .logout-button {
    width: auto;
  }
}
</style>