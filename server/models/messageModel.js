const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  type: String,
  content: String,
  delivered: Boolean,
  read: Boolean,
}, {
  timestamps: { createdAt: 'created_at' },
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
