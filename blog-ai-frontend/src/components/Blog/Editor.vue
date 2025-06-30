<template>
  <div class="editor-container animate-fade-in">
    <div class="editor-card">
      <h2 class="form-title">Tạo bài viết mới</h2>

      <div v-if="error" class="error-message">
        <p>{{ error }}</p>
      </div>

      <div v-if="successMessage" class="success-message">
        <p>{{ successMessage }}</p>
      </div>

      <div class="input-group">
        <label class="input-label">Từ khóa/Mô tả chủ đề</label>
        <div class="flex gap-4">
          <input
            v-model="keyword"
            placeholder="Nhập từ khóa hoặc mô tả chủ đề, nhấn Enter hoặc nút để lấy gợi ý..."
            class="input-field flex-1"
            @keyup.enter="suggestTitles"
          />
          <button @click="suggestTitles" class="action-button suggest-button" :disabled="!keyword">
            Lấy gợi ý tiêu đề
          </button>
          <button @click="suggestSeo" class="action-button seo-button" :disabled="isGeneratingSeo || (!keyword && !content)">
            {{ isGeneratingSeo ? 'Đang lấy gợi ý SEO...' : 'Lấy gợi ý SEO' }}
          </button>
        </div>
      </div>

      <div v-if="seoSuggestions.keywords.length || seoSuggestions.metaDescription" class="seo-suggestions">
        <h3 class="section-title">Gợi ý SEO</h3>
        <div v-if="seoSuggestions.keywords.length">
          <p><strong>Từ khóa SEO:</strong></p>
          <ul class="suggestion-list">
            <li v-for="(keyword, index) in seoSuggestions.keywords" :key="index" class="suggestion-item">
              {{ keyword }}
            </li>
          </ul>
        </div>
        <div v-if="seoSuggestions.metaDescription">
          <p><strong>Meta Description (160 ký tự):</strong></p>
          <p class="summary-text">{{ seoSuggestions.metaDescription }}</p>
        </div>
      </div>

      <div class="input-group flex gap-4">
        <div class="flex-1">
          <label class="input-label">Giọng văn</label>
          <select v-model="tone" class="input-field">
            <option value="cheerful">Vui vẻ</option>
            <option value="serious">Nghiêm túc</option>
            <option value="inspirational">Truyền cảm hứng</option>
            <option value="academic">Học thuật</option>
          </select>
        </div>
        <div class="flex-1">
          <label class="input-label">Ngôn ngữ</label>
          <select v-model="language" class="input-field">
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
            <option value="ko">한국어</option>
          </select>
        </div>
      </div>

      <div class="input-group">
        <label class="input-label">Lên lịch đăng bài</label>
        <input
          v-model="scheduleDate"
          type="datetime-local"
          class="input-field"
        />
      </div>

      <div v-if="suggestedTitles.length" class="title-suggestions">
        <h3 class="section-title">Gợi ý tiêu đề</h3>
        <ul class="suggestion-list">
          <li
            v-for="(title, index) in suggestedTitles"
            :key="index"
            @click="selectTitle(title)"
            class="suggestion-item"
          >
            {{ title }}
          </li>
        </ul>
      </div>

      <div class="input-group">
        <label class="input-label">Tiêu đề bài viết</label>
        <input
          v-model="title"
          placeholder="Nhập tiêu đề hoặc chọn từ gợi ý..."
          class="input-field"
        />
        <p class="input-hint">Bạn có thể nhập tiêu đề tùy chỉnh hoặc chọn từ gợi ý ở trên.</p>
      </div>

      <div class="input-group">
        <label class="input-label">Nội dung bài viết</label>
        <textarea
          v-model="content"
          placeholder="Viết nội dung bài viết tại đây..."
          class="input-field textarea"
          @input="updateSeoSuggestions"
        ></textarea>
      </div>

      <div class="input-group">
        <label class="input-label">Hình ảnh minh họa</label>
        <input type="file" accept="image/*" @change="handleImageUpload" class="input-field" />
        <button
          @click="generateImage"
          class="action-button generate-image-button"
          :disabled="isGeneratingImage || !keyword"
        >
          {{ isGeneratingImage ? 'Đang sinh...' : 'Sinh hình ảnh tự động' }}
        </button>
        <img v-if="imagePreview" :src="imagePreview" alt="Hình ảnh xem trước" class="image-preview" />
      </div>

      <div v-if="summary" class="summary-container">
        <h3 class="section-title">Tóm tắt bài viết</h3>
        <p class="summary-text">{{ summary }}</p>
      </div>

      <div class="action-buttons">
        <button @click="generatePost" class="action-button generate-button" :disabled="!keyword || !title">
          {{ isGeneratingPost ? 'Đang sinh...' : 'Sinh bài viết' }}
        </button>
        <button @click="savePost" class="action-button save-button" :disabled="!title || !content || isSaving">
          {{ isSaving ? 'Đang lưu...' : 'Lưu bài viết' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import postService from '@/services/postService';

export default {
  data() {
    return {
      keyword: '',
      tone: 'cheerful',
      language: 'vi',
      scheduleDate: '',
      suggestedTitles: [],
      title: '',
      content: '',
      image: null,
      imagePreview: null,
      summary: '',
      error: '',
      successMessage: '',
      isGeneratingImage: false,
      isGeneratingSeo: false,
      isSaving: false,
      isGeneratingPost: false,
      seoSuggestions: {
        keywords: [],
        metaDescription: '',
      },
    };
  },
  methods: {
    async suggestTitles() {
      if (!this.keyword || this.keyword.trim() === '') {
        this.suggestedTitles = [];
        this.error = 'Vui lòng nhập từ khóa hoặc chủ đề để lấy gợi ý tiêu đề.';
        return;
      }
      try {
        this.error = '';
        this.successMessage = '';
        const result = await postService.suggestTitles({
          keyword: this.keyword,
          tone: this.tone,
          language: this.language,
        });
        this.suggestedTitles = result.titles || [];
        this.successMessage = 'Đã lấy gợi ý tiêu đề thành công!';
      } catch (err) {
        console.error('Lỗi gợi ý tiêu đề:', err);
        this.error = 'Không thể gợi ý tiêu đề bài viết.';
      }
    },
    async suggestSeo() {
      if (!this.keyword && !this.content) {
        this.error = 'Vui lòng nhập từ khóa hoặc nội dung để lấy gợi ý SEO.';
        return;
      }
      try {
        this.isGeneratingSeo = true;
        this.error = '';
        this.successMessage = '';
        const result = await postService.generateSeoSuggestions({
          content: this.content || this.keyword,
        });
        this.seoSuggestions = {
          keywords: result.keywords || [],
          metaDescription: result.metaDescription || this.content.substring(0, 160),
        };
        this.successMessage = 'Đã lấy gợi ý SEO thành công!';
      } catch (err) {
        console.error('Lỗi gợi ý SEO:', err);
        this.error = err.message || 'Không thể lấy gợi ý SEO.';
      } finally {
        this.isGeneratingSeo = false;
      }
    },
    updateSeoSuggestions() {
      if (this.content && this.content.length >= 160) {
        this.seoSuggestions.metaDescription = this.content.substring(0, 160);
        this.suggestSeo();
      }
    },
    selectTitle(title) {
      this.title = title;
      this.suggestedTitles = [];
    },
    async generatePost() {
      const token = localStorage.getItem('token');
      if (!token) {
        this.$router.push('/login');
        return;
      }
      if (!this.keyword || this.keyword.trim() === '') {
        this.error = 'Vui lòng nhập từ khóa hoặc chủ đề.';
        return;
      }
      if (!this.title || this.title.trim() === '') {
        this.error = 'Vui lòng nhập hoặc chọn tiêu đề.';
        return;
      }
      this.error = '';
      this.successMessage = '';
      this.isGeneratingPost = true;
      try {
        const result = await postService.createBlogPost({
          topic: this.keyword,
          title: this.title,
          tone: this.tone,
          language: this.language,
        });
        this.content = result.content || '';
        this.summary = result.summary || '';
        this.successMessage = 'Đã sinh bài viết thành công! Vui lòng lưu để lưu vào cơ sở dữ liệu.';
      } catch (err) {
        console.error('Lỗi sinh bài viết:', err);
        this.error = err.message || 'Không thể sinh bài viết.';
      } finally {
        this.isGeneratingPost = false;
      }
    },
    async handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.image = file;
        this.imagePreview = URL.createObjectURL(file);
      } else {
        this.image = null;
        this.imagePreview = null;
      }
    },
    async generateImage() {
      if (!this.keyword) {
        this.error = 'Vui lòng nhập từ khóa để sinh hình ảnh.';
        return;
      }
      this.error = '';
      this.successMessage = '';
      this.isGeneratingImage = true;
      try {
        const result = await postService.generateImage({
          keyword: this.keyword,
          language: this.language,
        });
        this.imagePreview = result.imageUrl;
        if (result.imageUrl.startsWith('data:image')) {
          const response = await fetch(result.imageUrl);
          const blob = await response.blob();
          this.image = new File([blob], `generated-image-${Date.now()}.png`, { type: 'image/png' });
        } else {
          this.image = null; // Không sử dụng URL trực tiếp, ưu tiên upload
        }
        this.successMessage = 'Đã sinh hình ảnh thành công!';
      } catch (err) {
        console.error('Lỗi sinh hình ảnh:', err);
        this.error = err.message || 'Không thể sinh hình ảnh.';
      } finally {
        this.isGeneratingImage = false;
      }
    },
    async savePost() {
      const token = localStorage.getItem('token');
      if (!token) {
        this.$router.push('/login');
        return;
      }
      if (!this.title || !this.content) {
        this.error = 'Tiêu đề và nội dung không được để trống.';
        return;
      }
      this.error = '';
      this.successMessage = '';
      this.isSaving = true;
      try {
        const formData = new FormData();
        formData.append('title', this.title);
        formData.append('content', this.content);
        if (this.image instanceof File) {
          formData.append('image', this.image, this.image.name);
          console.log('File added to FormData:', this.image.name, this.image.size);
        }
        formData.append('status', 'Draft');
        formData.append('summary', this.summary || '');
        formData.append('metaDescription', this.seoSuggestions.metaDescription || '');
        formData.append('keywords', JSON.stringify(this.seoSuggestions.keywords || []));
        if (this.scheduleDate) formData.append('scheduleDate', this.scheduleDate);

        for (let pair of formData.entries()) {
          console.log('FormData:', pair[0] + ': ' + (pair[0] === 'image' ? pair[1].name || pair[1] : pair[1]));
        }

        const response = await postService.createPost(formData);
        if (response.id) {
          this.successMessage = 'Lưu bài viết thành công!';
          this.clearEditor();
        } else {
          this.error = response.msg || 'Lỗi khi lưu bài viết.';
        }
      } catch (err) {
        console.error('Lỗi lưu bài viết:', err);
        this.error = err.message || 'Không thể lưu bài viết.';
      } finally {
        this.isSaving = false;
      }
    },
    clearEditor() {
      this.keyword = '';
      this.tone = 'cheerful';
      this.language = 'vi';
      this.scheduleDate = '';
      this.suggestedTitles = [];
      this.title = '';
      this.content = '';
      this.image = null;
      this.imagePreview = null;
      this.summary = '';
      this.error = '';
      this.successMessage = '';
      this.isGeneratingImage = false;
      this.isGeneratingSeo = false;
      this.isGeneratingPost = false;
      this.seoSuggestions = { keywords: [], metaDescription: '' };
    },
  },
};
</script>

<style scoped>
/* Giữ nguyên style hiện tại */
.editor-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(to bottom right, #f3f4f6, #bfdbfe);
  padding: 1rem;
}

.editor-card {
  background-color: white;
  border-radius: 1.5rem;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 800px;
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

.input-hint {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.textarea {
  height: 200px;
  resize: vertical;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1d4ed8;
  margin-bottom: 1rem;
}

.suggestion-list {
  list-style: none;
  padding: 0;
}

.suggestion-item {
  padding: 0.6rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.suggestion-item:hover {
  background-color: #f3f4f6;
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

.generate-button {
  background-color: #3b82f6;
}

.generate-button:hover {
  background-color: #2563eb;
}

.save-button {
  background-color: #22c55e;
}

.save-button:hover {
  background-color: #16a34a;
}

.suggest-button {
  background-color: #10b981;
}

.suggest-button:hover {
  background-color: #059669;
}

.seo-button {
  background-color: #f59e0b;
}

.seo-button:hover {
  background-color: #d97706;
}

.seo-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.generate-image-button {
  margin-top: 0.5rem;
  background-color: #8b5cf6;
}

.generate-image-button:hover {
  background-color: #7c3aed;
}

.generate-image-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.image-preview {
  max-width: 100%;
  height: auto;
  margin-top: 1rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.summary-container {
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #f3f4f6;
  border-radius: 0.75rem;
}

.summary-text {
  font-size: 0.875rem;
  color: #4b5563;
}

.seo-suggestions {
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #f3f4f6;
  border-radius: 0.75rem;
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

.error-message {
  color: #dc2626;
  font-size: 0.875rem;
  text-align: center;
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #fee2e2;
  border-radius: 0.375rem;
}

.success-message {
  color: #15803d;
  font-size: 0.875rem;
  text-align: center;
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #dcfce7;
  border-radius: 0.375rem;
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