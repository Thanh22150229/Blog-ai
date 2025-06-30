<template>
  <div class="seo-assistant animate-fade-in">
    <h3 class="section-title">Trợ lý SEO</h3>

    <!-- Nhập nội dung -->
    <div class="seo-section">
      <label class="input-label">Nội dung bài viết</label>
      <textarea
        v-model="content"
        class="input-field textarea"
        placeholder="Nhập nội dung bài viết tại đây..."
        rows="6"
      ></textarea>
    </div>

    <!-- Từ khóa gợi ý -->
    <div class="seo-section" v-if="keywords.length">
      <label class="input-label">Từ khóa chính</label>
      <ul class="keyword-list">
        <li v-for="(keyword, index) in keywords" :key="index" class="keyword-item">{{ keyword }}</li>
      </ul>
    </div>

    <!-- Meta Description -->
    <div class="seo-section" v-if="metaDescription">
      <label class="input-label">Thẻ meta mô tả</label>
      <textarea
        v-model="metaDescription"
        class="input-field textarea"
        placeholder="Thẻ meta mô tả sẽ xuất hiện tại đây..."
        rows="4"
      ></textarea>
    </div>

    <!-- Nút tạo -->
    <button @click="generateSeo" class="action-button generate-seo-button">Tạo gợi ý SEO</button>
  </div>
</template>

<script>
import postService from '@/services/postService';

export default {
  name: 'SEOAssistant',
  data() {
    return {
      content: '',
      keywords: [],
      metaDescription: '',
    };
  },
  methods: {
    async generateSeo() {
      if (!this.content || this.content.trim() === '') {
        alert('Vui lòng nhập nội dung bài viết trước khi tạo gợi ý SEO.');
        return;
      }

      try {
        const result = await postService.generateSeoSuggestions({  text: seoText.value });
        this.keywords = result.keywords || ['Ví dụ: Công nghệ AI', 'Tối ưu nội dung'];
        this.metaDescription = result.metaDescription || 'Đây là mô tả SEO mẫu.';
      } catch (err) {
        console.error('Lỗi gợi ý SEO:', err);
        this.keywords = ['Ví dụ: Từ khóa lỗi 1', 'Từ khóa lỗi 2'];
        this.metaDescription = 'Không thể tạo mô tả SEO. Vui lòng thử lại.';
      }
    },
  },
};
</script>

<style scoped>
.seo-assistant {
  background: #fff;
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 12px;
  margin-top: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #333;
}

.seo-section {
  margin-bottom: 18px;
}

.input-label {
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
  color: #444;
}

.input-field {
  width: 100%;
  padding: 10px;
  font-size: 15px;
  border: 1px solid #ccc;
  border-radius: 6px;
  resize: vertical;
}

.keyword-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.keyword-item {
  background: #eef;
  color: #225;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
}

.action-button {
  background-color: #0077cc;
  color: white;
  border: none;
  padding: 10px 18px;
  font-size: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.action-button:hover {
  background-color: #005fa3;
}

.animate-fade-in {
  animation: fade-in 0.4s ease-in-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
