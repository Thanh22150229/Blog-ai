const express = require('express');
const router = express.Router();
const {
  createBlogPost,
  createPost,
  updatePostStatus,
  getPosts,
  getPost,
  updatePost,
  deletePost,
} = require('../controllers/postController');
const verifyToken = require('../middlewares/authMiddleware');
const genAI = require('../config/gemini');
const axios = require('axios');
const upload = require('../config/multerConfig');

// Tạo bài viết tự động từ AI
router.post('/generate', verifyToken, async (req, res) => {
  try {
    const { topic, title, tone = 'trung lập', language = 'tiếng Việt' } = req.body;
    if (!topic || !title) {
      return res.status(400).json({ msg: 'Chủ đề và tiêu đề không được để trống.' });
    }
    await createBlogPost(req, res);
  } catch (err) {
    console.error('Lỗi tạo bài viết:', err);
    res.status(500).json({ msg: 'Lỗi tạo bài viết. Chi tiết: ' + (err.message || 'Không xác định') });
  }
});

// Tạo bài viết với ảnh
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    console.log('File received:', req.file); // Debug file
    await createPost(req, res);
  } catch (err) {
    console.error('Lỗi lưu bài viết:', err);
    res.status(500).json({ msg: 'Lỗi lưu bài viết. Chi tiết: ' + (err.message || 'Không xác định') });
  }
});

// CRUD khác
router.get('/', verifyToken, getPosts);
router.get('/:id', verifyToken, getPost);
router.patch('/:id/publish', verifyToken, updatePostStatus);
router.patch('/:id', verifyToken, upload.single('image'), updatePost);
router.delete('/:id', verifyToken, deletePost); // Gọi hàm từ controller

// Gợi ý tiêu đề
router.post('/suggest-titles', verifyToken, async (req, res) => {
  try {
    const { keyword, tone = 'trung lập', language = 'tiếng Việt' } = req.body;
    if (!keyword) return res.status(400).json({ msg: 'Thiếu trường keyword.' });

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Gợi ý 3-5 tiêu đề bài viết hấp dẫn cho chủ đề "${keyword}" với giọng văn ${tone} bằng ngôn ngữ ${language}.`;

    let result;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        result = await model.generateContent(prompt);
        console.log('Kết quả từ Gemini:', JSON.stringify(result, null, 2));
        break;
      } catch (error) {
        console.error('Lỗi từ Gemini:', error);
        if (error.code === 429 && attempt < 2) {
          console.log(`Quota vượt giới hạn, thử lại sau ${attempt + 1} giây...`);
          await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 6000));
        } else {
          throw error;
        }
      }
    }

    let content = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (typeof content !== 'string') {
      return res.status(500).json({ msg: 'Dữ liệu trả về từ AI không hợp lệ.' });
    }

    const titles = content
      .split('\n')
      .map(t => t.trim().replace(/^\d+[\).\s]*/, ''))
      .filter(Boolean)
      .slice(0, 5);

    res.json({ titles });
  } catch (err) {
    console.error('Lỗi gợi ý tiêu đề:', err);
    res.status(500).json({ msg: 'Lỗi tạo gợi ý tiêu đề. Chi tiết: ' + (err.message || 'Không xác định') });
  }
});

// Gợi ý từ khóa và meta SEO
router.post('/seo-suggestions', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return res.status(400).json({ msg: 'Thiếu trường content hoặc content không hợp lệ.' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      Dựa trên nội dung sau, hãy đề xuất **đúng 5 từ khóa SEO ngắn gọn, liên quan** (mỗi từ khóa tối đa 3 từ), và một thẻ meta description dài **chính xác 160 ký tự** (không vượt quá), tóm tắt nội dung một cách hấp dẫn. Trả về định dạng JSON thuần túy, không bao gồm markdown:
      {
        "keywords": ["từ khóa 1", "từ khóa 2", "từ khóa 3", "từ khóa 4", "từ khóa 5"],
        "metaDescription": "Mô tả 160 ký tự"
      }
      Nội dung: "${content.substring(0, 1000)}..."
    `;

    let result;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        result = await model.generateContent(prompt);
        console.log('Kết quả từ Gemini:', JSON.stringify(result, null, 2));
        break;
      } catch (error) {
        console.error('Lỗi từ Gemini:', error);
        if (error.code === 429 && attempt < 2) {
          console.log(`Quota vượt giới hạn, thử lại sau ${attempt + 1} giây...`);
          await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 6000));
        } else {
          throw error;
        }
      }
    }

    let text = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (typeof text !== 'string') {
      return res.status(500).json({ msg: 'Dữ liệu trả về từ AI không hợp lệ.' });
    }

    text = text.replace(/```json\n|\n```/g, '').trim();

    let suggestions;
    try {
      suggestions = JSON.parse(text);
    } catch (err) {
      console.error('Lỗi parse JSON:', err);
      const keywordMatch = text.match(/keywords[\s\n]*:[\s\n]*\[([^\]]*)\]/i);
      const metaMatch = text.match(/metaDescription[\s\n]*:[\s\n]*"([^"]*)"/i);
      suggestions = {
        keywords: keywordMatch
          ? keywordMatch[1].split(',').map(k => k.trim().replace(/^"|"$/g, '')).slice(0, 5)
          : [],
        metaDescription: metaMatch ? metaMatch[1].substring(0, 160) : content.substring(0, 160),
      };
    }

    while (suggestions.keywords.length < 5) {
      suggestions.keywords.push(`từ khóa phụ ${suggestions.keywords.length + 1}`);
    }
    suggestions.metaDescription = suggestions.metaDescription.substring(0, 160);

    res.json(suggestions);
  } catch (err) {
    console.error('Lỗi gợi ý SEO:', err);
    res.status(500).json({ msg: 'Lỗi tạo gợi ý SEO. Chi tiết: ' + (err.message || 'Không xác định') });
  }
});

// Tạo hình ảnh minh họa
router.post('/generate-image', verifyToken, async (req, res) => {
  try {
    const { keyword, language } = req.body;
    if (!keyword) {
      return res.status(400).json({ msg: 'Thiếu trường keyword.' });
    }

    const apiKey = process.env.STABLE_DIFFUSION_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ msg: 'Thiếu API key cho Stable Diffusion.' });
    }

    const prompt = `A high-quality image of ${keyword} in ${language === 'vi' ? 'Vietnamese context' : 'global context'}, vibrant colors, realistic style`;
    const response = await axios.post(
      'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
      {
        text_prompts: [{ text: prompt }],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 30,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );

    const imageUrl = `data:image/png;base64,${response.data.artifacts[0].base64}`;
    res.json({ imageUrl });
  } catch (err) {
    console.error('Lỗi sinh hình ảnh:', err.response ? err.response.data : err.message);
    res.status(500).json({ msg: 'Lỗi tạo hình ảnh. Chi tiết: ' + (err.response?.data?.message || err.message || 'Không xác định') });
  }
});

module.exports = router;