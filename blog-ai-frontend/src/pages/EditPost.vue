<template>
  <div class="edit-post-container">
    <Header @logout="handleLogout" />
    <div class="edit-post-card">
      <h2 class="form-title">Chỉnh sửa bài viết</h2>
      <div v-if="error" class="error-message">
        <p>{{ error }}</p>
      </div>
      <div class="input-group">
        <label class="input-label">Tiêu đề</label>
        <input v-model="post.title" placeholder="Nhập tiêu đề bài viết" class="input-field" />
      </div>
      <div class="input-group">
        <label class="input-label">Nội dung</label>
        <textarea v-model="postContent" placeholder="Nhập nội dung bài viết" class="input-field textarea"></textarea>
      </div>
      <div class="input-group">
        <label class="input-label">Hình ảnh minh họa</label>
        <input type="file" accept="image/*" @change="handleImageUpload" class="input-field" />
        <img v-if="hasImage" :src="computedImageUrl" ref="image" @load="handleImageLoad" @error="handleImageError" class="image-preview" />
        <div v-if="imageLoading" class="loading">Đang tải hình ảnh...</div>
        <div v-if="imageError" class="error-message">Lỗi tải hình ảnh.</div>
      </div>
      <div class="action-buttons">
        <button @click="publishPost" class="action-button publish-button" :disabled="isSaving">Xuất bản</button>
        <button @click="savePost" class="action-button save-button" :disabled="isSaving">Lưu thay đổi</button>
      </div>
      <div class="recent-posts">
        <h3 class="section-title">Bài viết gần đây</h3>
        <PostCard v-for="post in recentPosts" :key="post.id" :post="post" @update="handlePostUpdate" />
      </div>
    </div>
    <Footer />
  </div>
</template>

<script>
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import PostCard from '@/components/Blog/PostCard.vue';
import postService from '@/services/postService';

export default {
  components: { Header, Footer, PostCard },
  data() {
    return {
      post: { 
        id: '', 
        title: '', 
        content: '', 
        image_url: '', 
        image: null, 
        status: 'Draft',
        created_at: null,
        updated_at: null,
      },
      postContent: '',
      recentPosts: [],
      error: null,
      isSaving: false,
      imageLoading: true,
      imageError: false,
      hasImage: false,
      apiUrl: 'http://localhost:5000',
      uploadedImage: null,
    };
  },
  async created() {
    console.log('Route params:', this.$route.params);
    await this.fetchPost();
    await this.fetchRecentPosts();
    console.log('Post data after fetch:', this.post);
  },
  computed: {
    computedImageUrl() {
      console.log('Computed Image URL - Raw:', this.post.image_url);
      if (this.post.image_url && typeof this.post.image_url === 'string' && this.post.image_url.trim().startsWith('/uploads')) {
        const fullUrl = `${this.apiUrl}${this.post.image_url}`;
        console.log('Computed Image URL - Full:', fullUrl);
        return fullUrl;
      } else if (this.uploadedImage) {
        return this.uploadedImage;
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
  methods: {
    async fetchPost() {
      this.error = null;
      try {
        const id = this.$route.params.id;
        if (!id || !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
          throw new Error('ID bài viết không hợp lệ.');
        }
        const response = await postService.getPost(id);
        console.log('Fetched post data:', response);
        if (!response || !response.id) {
          throw new Error('Không tìm thấy bài viết.');
        }
        this.post = { ...this.post, ...response };
        this.postContent = this.post.content || '';
        this.uploadedImage = null;
        this.$nextTick(() => {
          this.hasImage = !!this.computedImageUrl;
          this.checkImageStatus();
        });
      } catch (err) {
        console.error('Lỗi tải bài viết:', err);
        this.error = `Không thể tải bài viết. Chi tiết: ${err.message}`;
      }
    },
    async fetchRecentPosts() {
      try {
        const result = await postService.getPosts();
        console.log('Fetched recent posts:', result);
        const postsArray = Array.isArray(result.posts) ? result.posts : [];
        this.recentPosts = postsArray.filter(post => post.id !== this.$route.params.id).slice(0, 3);
      } catch (err) {
        console.error('Lỗi lấy bài viết gần đây:', err);
        this.error = `Không thể tải bài viết gần đây. Chi tiết: ${err.message}`;
        this.recentPosts = [];
      }
    },
    async publishPost() {
      try {
        const result = await postService.updatePostStatus(this.$route.params.id, 'Published');
        if (result) {
          this.post.status = 'Published';
          this.error = null;
          alert('Xuất bản bài viết thành công!');
          await this.fetchRecentPosts();
        } else {
          alert('Lỗi khi xuất bản bài viết.');
        }
      } catch (err) {
        console.error('Lỗi xuất bản:', err);
        this.error = `Không thể xuất bản bài viết. Chi tiết: ${err.message}`;
        alert('Không thể kết nối đến máy chủ.');
      }
    },
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.uploadedImage = e.target.result;
          this.post.image_url = '';
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
    async savePost() {
      this.isSaving = true;
      this.error = null;
      try {
        console.log('Data before sending to savePost:', {
          title: this.post.title,
          content: this.postContent,
          image_url: this.post.image_url,
          uploadedImage: this.uploadedImage,
        });

        if (!this.post.title.trim() || !this.postContent.trim()) {
          this.error = 'Tiêu đề và nội dung không được phép để trống.';
          alert(this.error);
          this.isSaving = false;
          return;
        }

        const updatedPost = new FormData();
        updatedPost.append('title', this.post.title.trim());
        updatedPost.append('content', this.postContent.trim());
        if (this.uploadedImage) {
          const blob = await fetch(this.uploadedImage).then(res => res.blob());
          updatedPost.append('image', blob, 'uploaded_image.jpg');
        } else if (this.post.image_url && !this.uploadedImage) {
          updatedPost.append('image_url', this.post.image_url);
        }

        for (let [key, value] of updatedPost.entries()) {
          console.log(`FormData entry - ${key}:`, value);
        }

        const result = await postService.updatePost(this.$route.params.id, updatedPost);
        if (result) {
          alert('Lưu thay đổi thành công!');
          await this.fetchPost();
          await this.fetchRecentPosts();
        } else {
          alert('Lỗi khi lưu bài viết.');
        }
      } catch (err) {
        console.error('Lỗi lưu bài viết:', err);
        this.error = `Không thể lưu bài viết. Chi tiết: ${err.message}`;
        alert('Không thể kết nối đến máy chủ.');
      } finally {
        this.isSaving = false;
      }
    },
    handlePostUpdate(post) {
      this.post = { ...this.post, ...post };
      this.postContent = post.content || '';
      this.fetchRecentPosts();
    },
    handleLogout() {
      localStorage.removeItem('token');
      this.$router.push('/login');
    },
  },
};
</script>

<style scoped>
/* Giữ nguyên style từ phiên bản trước */
.edit-post-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(to bottom right, #f3f4f6, #bfdbfe);
  padding: 1rem;
}

.edit-post-card {
  background-color: white;
  border-radius: 1.5rem;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.form-title {
  font-size: 1.875rem;
  font-weight: 800;
  color: #1d4ed8;
  text-align: center;
  margin-bottom: 2rem;
}

.input-group {
  margin-bottom: 1.5rem;
}

.input-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.input-field {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.75rem;
  outline: none;
  transition: all 0.3s ease;
}

.input-field:focus {
  box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.3);
}

.textarea {
  height: 200px;
  resize: vertical;
}

.image-preview {
  max-width: 100%;
  height: auto;
  margin-top: 1rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.loading {
  margin-top: 1rem;
  color: #6b7280;
}

.error-message {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.action-button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  color: white;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.publish-button {
  background-color: #3b82f6;
}

.publish-button:hover {
  background-color: #2563eb;
}

.save-button {
  background-color: #22c55e;
}

.save-button:hover {
  background-color: #16a34a;
}

.recent-posts {
  margin-top: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1d4ed8;
  margin-bottom: 1rem;
}

.flex {
  display: flex;
}

.gap-4 {
  gap: 1rem;
}

.flex-1 {
  flex: 1;
}
</style>