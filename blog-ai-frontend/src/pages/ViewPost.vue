<template>
  <div class="view-post-container">
    <div class="view-post-content-wrapper">
      <!-- Back Button -->
      <button @click="$router.go(-1)" class="action-button back-button">
        <svg class="icon-back" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Quay lại
      </button>

      <!-- Post Title -->
      <h1 class="post-title animate-slide-in">{{ post.title }}</h1>

      <!-- Error Message -->
      <div v-if="error" class="error-message animate-pulse">
        <p>{{ error }}</p>
      </div>

      <!-- Post Image -->
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

      <!-- Post Content -->
      <div class="post-content" v-html="post.content"></div>

      <!-- Post Status -->
      <span class="post-status" :class="post.status === 'Published' ? 'published' : 'draft'">
        {{ post.status === 'Published' ? 'Đã xuất bản' : 'Bản nháp' }}
      </span>

      <!-- Post Metadata -->
      <div class="post-meta">
        <span class="meta-date">{{ formatDate(post.created_at) }}</span>
        <span class="meta-author">Bởi {{ post.author || 'Người dùng' }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import postService from '@/services/postService';

export default {
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      post: {
        title: 'Đang tải...',
        content: '',
        image_url: '',
        status: 'Draft',
        created_at: null,
        author: 'Người dùng',
      },
      error: null,
      imageLoading: true,
      imageError: false,
      hasImage: false, // Flag để kiểm soát render ảnh
      apiUrl: 'http://localhost:5000',
    };
  },
  computed: {
    computedImageUrl() {
      console.log('Raw image_url:', this.post.image_url, 'Type:', typeof this.post.image_url);
      if (this.post.image_url && typeof this.post.image_url === 'string' && this.post.image_url.trim().startsWith('/uploads')) {
        const fullUrl = `${this.apiUrl}${this.post.image_url}`;
        console.log('Computed Image URL:', fullUrl);
        return fullUrl;
      }
      console.warn('No valid image_url, using original:', this.post.image_url);
      return this.post.image_url || '';
    },
  },
  watch: {
    computedImageUrl(newUrl) {
      console.log('computedImageUrl changed to:', newUrl);
      this.imageLoading = true;
      this.imageError = false;
      this.hasImage = !!newUrl; // Cập nhật flag khi URL thay đổi
      this.$nextTick(() => this.checkImageStatus());
    },
  },
  methods: {
    formatDate(date) {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },
    handleImageError() {
      console.error('Lỗi tải ảnh:', this.computedImageUrl);
      this.imageError = true;
      this.imageLoading = false;
    },
    handleImageLoad() {
      console.log('Image loaded successfully, naturalWidth:', this.$refs.image ? this.$refs.image.naturalWidth : 'N/A');
      this.checkImageStatus();
    },
    checkImageStatus() {
      this.$nextTick(() => {
        if (this.$refs.image) {
          if (this.$refs.image.complete && this.$refs.image.naturalWidth > 0) {
            this.imageLoading = false;
            this.imageError = false;
          } else if (this.$refs.image.complete || this.imageError) {
            this.imageError = true;
            this.imageLoading = false;
            console.warn('Image loaded but empty or error:', this.computedImageUrl);
          }
        } else {
          console.warn('Image ref is null, check delayed...');
          // Không gọi lại vô hạn, chỉ log và chờ lần kiểm tra tiếp theo
        }
      });
    },
  },
  async created() {
    try {
      if (!this.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
        throw new Error('ID bài viết không hợp lệ.');
      }
      const response = await postService.getPost(this.id);
      console.log('Full API response:', response);
      if (response && response.title && response.content) {
        this.post = {
          title: response.title,
          content: response.content,
          image_url: response.image_url || '',
          status: response.status || 'Draft',
          created_at: response.created_at || null,
          author: response.author || 'Người dùng',
        };
        console.log('Assigned image_url before render:', this.post.image_url);
        this.$nextTick(() => {
          console.log('image_url after render:', this.post.image_url);
          console.log('computedImageUrl after render:', this.computedImageUrl);
          this.hasImage = !!this.computedImageUrl; // Cập nhật flag
          this.checkImageStatus();
        });
      } else {
        throw new Error('Dữ liệu bài viết không hợp lệ.');
      }
    } catch (err) {
      console.error('Lỗi tải bài viết:', err);
      this.error = err.message || 'Không thể tải bài viết.';
      this.post = {
        title: 'Bài viết không tồn tại',
        content: '',
        image_url: '',
        status: 'Draft',
        created_at: null,
        author: 'N/A',
      };
      this.imageLoading = false;
      this.imageError = false;
      this.hasImage = false;
    }
  },
  mounted() {
    console.log('Mounted, computedImageUrl:', this.computedImageUrl, 'imageLoading:', this.imageLoading);
    this.$nextTick(() => {
      if (this.$refs.image) {
        console.log('Image src:', this.$refs.image.src, 'naturalWidth:', this.$refs.image.naturalWidth, 'complete:', this.$refs.image.complete);
      } else {
        console.warn('Image ref is null on mount');
      }
      this.checkImageStatus();
    });
  },
};
</script>

<style scoped>
.view-post-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #e0f7fa 0%, #ffffff 100%);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 3rem 1rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.view-post-content-wrapper {
  background: #ffffff;
  border-radius: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  max-width: 900px;
  width: 100%;
  margin: 2rem auto;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.view-post-content-wrapper:hover {
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  transform: translateY(-4px);
}

.action-button.back-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  background: linear-gradient(90deg, #3b82f6 0%, #1e40af 100%);
  color: #ffffff;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;
}

.back-button:hover {
  background: linear-gradient(90deg, #1e40af 0%, #1e3a8a 100%);
  transform: translateY(-2px);
}

.icon-back {
  width: 1.25rem;
  height: 1.25rem;
  stroke: #ffffff;
}

.post-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: #1e3a8a;
  margin-bottom: 1.5rem;
  line-height: 1.3;
  letter-spacing: -0.025em;
}

.post-image-container {
  position: relative;
  width: 100%;
  max-height: 500px;
  min-height: 200px;
  border-radius: 1rem;
  overflow: hidden;
  margin-bottom: 2rem;
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
  margin-bottom: 2rem;
  color: #4b5563;
  font-size: 1rem;
  font-weight: 500;
  text-align: center;
}

.post-content {
  font-size: 1.125rem;
  line-height: 1.75;
  color: #1f2937;
  margin-bottom: 2rem;
}

.post-content :deep(p) {
  margin-bottom: 1.25rem;
}

.post-content :deep(h2) {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e3a8a;
  margin: 1.5rem 0 1rem;
}

.post-content :deep(ul),
.post-content :deep(ol) {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.post-content :deep(li) {
  margin-bottom: 0.75rem;
  color: #4b5563;
}

.post-status {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1.25rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  transition: all 0.3s ease;
}

.post-status.draft {
  background: #fef3c7;
  color: #d97706;
  border: 1px solid #fcd34d;
}

.post-status.published {
  background: #d1fae5;
  color: #047857;
  border: 1px solid #6ee7b7;
}

.post-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
  font-size: 0.875rem;
  color: #6b7280;
}

.meta-date,
.meta-author {
  font-weight: 500;
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

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(10px);
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

.animate-slide-in {
  animation: slide-in 0.5s ease-out;
}

@media (max-width: 768px) {
  .view-post-container {
    padding: 1.5rem 1rem;
  }

  .view-post-content-wrapper {
    padding: 1.5rem;
    margin: 1rem auto;
  }

  .post-title {
    font-size: 1.75rem;
  }

  .post-image-container,
  .image-loading,
  .image-error {
    max-height: 300px;
  }

  .post-image-placeholder {
    height: 150px;
  }

  .post-content {
    font-size: 1rem;
  }

  .back-button {
    padding: 0.6rem 1.2rem;
    font-size: 0.875rem;
  }

  .post-meta {
    flex-direction: column;
    gap: 0.75rem;
  }
}

@media (max-width: 480px) {
  .post-title {
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

  .post-content {
    font-size: 0.95rem;
  }
}
</style>