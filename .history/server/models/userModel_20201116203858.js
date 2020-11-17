const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: [true, 'username cannot be left blank'],
  },
  password: {
    type: String,
    required: [true, 'Please enter the password'],
    minlength: 5,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
