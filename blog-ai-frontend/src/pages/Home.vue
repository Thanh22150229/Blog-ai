<template>
  <div class="ai-blog-container">
    <!-- Sử dụng component Header -->
    <Header />

    <!-- Nội dung chính -->
    <main class="ai-main-content">
      <section class="hero-section">
        <h2 class="hero-title">Khám phá Tương Lai của Trí Tuệ Nhân Tạo</h2>
        <p class="hero-subtitle">Cập nhật các xu hướng mới nhất, nghiên cứu đột phá và ứng dụng thực tiễn trong AI.</p>
        <router-link to="/create-post" class="cta-button">Đóng góp ý tưởng của bạn</router-link>
      </section>

      <section class="featured-section">
        <h3 class="section-title">Bài viết nổi bật</h3>
        <div class="posts-grid">
          <div class="post-card">
            <h4 class="post-title">AI và Tự động hóa năm 2025</h4>
            <p class="post-summary">Phân tích tác động của AI trong tự động hóa tại các ngành công nghiệp lớn.</p>
             <a href="https://moha.gov.vn/tintuc/Pages/lists.aspx?ItemID=56848" class="post-link" target="_blank">Đọc chi tiết</a>
          </div>
          <div class="post-card">
            <h4 class="post-title">Mạng Nơ-ron Nhân Tạo: Hiểu Biết Cơ Bản</h4>
            <p class="post-summary">Hướng dẫn chi tiết về cách hoạt động của các mạng nơ-ron trong học máy.</p>
             <a href="https://aws.amazon.com/vi/what-is/neural-network/" class="post-link" target="_blank">Đọc chi tiết</a>
          </div>
          <div class="post-card">
            <h4 class="post-title">Đạo đức AI: Thách thức và Giải pháp</h4>
            <p class="post-summary">Thảo luận về các vấn đề đạo đức và cách xây dựng AI có trách nhiệm.</p>
             <a href="https://nhandan.vn/dao-duc-ai-thach-thuc-va-huong-di-post873031.html" class="post-link" target="_blank">Đọc chi tiết</a>
          </div>
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

export default {
  name: 'HomePage',
  components: {
    Header,
    Footer,
  },
};
</script>

<style scoped>
/* Định kiểu chung */
.ai-blog-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #1a202c;
  line-height: 1.6;
}

/* Main Content */
.ai-main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 1rem;
}

.hero-section {
  text-align: center;
  padding: 3rem 0;
  background-color: #edf2f7;
  border-radius: 8px;
  margin-bottom: 3rem;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.2rem;
  color: #4a5568;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.cta-button {
  display: inline-block;
  background-color: #3182ce;
  color: #ffffff;
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.cta-button:hover {
  background-color: #2b6cb0;
}

.featured-section .section-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 2rem;
  text-align: center;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.post-card {
  background-color: #ffffff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 1.5rem;
  transition: transform 0.3s ease;
}

.post-card:hover {
  transform: translateY(-5px);
}

.post-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.75rem;
}

.post-summary {
  color: #4a5568;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.post-link {
  color: #3182ce;
  text-decoration: none;
  font-weight: 500;
}

.post-link:hover {
  text-decoration: underline;
}
</style>