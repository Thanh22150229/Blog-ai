<template>
  <div class="not-found-container animate-fade-in">
    <div class="not-found-card">
      <img
        :src="notFoundImage"
        alt="Hình minh họa 404"
        class="not-found-image"
      />
      <h1 class="page-title">404 - Không tìm thấy trang</h1>
      <p class="error-message">
        Rất tiếc, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
      </p>
      <div class="action-buttons">
        <button @click="goToHome" class="action-button home-button">
          Về trang chủ
        </button>
        <button @click="goToDashboard" class="action-button dashboard-button">
          Về Dashboard
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      notFoundImage: new URL('@/assets/404-illustration.png', import.meta.url).href,
    };
  },
  methods: {
    goToHome() {
      this.$router.push('/');
    },
    goToDashboard() {
      this.$router.push('/dashboard');
    },
  },
};
</script>

<style scoped>
.not-found-container {
  min-height: 100vh;
  background: linear-gradient(to bottom right, #f3f4f6, #bfdbfe);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.not-found-card {
  background-color: white;
  border-radius: 1.5rem;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  text-align: center;
  max-width: 600px;
  width: 100%;
}

.not-found-image {
  max-width: 100%;
  height: auto;
  margin-bottom: 1.5rem;
  border-radius: 1rem;
  transition: transform 0.3s ease;
}

.not-found-image:hover {
  transform: scale(1.05);
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1d4ed8;
  margin-bottom: 1rem;
}

.error-message {
  font-size: 1rem;
  color: #4b5563;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.action-button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  color: white;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.home-button {
  background-color: #3b82f6;
}

.home-button:hover {
  background-color: #2563eb;
}

.dashboard-button {
  background-color: #22c55e;
}

.dashboard-button:hover {
  background-color: #16a34a;
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

@media (max-width: 768px) {
  .not-found-card {
    padding: 1.5rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>