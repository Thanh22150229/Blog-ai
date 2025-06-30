<template>
  <div class="update-post-container animate-fade-in">
    <!-- Sử dụng component Header -->
    <Header @logout="handleLogout" />

    <!-- Nội dung chính -->
    <main class="update-post-main-content">
      <div class="update-post-content-wrapper">
        <div class="update-post-header">
          <h1 class="page-title">Cập nhật nội dung AI</h1>
          <p class="header-subtitle">Tối ưu hóa bài viết và hình ảnh tự động với AI</p>
        </div>

        <div class="editor-container">
          <!-- Form cập nhật bài viết -->
          <form @submit.prevent="updatePost" class="update-post-form" enctype="multipart/form-data">
            <div class="form-group">
              <label for="title" class="form-label">Tiêu đề bài viết</label>
              <input v-model="post.title" id="title" type="text" required class="form-input" placeholder="Nhập tiêu đề được AI gợi ý" />
            </div>
            <div class="form-group">
              <label for="image" class="form-label">Hình ảnh</label>
              <input type="file" id="image" @change="handleImageUpload" accept="image/*" class="form-file" />
              <div v-if="imageLoading || hasImage" class="post-image-container">
                <div v-if="imageLoading" class="image-loading">
                  <div class="spinner"></div>
                </div>
                <img
                  v-if="hasImage"
                  :src="computedImageUrl"
                  :alt="post.title"
                  class="post-image animate-fade-in"
                  @error="handleImageError"
                  @load="handleImageLoad"
                  ref="image"
                />
                <div v-if="imageError" class="image-error">
                  <p>Hình ảnh không thể tải. Vui lòng kiểm tra lại.</p>
                </div>
              </div>
              <div v-else class="post-image-placeholder">
                <p>Không có hình ảnh minh họa.</p>
              </div>
            </div>
            <div class="form-group">
              <label for="content" class="form-label">Nội dung</label>
              <textarea v-model="post.content" id="content" required class="form-textarea" placeholder="AI sẽ hỗ trợ tạo nội dung tự động"></textarea>
            </div>
            <div class="form-group">
              <label for="summary" class="form-label">Tóm tắt</label>
              <textarea v-model="post.summary" id="summary" class="form-textarea" placeholder="Tóm tắt được AI sinh ra"></textarea>
            </div>
            <div class="form-group">
              <label for="keyword" class="form-label">Từ khóa SEO</label>
              <input v-model="post.keyword" id="keyword" type="text" class="form-input" placeholder="AI gợi ý từ khóa tối ưu" />
            </div>
            <div class="form-group">
              <label for="tone" class="form-label">Giọng điệu AI</label>
              <select v-model="post.tone" id="tone" class="form-select">
                <option value="cheerful">Vui vẻ</option>
                <option value="neutral">Trung lập</option>
                <option value="formal">Chính thức</option>
              </select>
            </div>
            <button type="submit" class="action-button submit-button" :disabled="isSaving">
              Lưu với AI
            </button>
          </form>
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
import postService from '@/services/postService';

export default {
  components: { Header, Footer },
  data() {
    return {
      post: {
        id: '',
        title: '',
        content: '',
        image_url: '',
        summary: '',
        keyword: '',
        tone: 'neutral',
        language: 'vi',
      },
      error: null,
      isSaving: false,
      imageLoading: true,
      imageError: false,
      hasImage: false,
      apiUrl: 'http://localhost:5000',
      uploadedImage: null, // Lưu file ảnh đã upload
    };
  },
  computed: {
    computedImageUrl() {
      console.log('Computed Image URL - Raw:', this.post.image_url);
      if (this.post.image_url && typeof this.post.image_url === 'string' && this.post.image_url.trim().startsWith('/uploads')) {
        const fullUrl = `${this.apiUrl}${this.post.image_url}`;
        console.log('Computed Image URL - Full:', fullUrl);
        return fullUrl;
      } else if (this.uploadedImage) {
        return this.uploadedImage; // Sử dụng base64 từ file upload
      }
      console.warn('No valid image_url, returning empty:', this.post.image_url);
      return '';
    },
  },
  watch: {
    computedImageUrl(newUrl) {
      console.log('computedImageUrl changed to:', newUrl);
      this.imageLoading = true;
      this.imageError = false;
      this.hasImage = !!newUrl;
      this.$nextTick(() => this.checkImageStatus());
    },
  },
  async created() {
    await this.fetchPost();
  },
  methods: {
    async fetchPost() {
      this.error = null;
      try {
        const id = this.$route.params.id;
        const response = await postService.getPost(id);
        if (response && response.id) {
          this.post = {
            id: response.id,
            title: response.title || '',
            content: response.content || '',
            image_url: response.image_url || '',
            summary: response.summary || '',
            keyword: response.keyword || '',
            tone: response.tone || 'neutral',
            language: response.language || 'vi',
          };
          this.uploadedImage = null; // Reset uploadedImage khi tải dữ liệu mới
          this.$nextTick(() => {
            this.hasImage = !!this.computedImageUrl;
            this.checkImageStatus();
          });
        } else {
          throw new Error('Không tìm thấy bài viết.');
        }
      } catch (err) {
        this.error = `Không thể tải bài viết. Chi tiết: ${err.message}`;
      }
    },
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.uploadedImage = e.target.result; // Lưu base64 từ file upload
          this.post.image_url = ''; // Xóa image_url cũ khi upload mới
          this.hasImage = true;
          this.imageLoading = false;
          this.imageError = false;
        };
        reader.readAsDataURL(file);
      }
    },
    handleImageError() {
      console.error('Lỗi tải ảnh:', this.computedImageUrl);
      this.imageError = true;
      this.imageLoading = false;
    },
    handleImageLoad() {
      this.imageLoading = false;
      this.imageError = false;
    },
    checkImageStatus() {
      this.$nextTick(() => {
        if (this.$refs.image && this.$refs.image.complete && this.$refs.image.naturalWidth > 0) {
          this.imageLoading = false;
          this.imageError = false;
        } else if (this.$refs.image && (this.$refs.image.complete || this.imageError)) {
          this.imageError = true;
          this.imageLoading = false;
        }
      });
    },
    async updatePost() {
      this.isSaving = true;
      this.error = null;
      try {
        const updatedPost = new FormData();
        updatedPost.append('title', this.post.title);
        updatedPost.append('content', this.post.content);
        if (this.uploadedImage) {
          const blob = await fetch(this.uploadedImage).then(res => res.blob());
          updatedPost.append('image', blob, 'uploaded_image.jpg'); // Đặt tên file tạm thời
        } else if (this.post.image_url && !this.uploadedImage) {
          updatedPost.append('image_url', this.post.image_url); // Giữ nguyên URL cũ nếu không thay đổi
        }
        updatedPost.append('summary', this.post.summary || this.post.content.substring(0, 150));
        updatedPost.append('keyword', this.post.keyword || '');
        updatedPost.append('tone', this.post.tone);
        updatedPost.append('language', this.post.language);

        const result = await postService.updatePost(this.post.id, updatedPost);
        if (result) {
          alert('Cập nhật bài viết thành công!');
          this.$router.push('/dashboard');
        } else {
          alert('Lỗi khi cập nhật bài viết.');
        }
      } catch (err) {
        this.error = `Không thể cập nhật bài viết. Chi tiết: ${err.message}`;
        alert('Không thể kết nối đến máy chủ.');
      } finally {
        this.isSaving = false;
      }
    },
    goBack() {
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
.update-post-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #e0f7fa 0%, #ffffff 100%);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 3rem 1rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.update-post-main-content {
  flex: 1;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
}

.update-post-content-wrapper {
  background: #ffffff;
  border-radius: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  margin: 2rem auto;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.update-post-content-wrapper:hover {
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  transform: translateY(-4px);
}

.update-post-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 3px solid rgba(100, 150, 255, 0.2);
}

.page-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: #1e3a8a;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: color 0.3s ease, transform 0.3s ease;
}

.page-title:hover {
  color: #1e3a8a;
  transform: scale(1.03);
}

.header-subtitle {
  font-size: 1.1rem;
  color: #64748b;
  font-weight: 500;
  margin-top: 0.5rem;
}

.editor-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.update-post-form {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-label {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-input, .form-textarea, .form-select {
  padding: 0.9rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 1rem;
  background: #f8fafc;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-input:focus, .form-textarea:focus, .form-select:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
  outline: none;
}

.form-textarea {
  min-height: 200px;
  resize: vertical;
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1.5em;
}

.form-file {
  padding: 0.9rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 1rem;
  background: #f8fafc;
  transition: border-color 0.3s ease;
}

.form-file:focus {
  border-color: #60a5fa;
  outline: none;
}

.post-image-container {
  position: relative;
  width: 100%;
  max-height: 500px;
  min-height: 200px;
  border-radius: 1rem;
  overflow: hidden;
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
}

.post-image {
  width: 100%;
  height: auto;
  object-fit: cover;
  transition: transform 0.4s ease;
  display: block;
  min-height: 200px;
}

.post-image:hover {
  transform: scale(1.02);
}

.image-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #3b82f6;
  border-top: 4px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.image-error {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 200px;
  background: #fef2f2;
  border-radius: 1rem;
  color: #dc2626;
  font-size: 1rem;
  font-weight: 500;
  text-align: center;
  padding: 1rem;
}

.post-image-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 200px;
  background: #f3f4f6;
  border-radius: 1rem;
  margin-bottom: 1rem;
  color: #4b5563;
  font-size: 1rem;
  font-weight: 500;
  text-align: center;
}

.submit-button {
  background: linear-gradient(90deg, #3b82f6 0%, #1e40af 100%);
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  color: #ffffff;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.4s ease;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.submit-button:hover {
  background: linear-gradient(90deg, #2563eb 0%, #1e3a8a 100%);
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.submit-button:disabled {
  background: #a3bffa;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.error-message {
  background: #fef2f2;
  color: #dc2626;
  padding: 1rem 1.5rem;
  border-radius: 0.75rem;
  margin: 1.5rem 0;
  font-size: 1rem;
  font-weight: 500;
  border: 1px solid #fecaca;
  text-align: center;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out;
}

@media (max-width: 768px) {
  .update-post-content-wrapper {
    padding: 1.5rem;
    margin: 1rem auto;
  }

  .page-title {
    font-size: 1.75rem;
  }

  .header-subtitle {
    font-size: 1rem;
  }

  .submit-button {
    padding: 0.75rem 1.5rem;
  }

  .post-image-container,
  .image-loading,
  .image-error {
    max-height: 300px;
  }

  .post-image-placeholder {
    height: 150px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.5rem;
  }

  .post-image-container,
  .image-loading,
  .image-error {
    max-height: 250px;
  }

  .post-image-placeholder {
    height: 120px;
  }

  .submit-button {
    padding: 0.6rem 1.2rem;
  }
}
</style>