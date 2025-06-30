<template>
  <div class="pricing-container animate-fade-in">
    <!-- Sử dụng component Header -->
    <Header @logout="handleLogout" class="full-width" />

    <!-- Nội dung chính -->
    <main class="pricing-main">
      <header class="pricing-header">
        <h1 class="pricing-title">Chọn Gói Phù Hợp Với Bạn</h1>
        <p class="pricing-subtitle">Tận dụng sức mạnh của AI để tạo nội dung blog tự động, tiết kiệm thời gian và tối ưu hóa hiệu quả.</p>
      </header>
      <div class="pricing-cards">
        <div class="pricing-card">
          <h2 class="plan-title">Free</h2>
          <p class="plan-price">0đ</p>
          <ul class="plan-features">
            <li>Vai trò: User</li>
            <li>3 bài viết/ngày</li>
            <li>Truy cập cơ bản AI</li>
            <li>Hỗ trợ cộng đồng</li>
          </ul>
          <button class="plan-button" @click="startFree">Bắt Đầu Miễn Phí</button>
        </div>
        <div class="pricing-card popular">
          <span class="popular-tag">Phổ Biến</span>
          <h2 class="plan-title">Plus</h2>
          <p class="plan-price">99.000đ/tháng</p>
          <ul class="plan-features">
            <li>Vai trò: Plus</li>
            <li>10 bài viết/ngày</li>
            <li>Truy cập nâng cao AI</li>
            <li>Hỗ trợ ưu tiên</li>
          </ul>
          <button class="plan-button" @click="goToPayment('plus')">Đăng Ký Ngay</button>
        </div>
        <div class="pricing-card">
          <h2 class="plan-title">Pro</h2>
          <p class="plan-price">499.000đ/tháng</p>
          <ul class="plan-features">
            <li>Vai trò: Pro</li>
            <li>Không giới hạn bài viết</li>
            <li>Truy cập tối ưu AI</li>
            <li>Hỗ trợ 24/7</li>
          </ul>
          <button class="plan-button" @click="goToPayment('pro')">Đăng Ký Ngay</button>
        </div>
      </div>
      <footer class="pricing-footer">
        <p>Hãy bắt đầu hành trình tạo nội dung tự động với AI hôm nay!</p>
      </footer>
    </main>

    <!-- Sử dụng component Footer -->
    <Footer class="full-width" />
  </div>
</template>

<script>
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';

export default {
  components: { Header, Footer },
  methods: {
    handleLogout() {
      localStorage.removeItem('token');
      this.$router.push('/login');
    },
    startFree() {
      this.$router.push('/register');
    },
    goToPayment(plan) {
      this.$router.push(`/payment?plan=${plan}`);
    },
  },
};
</script>

<style scoped>
.pricing-container {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #e6f0fa 0%, #f0f7ff 100%);
  font-family: 'Poppins', 'Segoe UI', sans-serif;
  color: #1a202c;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
}

.pricing-main {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
  box-sizing: border-box;
}

.full-width {
  width: 100%;
  box-sizing: border-box;
}

.pricing-header {
  text-align: center;
  margin-bottom: 3rem;
  padding-top: 2rem;
}

.pricing-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2b6cb0;
  margin-bottom: 1rem;
}

.pricing-subtitle {
  font-size: 1.2rem;
  color: #4a5568;
  max-width: 600px;
  margin: 0 auto;
}

.pricing-cards {
  display: flex;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  justify-content: center;
  margin-bottom: 3rem;
}

.pricing-card {
  background: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  text-align: center;
  transition: transform 0.3s ease;
  width: 20%;
  min-width: 300px;
}

.pricing-card:hover {
  transform: translateY(-5px);
}

.popular {
  border: 2px solid #2b6cb0;
  position: relative;
}

.popular-tag {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: #2b6cb0;
  color: #ffffff;
  padding: 0.25rem 1rem;
  border-radius: 1rem;
  font-size: 0.9rem;
}

.plan-title {
  font-size: 1.8rem;
  color: #2d3748;
  margin-bottom: 1rem;
}

.plan-price {
  font-size: 2rem;
  font-weight: 600;
  color: #3182ce;
  margin-bottom: 1.5rem;
}

.plan-features {
  list-style: none;
  padding: 0;
  margin-bottom: 2rem;
}

.plan-features li {
  padding: 0.5rem 0;
  color: #4a5568;
}

.plan-button {
  background: #2b6cb0;
  color: #ffffff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
}

.plan-button:hover {
  background: #1a5582;
}

.pricing-footer {
  text-align: center;
  color: #4a5568;
  padding-bottom: 2rem;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.7s ease-out;
}

@media (max-width: 768px) {
  .pricing-title { font-size: 2rem; }
  .pricing-cards { grid-template-columns: 1fr; }
}
</style>