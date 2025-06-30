<template>
  <div class="create-post-container animate-fade-in">
    <!-- Sử dụng component Header -->
    <Header @logout="handleLogout" />

    <!-- Nội dung chính -->
    <main class="create-post-main-content">
      <div class="create-post-content-wrapper">
        <div class="create-post-header">
          <h1 class="page-title">Tạo bài viết mới</h1>
          
        </div>

        <div class="editor-container">
          <!-- Form tạo bài viết -->
          <div class="editor-section">
            <editor :content.sync="postContent" @update-post="handlePostUpdate" />
          </div>
        </div>
      </div>
    </main>

    <!-- Sử dụng component Footer -->
    <Footer />
  </div>
</template>

<script>
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import Editor from '@/components/Blog/Editor.vue';

export default {
  components: { Header, Footer, Editor },
  data() {
    return {
      postContent: '',
    };
  },
  methods: {
    handlePostUpdate(content) {
      this.postContent = content; // Cập nhật nội dung từ Editor
    },
    goToDashboard() {
      this.$router.push('/dashboard');
    },
    handleLogout() {
      localStorage.removeItem('token');
      this.$router.push('/login');
    },
  },
};
</script>

<style scoped>
.create-post-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f0fa 100%);
  color: #1a202c;
  font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  flex-direction: column;
}

.create-post-main-content {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.create-post-content-wrapper {
  background: linear-gradient(135deg, #ffffff 0%, #f9fafc 100%);
  border-radius: 1.5rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08), 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 2.5rem;
  margin-top: -2.5rem;
  z-index: 1;
  border: 1px solid rgba(224, 231, 255, 0.3);
  transition: box-shadow 0.4s ease, transform 0.4s ease;
}

.create-post-content-wrapper:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12), 0 4px 15px rgba(0, 0, 0, 0.08);
  transform: translateY(-3px);
}

.create-post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 3px solid rgba(224, 231, 255, 0.6);
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2b6cb0;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: color 0.3s ease, transform 0.3s ease;
}

.page-title:hover {
  color: #2c5282;
  transform: scale(1.02);
}

.header-actions {
  display: flex;
  gap: 1.5rem;
}

.action-button {
  padding: 0.85rem 1.75rem;
  border-radius: 0.75rem;
  color: #ffffff;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.4s ease;
  background: linear-gradient(90deg, #6b7280 0%, #4b5563 100%);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.back-button:hover {
  background: linear-gradient(90deg, #4b5563 0%, #374151 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.editor-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.editor-section {
  background: linear-gradient(135deg, #f9fafb 0%, #edf2f7 100%);
  border-radius: 1.25rem;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(224, 231, 255, 0.4);
  transition: box-shadow 0.4s ease, transform 0.4s ease;
  min-height: 60vh;
}

.editor-section:hover {
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1), 0 3px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.7s ease-out;
}

@media (max-width: 768px) {
  .create-post-content-wrapper {
    margin-top: 0;
    border-radius: 0;
    padding: 1.5rem;
  }
  .page-title {
    font-size: 2rem;
  }
  .action-button {
    padding: 0.6rem 1.2rem;
  }
  .editor-section {
    padding: 1.5rem;
    min-height: 50vh;
  }
}
</style>