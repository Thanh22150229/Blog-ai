const bcrypt = require('bcrypt');

const password = '17112004Blog@';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('Hashed password:', hash);
});