<template>
  <div class="post-card animate-fade-in">
    
    <div class="post-content">
      <h2 class="post-title">{{ post.title }}</h2>
      <p class="post-excerpt">{{ post.content.substring(0, 100) }}...</p>
      <span class="post-status" :class="post.status === 'Published' ? 'published' : 'draft'">
        {{ post.status }}
      </span>
      <div class="post-actions">
        <button @click="viewPost" class="action-button view-button">Xem bài viết</button>
        <button @click="editPost" class="action-button edit-button">Chỉnh sửa</button>
        <button v-if="post.status !== 'Published'" @click="publishPost" class="action-button publish-button">
          Xuất bản
        </button>
        <button @click="deletePost" class="action-button delete-button">Xóa</button>
      </div>
    </div>
  </div>
</template>

<script>
import postService from '@/services/postService';

export default {
  props: {
    post: {
      type: Object,
      required: true,
    },
  },
  methods: {
    viewPost() {
      if (this.post.id) {
        this.$router.push({ path: `/view-post/${this.post.id}` });
      } else {
        console.error('ID bài viết không tồn tại:', this.post);
        alert('Không thể xem bài viết do thiếu ID.');
      }
    },
    editPost() {
      if (this.post.id) {
        this.$router.push({ path: `/edit-post/${this.post.id}` });
      } else {
        console.error('ID bài viết không tồn tại:', this.post);
        alert('Không thể chỉnh sửa bài viết do thiếu ID.');
      }
    },
    async publishPost() {
      try {
        if (!this.post.id) throw new Error('ID bài viết không tồn tại.');
        const result = await postService.updatePostStatus(this.post.id, 'Published');
        if (result.status === 'Published') {
          this.$emit('update-post', { ...this.post, status: 'Published' });
          alert('Xuất bản bài viết thành công!');
        } else {
          alert(result.msg || 'Lỗi khi xuất bản bài viết.');
        }
      } catch (err) {
        console.error('Lỗi xuất bản:', err);
        alert('Không thể xuất bản bài viết: ' + (err.message || 'Lỗi không xác định'));
      }
    },
    async deletePost() {
      if (!confirm('Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.')) {
        return;
      }
      try {
        if (!this.post.id) throw new Error('ID bài viết không tồn tại.');
        await postService.deletePost(this.post.id);
        this.$emit('delete-post', this.post.id); // Phát sự kiện để component cha xóa bài viết
        alert('Xóa bài viết thành công!');
      } catch (err) {
        console.error('Lỗi xóa bài viết:', err);
        alert('Không thể xóa bài viết: ' + (err.message || 'Lỗi không xác định'));
      }
    },
  },
};
</script>

<style scoped>
/* Giữ nguyên style hiện tại và thêm style cho nút xóa */
.post-card {
  background: linear-gradient(135deg, #ffffff 0%, #f9fafc 100%);
  border-radius: 1.25rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08), 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: transform 0.4s ease, box-shadow 0.4s ease;
  margin-bottom: 2rem;
  max-width: 650px;
}

.post-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.12), 0 4px 15px rgba(0, 0, 0, 0.08);
}

.post-image-container {
  width: 100%;
  height: 250px;
  overflow: hidden;
  border-bottom: 1px solid rgba(224, 231, 255, 0.5);
}

.post-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.post-image:hover {
  transform: scale(1.1);
}

.post-content {
  padding: 1.75rem;
}

.post-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2b6cb0;
  margin-bottom: 0.75rem;
  line-height: 1.3;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.post-excerpt {
  font-size: 1rem;
  color: #4a5568;
  margin-bottom: 1.25rem;
  line-height: 1.6;
}

.post-status {
  display: inline-block;
  font-size: 0.9rem;
  padding: 0.4rem 1rem;
  border-radius: 1.5rem;
  font-weight: 500;
  text-transform: uppercase;
}

.post-status.draft {
  background-color: #fefcbf;
  color: #d69e2e;
  border: 1px solid rgba(234, 179, 8, 0.3);
}

.post-status.published {
  background-color: #d1fae5;
  color: #047857;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.post-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.action-button {
  padding: 0.65rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.4s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.view-button {
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
}

.view-button:hover {
  background: linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.edit-button {
  background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
}

.edit-button:hover {
  background: linear-gradient(90deg, #d97706 0%, #b45309 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.publish-button {
  background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%);
}

.publish-button:hover {
  background: linear-gradient(90deg, #16a34a 0%, #065f46 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.delete-button {
  background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
}

.delete-button:hover {
  background: linear-gradient(90deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
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
  .post-card {
    margin-bottom: 1.5rem;
    max-width: 100%;
  }
  .post-image-container {
    height: 180px;
  }
  .post-title {
    font-size: 1.5rem;
  }
  .post-excerpt {
    font-size: 0.9rem;
  }
  .action-button {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}
</style>