const { v4: uuidv4 } = require('uuid');
const genAI = require('../config/gemini');
const pool = require('../config/db');
const path = require('path');

// Hàm kiểm tra giới hạn bài viết
const checkPostLimit = async (userId) => {
  try {
    const user = await pool.query(
      'SELECT role, daily_post_count, last_post_date, subscription_end_date FROM users WHERE id = $1',
      [userId]
    );
    if (!user.rows[0]) throw new Error('Người dùng không tồn tại');

    const now = new Date().toISOString().split('T')[0]; // Lấy ngày hiện tại (YYYY-MM-DD)
    if (user.rows[0].last_post_date !== now) {
      await pool.query(
        'UPDATE users SET daily_post_count = 0, last_post_date = $1 WHERE id = $2',
        [now, userId]
      );
    }

    const { role, daily_post_count, subscription_end_date } = user.rows[0];
    // Kiểm tra và cập nhật role nếu gói hết hạn
    if (['plus', 'pro'].includes(role) && subscription_end_date && new Date(subscription_end_date) < new Date()) {
      await pool.query('UPDATE users SET role = \'user\' WHERE id = $1', [userId]);
    }

    const limits = { user: 3, plus: 10, pro: Infinity };
    if (daily_post_count >= limits[role]) {
      return false;
    }

    await pool.query(
      'UPDATE users SET daily_post_count = daily_post_count + 1, last_post_date = $1 WHERE id = $2',
      [now, userId]
    );
    return true;
  } catch (error) {
    throw new Error(`Lỗi kiểm tra giới hạn bài viết: ${error.message}`);
  }
};

const createBlogPost = async (req, res) => {
  try {
    const { topic, title, tone = 'trung lập', language = 'tiếng Việt' } = req.body;
    const userId = req.user.id;

    if (!topic || !title) {
      return res.status(400).json({ msg: 'Chủ đề và tiêu đề không được để trống.' });
    }

    if (title.length < 5 || title.length > 200) {
      return res.status(400).json({ msg: 'Tiêu đề phải từ 5 đến 200 ký tự.' });
    }

    // Kiểm tra giới hạn bài viết
    if (!await checkPostLimit(userId)) {
      return res.status(403).json({ msg: 'Đã đạt giới hạn bài viết hôm nay.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ msg: 'Thiếu API key cho Gemini.' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Viết một bài blog với tiêu đề "${title}", ngôn ngữ ${language}, giọng văn ${tone}, chủ đề: "${topic}". Dài khoảng 500 từ. Tạo thêm tóm tắt ngắn (100-150 từ) với tiêu đề "Tóm tắt:".`;
    const result = await model.generateContent(prompt);

    if (!result || !result.response || !result.response.text) {
      return res.status(500).json({ msg: 'Kết quả từ Gemini không hợp lệ.' });
    }

    const content = result.response.text();
    if (typeof content !== 'string' || !content.trim()) {
      return res.status(500).json({ msg: 'Nội dung từ Gemini không hợp lệ hoặc trống.' });
    }

    const summary = content.includes('Tóm tắt:')
      ? content.split('Tóm tắt:')[1].trim().substring(0, 150)
      : content.substring(0, 150).trim();

    const newPost = await pool.query(
      'INSERT INTO posts (id, user_id, title, content, status, summary, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *',
      [uuidv4(), userId, title, content, 'Draft', summary]
    );

    res.status(201).json(newPost.rows[0]);
  } catch (error) {
    console.error('Lỗi tạo bài viết:', error.message);
    res.status(500).json({ msg: `Lỗi tạo bài viết bằng Gemini: ${error.message}` });
  }
};

const createPost = async (req, res) => {
  try {
    const { title, content, status, summary, scheduleDate, metaDescription, keywords } = req.body;
    const userId = req.user.id;
    const imageUrl = req.file ? `/uploads/${path.basename(req.file.path)}` : null;

    if (!title || !content) {
      return res.status(400).json({ msg: 'Tiêu đề và nội dung không được để trống.' });
    }

    
    if (!await checkPostLimit(userId)) {
      return res.status(403).json({ msg: 'Đã đạt giới hạn bài viết hôm nay.' });
    }

    const newPost = await pool.query(
      'INSERT INTO posts (id, user_id, title, content, status, summary, image_url, schedule_date, meta_description, keywords, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) RETURNING *',
      [uuidv4(), userId, title, content, status || 'Draft', summary || '', imageUrl, scheduleDate || null, metaDescription || '', keywords || '[]']
    );

    res.status(201).json(newPost.rows[0]);
  } catch (error) {
    console.error('Lỗi lưu bài viết:', error.message);
    if (error.message.includes('ENOENT')) {
      res.status(500).json({ msg: 'Lỗi: Thư mục uploads không tồn tại. Vui lòng kiểm tra server.' });
    } else {
      res.status(500).json({ msg: `Lỗi lưu bài viết: ${error.message}` });
    }
  }
};

const updatePostStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
      return res.status(400).json({ msg: 'ID bài viết không hợp lệ.' });
    }

    if (!['Draft', 'Published'].includes(status)) {
      return res.status(400).json({ msg: 'Trạng thái không hợp lệ.' });
    }

    const result = await pool.query(
      'UPDATE posts SET status = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *',
      [status, id, userId]
    );

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ msg: 'Bài viết không tồn tại hoặc bạn không có quyền chỉnh sửa.' });
    }
  } catch (err) {
    console.error('Lỗi cập nhật trạng thái:', err.message);
    res.status(500).json({ msg: 'Lỗi máy chủ.' });
  }
};

const getPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query('SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    res.json({ posts: result.rows });
  } catch (err) {
    console.error('Lỗi lấy bài viết:', err.message);
    res.status(500).json({ msg: 'Lỗi máy chủ.' });
  }
};

const getPost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
      return res.status(400).json({ msg: 'ID bài viết không hợp lệ.' });
    }

    const result = await pool.query(
      'SELECT * FROM posts WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ msg: 'Bài viết không tồn tại hoặc bạn không có quyền truy cập.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Lỗi lấy bài viết:', err.message);
    res.status(500).json({ msg: 'Lỗi máy chủ.' });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, content } = req.body; // Chỉ cập nhật title và content
    let image_url = req.body.image_url || null;

    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
      return res.status(400).json({ msg: 'ID bài viết không hợp lệ.' });
    }

    if (!title || !content) {
      return res.status(400).json({ msg: 'Tiêu đề và nội dung không được để trống.' });
    }

    // Xử lý file ảnh nếu có
    if (req.file) {
      image_url = `/uploads/${path.basename(req.file.path)}`;
    }

    const result = await pool.query(
      'UPDATE posts SET title = $1, content = $2, image_url = $3, updated_at = NOW() WHERE id = $4 AND user_id = $5 RETURNING *',
      [title, content, image_url, id, userId]
    );

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ msg: 'Bài viết không tồn tại hoặc bạn không có quyền chỉnh sửa.' });
    }
  } catch (err) {
    console.error('Lỗi cập nhật bài viết:', err.message);
    res.status(500).json({ msg: 'Lỗi máy chủ.' });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
      return res.status(400).json({ msg: 'ID bài viết không hợp lệ.' });
    }

    const result = await pool.query(
      'DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length > 0) {
      res.json({ msg: 'Bài viết đã được xóa thành công.' });
    } else {
      res.status(404).json({ msg: 'Bài viết không tồn tại hoặc bạn không có quyền xóa.' });
    }
  } catch (err) {
    console.error('Lỗi xóa bài viết:', err.message);
    res.status(500).json({ msg: 'Lỗi máy chủ.' });
  }
};

module.exports = {
  createBlogPost,
  createPost,
  updatePostStatus,
  getPosts,
  getPost,
  updatePost,
  deletePost,
};