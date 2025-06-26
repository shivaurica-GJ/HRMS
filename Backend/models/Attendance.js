const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  clockIn: {
    type: Date
  },
  clockOut: {
    type: Date
  },
  notes: String,
  status: {
    type: String,
    enum: ['present', 'late', 'absent'],
    default: 'absent'
  }
});

AttendanceSchema.index({ user: 1, date: 1 }, { unique: true });


module.exports = mongoose.model('Attendance', AttendanceSchema);