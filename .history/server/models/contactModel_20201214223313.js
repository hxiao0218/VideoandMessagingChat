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
  numMessages: Number,
  conversationSID: String,
}, {
  timestamps: { createdAt: 'created_at' },
});

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
