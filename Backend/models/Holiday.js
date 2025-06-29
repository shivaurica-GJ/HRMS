const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
  title: { type: String, required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  type: { type: String, enum: ['Company-wide', 'Department-specific', 'Festival', 'Birthday'], required: true },
  recurrence_rule: { type: String, default: null },
  description: { type: String, default: '' },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

holidaySchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

const Holiday = mongoose.model('Holiday', holidaySchema);

module.exports = Holiday;
