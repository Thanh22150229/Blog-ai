"use strict";

var pool = require('../config/db'); // Helper function để xử lý phản hồi và lỗi


var handleResponse = function handleResponse(res, data) {
  var statusCode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 200;
  res.status(statusCode).json(data);
};

var handleError = function handleError(res, err) {
  var defaultMessage = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'Lỗi máy chủ.';
  console.error('Lỗi:', err.message);
  handleResponse(res, {
    msg: err.message || defaultMessage
  }, 500);
}; // Kiểm tra vai trò hợp lệ


var validRoles = ['user', 'plus', 'pro', 'admin'];
var validPlans = ['plus', 'pro']; // Controller functions

var getUsers = function getUsers(req, res) {
  var result;
  return regeneratorRuntime.async(function getUsers$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(pool.query('SELECT id, name, email, role, subscription_end_date, daily_post_count, last_post_date FROM users ORDER BY created_at DESC'));

        case 3:
          result = _context.sent;
          handleResponse(res, {
            users: result.rows
          });
          _context.next = 10;
          break;

        case 7:
          _context.prev = 7;
          _context.t0 = _context["catch"](0);
          handleError(res, _context.t0);

        case 10:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 7]]);
};

var getUser = function getUser(req, res) {
  var id, result;
  return regeneratorRuntime.async(function getUser$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          id = req.params.id;
          _context2.next = 4;
          return regeneratorRuntime.awrap(pool.query('SELECT id, name, email, role, subscription_end_date, daily_post_count, last_post_date FROM users WHERE id = $1', [id]));

        case 4:
          result = _context2.sent;

          if (!(result.rows.length === 0)) {
            _context2.next = 7;
            break;
          }

          return _context2.abrupt("return", handleResponse(res, {
            msg: 'Người dùng không tồn tại.'
          }, 404));

        case 7:
          handleResponse(res, result.rows[0]);
          _context2.next = 13;
          break;

        case 10:
          _context2.prev = 10;
          _context2.t0 = _context2["catch"](0);
          handleError(res, _context2.t0);

        case 13:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 10]]);
};

var updateUserRole = function updateUserRole(req, res) {
  var id, role, result;
  return regeneratorRuntime.async(function updateUserRole$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.prev = 0;
          id = req.params.id;
          role = req.body.role;

          if (!(!role || !validRoles.includes(role))) {
            _context3.next = 5;
            break;
          }

          return _context3.abrupt("return", handleResponse(res, {
            msg: 'Role không hợp lệ.'
          }, 400));

        case 5:
          _context3.next = 7;
          return regeneratorRuntime.awrap(pool.query('UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, role', [role, id]));

        case 7:
          result = _context3.sent;

          if (!(result.rows.length === 0)) {
            _context3.next = 10;
            break;
          }

          return _context3.abrupt("return", handleResponse(res, {
            msg: 'Người dùng không tồn tại.'
          }, 404));

        case 10:
          handleResponse(res, result.rows[0]);
          _context3.next = 16;
          break;

        case 13:
          _context3.prev = 13;
          _context3.t0 = _context3["catch"](0);
          handleError(res, _context3.t0);

        case 16:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[0, 13]]);
};

var updateSubscription = function updateSubscription(req, res) {
  var id, _req$body, plan, end_date, userResult;

  return regeneratorRuntime.async(function updateSubscription$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          id = req.params.id;
          _req$body = req.body, plan = _req$body.plan, end_date = _req$body.end_date;

          if (!(!plan || !validPlans.includes(plan) || !end_date)) {
            _context4.next = 5;
            break;
          }

          return _context4.abrupt("return", handleResponse(res, {
            msg: 'Plan hoặc end_date không hợp lệ.'
          }, 400));

        case 5:
          _context4.next = 7;
          return regeneratorRuntime.awrap(pool.query('SELECT id FROM users WHERE id = $1', [id]));

        case 7:
          userResult = _context4.sent;

          if (!(userResult.rows.length === 0)) {
            _context4.next = 10;
            break;
          }

          return _context4.abrupt("return", handleResponse(res, {
            msg: 'Người dùng không tồn tại.'
          }, 404));

        case 10:
          _context4.next = 12;
          return regeneratorRuntime.awrap(pool.query('UPDATE users SET role = $1, subscription_end_date = $2, updated_at = NOW() WHERE id = $3', [plan, end_date, id]));

        case 12:
          handleResponse(res, {
            msg: 'Cập nhật subscription thành công.'
          });
          _context4.next = 18;
          break;

        case 15:
          _context4.prev = 15;
          _context4.t0 = _context4["catch"](0);
          handleError(res, _context4.t0);

        case 18:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 15]]);
};

var deleteUser = function deleteUser(req, res) {
  var id, result;
  return regeneratorRuntime.async(function deleteUser$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          id = req.params.id;
          _context5.next = 4;
          return regeneratorRuntime.awrap(pool.query('DELETE FROM users WHERE id = $1 RETURNING id, name', [id]));

        case 4:
          result = _context5.sent;

          if (!(result.rows.length === 0)) {
            _context5.next = 7;
            break;
          }

          return _context5.abrupt("return", handleResponse(res, {
            msg: 'Người dùng không tồn tại.'
          }, 404));

        case 7:
          handleResponse(res, {
            msg: 'Người dùng đã được xóa.'
          });
          _context5.next = 13;
          break;

        case 10:
          _context5.prev = 10;
          _context5.t0 = _context5["catch"](0);
          handleError(res, _context5.t0);

        case 13:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 10]]);
}; // Hàm hiển thị yêu cầu nâng cấp


var getUpgradeRequests = function getUpgradeRequests(req, res) {
  var result;
  return regeneratorRuntime.async(function getUpgradeRequests$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.prev = 0;
          // Thêm log để debug
          console.log('Executing getUpgradeRequests query...');
          _context6.next = 4;
          return regeneratorRuntime.awrap(pool.query('SELECT p.userId, u.name, u.email, p.plan, p.amount, p.status, p.createdAt ' + 'FROM Payments p JOIN users u ON p.userId = u.id WHERE p.status = $1 ORDER BY p.createdAt DESC', ['pending']));

        case 4:
          result = _context6.sent;
          console.log('Query result:', result.rows);

          if (!(result.rows.length === 0)) {
            _context6.next = 8;
            break;
          }

          return _context6.abrupt("return", handleResponse(res, {
            requests: [],
            msg: 'Không có yêu cầu nâng cấp nào.'
          }));

        case 8:
          handleResponse(res, {
            requests: result.rows
          });
          _context6.next = 15;
          break;

        case 11:
          _context6.prev = 11;
          _context6.t0 = _context6["catch"](0);
          console.error('Error in getUpgradeRequests:', _context6.t0.stack);
          handleError(res, _context6.t0, 'Không thể tải danh sách yêu cầu nâng cấp.');

        case 15:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[0, 11]]);
};

module.exports = {
  getUsers: getUsers,
  getUser: getUser,
  updateUserRole: updateUserRole,
  updateSubscription: updateSubscription,
  deleteUser: deleteUser,
  getUpgradeRequests: getUpgradeRequests
};