<template>
  <div class="dashboard-container animate-fade-in">
    <!-- Sử dụng component Header với nút đăng xuất -->
    <Header @logout="handleLogout" />

    <!-- Nội dung chính -->
    <main class="dashboard-main-content">
      <div class="dashboard-content-wrapper">
        <div class="posts-section">
          <h2 class="section-title">Lịch sử bài viết</h2>
          <div v-if="loading" class="loading-message">
            <p>Đang tải dữ liệu...</p>
          </div>
          <div v-else-if="posts.length > 0" class="posts-list">
            <PostCard
              v-for="post in posts"
              :key="post.id"
              :post="post"
              @update-post="fetchPosts"
              @delete-post="removePost"
              class="post-card-item"
            />
          </div>
          <div v-else class="no-posts-message">
            <p>Bạn chưa có bài viết nào.</p>
            <router-link to="/create-post" class="create-post-link">Tạo bài viết mới ngay!</router-link>
          </div>
          <div v-if="error" class="error-message">{{ error }}</div>
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
import authService from '@/services/authService';
import postService from '@/services/postService';
import PostCard from '@/components/Blog/PostCard.vue';

export default {
  components: { Header, Footer, PostCard },
  data() {
    return {
      posts: [],
      error: '',
      isAuthenticated: false,
      loading: true, // Trạng thái loading để kiểm soát hiển thị
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
      await this.fetchPosts();
    },
    async fetchPosts() {
      try {
        this.loading = true; // Bật trạng thái loading
        this.error = ''; // Reset lỗi trước khi gọi API
        const result = await postService.getPosts();
        console.log('Fetch Posts Result:', JSON.stringify(result, null, 2)); // Log chi tiết

        // Kiểm tra dữ liệu API
        if (!result || !Array.isArray(result.posts)) {
          throw new Error('Dữ liệu bài viết không hợp lệ.');
        }

        // Lọc trùng lặp dựa trên id
        const uniquePosts = [...new Map(result.posts.map(item => [item.id, item])).values()];

        // Thêm kiểm tra trùng lặp dựa trên tiêu đề (nếu cần)
        const uniqueByTitle = [];
        const seenTitles = new Set();
        uniquePosts.forEach(post => {
          if (!seenTitles.has(post.title)) {
            seenTitles.add(post.title);
            uniqueByTitle.push(post);
          }
        });

        this.posts = uniqueByTitle;
      } catch (err) {
        console.error('Lỗi lấy lịch sử bài viết:', err);
        this.error = err.message === 'Dữ liệu bài viết không hợp lệ.'
          ? 'Dữ liệu bài viết không hợp lệ.'
          : 'Không thể tải danh sách bài viết. Vui lòng thử lại sau.';
        this.posts = [];
      } finally {
        this.loading = false; // Tắt trạng thái loading
      }
    },
    removePost(postId) {
      this.posts = this.posts.filter(post => post.id !== postId);
      console.log(`Đã xóa bài viết với ID: ${postId}`);
    },
    handleLogout() {
      localStorage.removeItem('token');
      this.$router.push('/login');
    },
  },
};
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f3f4f6 0%, #e0e7ff 100%);
  color: #1e293b;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.dashboard-main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.dashboard-content-wrapper {
  background-color: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  padding: 2rem;
  margin-top: -2rem; /* Điều chỉnh để chồng lên header */
  z-index: 1;
}

.posts-section {
  padding: 1.5rem;
}

.section-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1e40af;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #e0e7ff;
  padding-bottom: 0.5rem;
}

.posts-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.post-card-item {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.post-card-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

.no-posts-message {
  text-align: center;
  padding: 2rem;
  color: #64748b;
}

.no-posts-message p {
  margin-bottom: 1rem;
}

.create-post-link {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: #3b82f6;
  color: #ffffff;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.create-post-link:hover {
  background-color: #2563eb;
}

.error-message {
  color: #dc2626;
  font-size: 0.875rem;
  text-align: center;
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #fee2e2;
  border-radius: 0.375rem;
}

.loading-message {
  text-align: center;
  padding: 2rem;
  color: #64748b;
  font-size: 1rem;
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
  .dashboard-content-wrapper {
    margin-top: 0;
    border-radius: 0;
  }
  .section-title {
    font-size: 1.5rem;
  }
  .posts-list {
    grid-template-columns: 1fr;
  }
}
</style>