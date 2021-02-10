const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  conversationSID: String,
});

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
