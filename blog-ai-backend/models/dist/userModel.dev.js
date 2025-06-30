"use strict";

var pool = require('../config/db');

var createUser = function createUser(user) {
  var id, name, email, password, result;
  return regeneratorRuntime.async(function createUser$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          id = user.id, name = user.name, email = user.email, password = user.password;
          _context.next = 3;
          return regeneratorRuntime.awrap(pool.query('INSERT INTO users (id, name, email, password) VALUES ($1, $2, $3, $4) RETURNING id, name, email', [id, name, email, password]));

        case 3:
          result = _context.sent;
          return _context.abrupt("return", result.rows[0]);

        case 5:
        case "end":
          return _context.stop();
      }
    }
  });
};

var findUserByEmail = function findUserByEmail(email) {
  var result;
  return regeneratorRuntime.async(function findUserByEmail$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(pool.query('SELECT * FROM users WHERE email = $1', [email]));

        case 2:
          result = _context2.sent;
          return _context2.abrupt("return", result.rows[0]);

        case 4:
        case "end":
          return _context2.stop();
      }
    }
  });
};

module.exports = {
  createUser: createUser,
  findUserByEmail: findUserByEmail
};