const API_URL = 'http://localhost:5000/api';

async function handleResponse(response) {
  const result = await response.json();
  if (!response.ok) {
    if (response.status === 404) throw new Error(`Không tìm thấy tài nguyên. (Mã lỗi: ${response.status})`);
    if (response.status === 401) throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
    throw new Error(result.msg || 'Có lỗi xảy ra. Vui lòng thử lại.');
  }
  return result;
}

function getToken() {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Không có token. Vui lòng đăng nhập.');
  return token;
}

const postService = {
  async createBlogPost(data) {
    const token = getToken();
    const response = await fetch(`${API_URL}/posts/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return await handleResponse(response);
  },

  async createPost(data) {
    const token = getToken();
    const response = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: data,
    });
    return await handleResponse(response);
  },

  async getPosts() {
    const token = getToken();
    const response = await fetch(`${API_URL}/posts`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return await handleResponse(response);
  },

  async getPost(id) {
    const token = getToken();
    if (!id || !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
      throw new Error('ID bài viết không hợp lệ.');
    }
    const response = await fetch(`${API_URL}/posts/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return await handleResponse(response);
  },

  async updatePostStatus(id, status) {
    const token = getToken();
    if (!id || !status || !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
      throw new Error('ID hoặc trạng thái không hợp lệ.');
    }
    const response = await fetch(`${API_URL}/posts/${id}/publish`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    return await handleResponse(response);
  },

  async updatePost(id, data) {
    const token = getToken();
    if (!id || !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
      throw new Error('ID bài viết không hợp lệ.');
    }
    const response = await fetch(`${API_URL}/posts/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: data,
    });
    return await handleResponse(response);
  },

  async deletePost(id) {
    const token = getToken();
    if (!id || !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
      throw new Error('ID bài viết không hợp lệ.');
    }
    const response = await fetch(`${API_URL}/posts/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return await handleResponse(response);
  },

  async suggestTitles(data) {
    const token = getToken();
    if (!data || !data.keyword) throw new Error('Dữ liệu gợi ý tiêu đề không hợp lệ.');
    const response = await fetch(`${API_URL}/posts/suggest-titles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return await handleResponse(response);
  },

  async generateImage(data) {
    const token = getToken();
    if (!data || !data.keyword) throw new Error('Dữ liệu sinh hình ảnh không hợp lệ.');
    const response = await fetch(`${API_URL}/posts/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return await handleResponse(response);
  },

  async generateSeoSuggestions(data) {
    const token = getToken();
    if (!data || !data.content) throw new Error('Dữ liệu gợi ý SEO không hợp lệ.');
    const response = await fetch(`${API_URL}/posts/seo-suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return await handleResponse(response);
  },
};

export default postService;