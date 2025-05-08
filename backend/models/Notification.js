const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  type: {
    type: String, 
    required: true,
    enum: ['message', 'system', 'order', 'role_change', 'invoice', 'purchase', 'expense', 'payroll']
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'onModel',
    default: null
  },
  onModel: {
    type: String,
    enum: ['User', 'Invoice', 'Purchase', 'Expense', 'Payroll', 'Message', 'Conversation'],
    default: null
  },
  url: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for efficient querying
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

module.exports = Notification;