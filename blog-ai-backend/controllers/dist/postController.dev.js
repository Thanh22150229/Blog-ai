"use strict";

var _require = require('uuid'),
    uuidv4 = _require.v4;

var genAI = require('../config/gemini');

var pool = require('../config/db');

var path = require('path'); // Hàm kiểm tra giới hạn bài viết


var checkPostLimit = function checkPostLimit(userId) {
  var user, now, _user$rows$, role, daily_post_count, subscription_end_date, limits;

  return regeneratorRuntime.async(function checkPostLimit$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(pool.query('SELECT role, daily_post_count, last_post_date, subscription_end_date FROM users WHERE id = $1', [userId]));

        case 3:
          user = _context.sent;

          if (user.rows[0]) {
            _context.next = 6;
            break;
          }

          throw new Error('Người dùng không tồn tại');

        case 6:
          now = new Date().toISOString().split('T')[0]; // Lấy ngày hiện tại (YYYY-MM-DD)

          if (!(user.rows[0].last_post_date !== now)) {
            _context.next = 10;
            break;
          }

          _context.next = 10;
          return regeneratorRuntime.awrap(pool.query('UPDATE users SET daily_post_count = 0, last_post_date = $1 WHERE id = $2', [now, userId]));

        case 10:
          _user$rows$ = user.rows[0], role = _user$rows$.role, daily_post_count = _user$rows$.daily_post_count, subscription_end_date = _user$rows$.subscription_end_date; // Kiểm tra và cập nhật role nếu gói hết hạn

          if (!(['plus', 'pro'].includes(role) && subscription_end_date && new Date(subscription_end_date) < new Date())) {
            _context.next = 14;
            break;
          }

          _context.next = 14;
          return regeneratorRuntime.awrap(pool.query('UPDATE users SET role = \'user\' WHERE id = $1', [userId]));

        case 14:
          limits = {
            user: 3,
            plus: 10,
            pro: Infinity
          };

          if (!(daily_post_count >= limits[role])) {
            _context.next = 17;
            break;
          }

          return _context.abrupt("return", false);

        case 17:
          _context.next = 19;
          return regeneratorRuntime.awrap(pool.query('UPDATE users SET daily_post_count = daily_post_count + 1, last_post_date = $1 WHERE id = $2', [now, userId]));

        case 19:
          return _context.abrupt("return", true);

        case 22:
          _context.prev = 22;
          _context.t0 = _context["catch"](0);
          throw new Error("L\u1ED7i ki\u1EC3m tra gi\u1EDBi h\u1EA1n b\xE0i vi\u1EBFt: ".concat(_context.t0.message));

        case 25:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 22]]);
};

var createBlogPost = function createBlogPost(req, res) {
  var _req$body, topic, title, _req$body$tone, tone, _req$body$language, language, userId, model, prompt, result, content, summary, newPost;

  return regeneratorRuntime.async(function createBlogPost$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _req$body = req.body, topic = _req$body.topic, title = _req$body.title, _req$body$tone = _req$body.tone, tone = _req$body$tone === void 0 ? 'trung lập' : _req$body$tone, _req$body$language = _req$body.language, language = _req$body$language === void 0 ? 'tiếng Việt' : _req$body$language;
          userId = req.user.id;

          if (!(!topic || !title)) {
            _context2.next = 5;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            msg: 'Chủ đề và tiêu đề không được để trống.'
          }));

        case 5:
          if (!(title.length < 5 || title.length > 200)) {
            _context2.next = 7;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            msg: 'Tiêu đề phải từ 5 đến 200 ký tự.'
          }));

        case 7:
          _context2.next = 9;
          return regeneratorRuntime.awrap(checkPostLimit(userId));

        case 9:
          if (_context2.sent) {
            _context2.next = 11;
            break;
          }

          return _context2.abrupt("return", res.status(403).json({
            msg: 'Đã đạt giới hạn bài viết hôm nay.'
          }));

        case 11:
          if (process.env.GEMINI_API_KEY) {
            _context2.next = 13;
            break;
          }

          return _context2.abrupt("return", res.status(500).json({
            msg: 'Thiếu API key cho Gemini.'
          }));

        case 13:
          model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash'
          });
          prompt = "Vi\u1EBFt m\u1ED9t b\xE0i blog v\u1EDBi ti\xEAu \u0111\u1EC1 \"".concat(title, "\", ng\xF4n ng\u1EEF ").concat(language, ", gi\u1ECDng v\u0103n ").concat(tone, ", ch\u1EE7 \u0111\u1EC1: \"").concat(topic, "\". D\xE0i kho\u1EA3ng 500 t\u1EEB. T\u1EA1o th\xEAm t\xF3m t\u1EAFt ng\u1EAFn (100-150 t\u1EEB) v\u1EDBi ti\xEAu \u0111\u1EC1 \"T\xF3m t\u1EAFt:\".");
          _context2.next = 17;
          return regeneratorRuntime.awrap(model.generateContent(prompt));

        case 17:
          result = _context2.sent;

          if (!(!result || !result.response || !result.response.text)) {
            _context2.next = 20;
            break;
          }

          return _context2.abrupt("return", res.status(500).json({
            msg: 'Kết quả từ Gemini không hợp lệ.'
          }));

        case 20:
          content = result.response.text();

          if (!(typeof content !== 'string' || !content.trim())) {
            _context2.next = 23;
            break;
          }

          return _context2.abrupt("return", res.status(500).json({
            msg: 'Nội dung từ Gemini không hợp lệ hoặc trống.'
          }));

        case 23:
          summary = content.includes('Tóm tắt:') ? content.split('Tóm tắt:')[1].trim().substring(0, 150) : content.substring(0, 150).trim();
          _context2.next = 26;
          return regeneratorRuntime.awrap(pool.query('INSERT INTO posts (id, user_id, title, content, status, summary, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *', [uuidv4(), userId, title, content, 'Draft', summary]));

        case 26:
          newPost = _context2.sent;
          res.status(201).json(newPost.rows[0]);
          _context2.next = 34;
          break;

        case 30:
          _context2.prev = 30;
          _context2.t0 = _context2["catch"](0);
          console.error('Lỗi tạo bài viết:', _context2.t0.message);
          res.status(500).json({
            msg: "L\u1ED7i t\u1EA1o b\xE0i vi\u1EBFt b\u1EB1ng Gemini: ".concat(_context2.t0.message)
          });

        case 34:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 30]]);
};

var createPost = function createPost(req, res) {
  var _req$body2, title, content, status, summary, scheduleDate, metaDescription, keywords, userId, imageUrl, newPost;

  return regeneratorRuntime.async(function createPost$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          _req$body2 = req.body, title = _req$body2.title, content = _req$body2.content, status = _req$body2.status, summary = _req$body2.summary, scheduleDate = _req$body2.scheduleDate, metaDescription = _req$body2.metaDescription, keywords = _req$body2.keywords;
          userId = req.user.id;
          imageUrl = req.file ? "/uploads/".concat(path.basename(req.file.path)) : null;

          if (!(!title || !content)) {
            _context3.next = 6;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            msg: 'Tiêu đề và nội dung không được để trống.'
          }));

        case 6:
          _context3.next = 8;
          return regeneratorRuntime.awrap(checkPostLimit(userId));

        case 8:
          if (_context3.sent) {
            _context3.next = 10;
            break;
          }

          return _context3.abrupt("return", res.status(403).json({
            msg: 'Đã đạt giới hạn bài viết hôm nay.'
          }));

        case 10:
          _context3.next = 12;
          return regeneratorRuntime.awrap(pool.query('INSERT INTO posts (id, user_id, title, content, status, summary, image_url, schedule_date, meta_description, keywords, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) RETURNING *', [uuidv4(), userId, title, content, status || 'Draft', summary || '', imageUrl, scheduleDate || null, metaDescription || '', keywords || '[]']));

        case 12:
          newPost = _context3.sent;
          res.status(201).json(newPost.rows[0]);
          _context3.next = 20;
          break;

        case 16:
          _context3.prev = 16;
          _context3.t0 = _context3["catch"](0);
          console.error('Lỗi lưu bài viết:', _context3.t0.message);

          if (_context3.t0.message.includes('ENOENT')) {
            res.status(500).json({
              msg: 'Lỗi: Thư mục uploads không tồn tại. Vui lòng kiểm tra server.'
            });
          } else {
            res.status(500).json({
              msg: "L\u1ED7i l\u01B0u b\xE0i vi\u1EBFt: ".concat(_context3.t0.message)
            });
          }

        case 20:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 16]]);
};

var updatePostStatus = function updatePostStatus(req, res) {
  var id, status, userId, result;
  return regeneratorRuntime.async(function updatePostStatus$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          id = req.params.id;
          status = req.body.status;
          userId = req.user.id;

          if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
            _context4.next = 6;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            msg: 'ID bài viết không hợp lệ.'
          }));

        case 6:
          if (['Draft', 'Published'].includes(status)) {
            _context4.next = 8;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            msg: 'Trạng thái không hợp lệ.'
          }));

        case 8:
          _context4.next = 10;
          return regeneratorRuntime.awrap(pool.query('UPDATE posts SET status = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING *', [status, id, userId]));

        case 10:
          result = _context4.sent;

          if (result.rows.length > 0) {
            res.json(result.rows[0]);
          } else {
            res.status(404).json({
              msg: 'Bài viết không tồn tại hoặc bạn không có quyền chỉnh sửa.'
            });
          }

          _context4.next = 18;
          break;

        case 14:
          _context4.prev = 14;
          _context4.t0 = _context4["catch"](0);
          console.error('Lỗi cập nhật trạng thái:', _context4.t0.message);
          res.status(500).json({
            msg: 'Lỗi máy chủ.'
          });

        case 18:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 14]]);
};

var getPosts = function getPosts(req, res) {
  var userId, result;
  return regeneratorRuntime.async(function getPosts$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          userId = req.user.id;
          _context5.next = 4;
          return regeneratorRuntime.awrap(pool.query('SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC', [userId]));

        case 4:
          result = _context5.sent;
          res.json({
            posts: result.rows
          });
          _context5.next = 12;
          break;

        case 8:
          _context5.prev = 8;
          _context5.t0 = _context5["catch"](0);
          console.error('Lỗi lấy bài viết:', _context5.t0.message);
          res.status(500).json({
            msg: 'Lỗi máy chủ.'
          });

        case 12:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 8]]);
};

var getPost = function getPost(req, res) {
  var id, userId, result;
  return regeneratorRuntime.async(function getPost$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          id = req.params.id;
          userId = req.user.id;

          if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
            _context6.next = 5;
            break;
          }

          return _context6.abrupt("return", res.status(400).json({
            msg: 'ID bài viết không hợp lệ.'
          }));

        case 5:
          _context6.next = 7;
          return regeneratorRuntime.awrap(pool.query('SELECT * FROM posts WHERE id = $1 AND user_id = $2', [id, userId]));

        case 7:
          result = _context6.sent;

          if (!(result.rows.length === 0)) {
            _context6.next = 10;
            break;
          }

          return _context6.abrupt("return", res.status(404).json({
            msg: 'Bài viết không tồn tại hoặc bạn không có quyền truy cập.'
          }));

        case 10:
          res.json(result.rows[0]);
          _context6.next = 17;
          break;

        case 13:
          _context6.prev = 13;
          _context6.t0 = _context6["catch"](0);
          console.error('Lỗi lấy bài viết:', _context6.t0.message);
          res.status(500).json({
            msg: 'Lỗi máy chủ.'
          });

        case 17:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[0, 13]]);
};

var updatePost = function updatePost(req, res) {
  var id, userId, _req$body3, title, content, image_url, result;

  return regeneratorRuntime.async(function updatePost$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          id = req.params.id;
          userId = req.user.id;
          _req$body3 = req.body, title = _req$body3.title, content = _req$body3.content; // Chỉ cập nhật title và content

          image_url = req.body.image_url || null;

          if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
            _context7.next = 7;
            break;
          }

          return _context7.abrupt("return", res.status(400).json({
            msg: 'ID bài viết không hợp lệ.'
          }));

        case 7:
          if (!(!title || !content)) {
            _context7.next = 9;
            break;
          }

          return _context7.abrupt("return", res.status(400).json({
            msg: 'Tiêu đề và nội dung không được để trống.'
          }));

        case 9:
          // Xử lý file ảnh nếu có
          if (req.file) {
            image_url = "/uploads/".concat(path.basename(req.file.path));
          }

          _context7.next = 12;
          return regeneratorRuntime.awrap(pool.query('UPDATE posts SET title = $1, content = $2, image_url = $3, updated_at = NOW() WHERE id = $4 AND user_id = $5 RETURNING *', [title, content, image_url, id, userId]));

        case 12:
          result = _context7.sent;

          if (result.rows.length > 0) {
            res.json(result.rows[0]);
          } else {
            res.status(404).json({
              msg: 'Bài viết không tồn tại hoặc bạn không có quyền chỉnh sửa.'
            });
          }

          _context7.next = 20;
          break;

        case 16:
          _context7.prev = 16;
          _context7.t0 = _context7["catch"](0);
          console.error('Lỗi cập nhật bài viết:', _context7.t0.message);
          res.status(500).json({
            msg: 'Lỗi máy chủ.'
          });

        case 20:
        case "end":
          return _context7.stop();
      }
    }
  }, null, null, [[0, 16]]);
};

var deletePost = function deletePost(req, res) {
  var id, userId, result;
  return regeneratorRuntime.async(function deletePost$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          _context8.prev = 0;
          id = req.params.id;
          userId = req.user.id;

          if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
            _context8.next = 5;
            break;
          }

          return _context8.abrupt("return", res.status(400).json({
            msg: 'ID bài viết không hợp lệ.'
          }));

        case 5:
          _context8.next = 7;
          return regeneratorRuntime.awrap(pool.query('DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING *', [id, userId]));

        case 7:
          result = _context8.sent;

          if (result.rows.length > 0) {
            res.json({
              msg: 'Bài viết đã được xóa thành công.'
            });
          } else {
            res.status(404).json({
              msg: 'Bài viết không tồn tại hoặc bạn không có quyền xóa.'
            });
          }

          _context8.next = 15;
          break;

        case 11:
          _context8.prev = 11;
          _context8.t0 = _context8["catch"](0);
          console.error('Lỗi xóa bài viết:', _context8.t0.message);
          res.status(500).json({
            msg: 'Lỗi máy chủ.'
          });

        case 15:
        case "end":
          return _context8.stop();
      }
    }
  }, null, null, [[0, 11]]);
};

module.exports = {
  createBlogPost: createBlogPost,
  createPost: createPost,
  updatePostStatus: updatePostStatus,
  getPosts: getPosts,
  getPost: getPost,
  updatePost: updatePost,
  deletePost: deletePost
};