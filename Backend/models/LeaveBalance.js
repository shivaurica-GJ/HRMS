const mongoose = require('mongoose');

const LeaveBalanceSchema = new mongoose.Schema({
  casualLeaves: {
    type: Number,
    default: 7
  },
  sickLeaves: {
    type: Number,
    default: 7
  },
  resetYear: {
    type: Number,
    default: new Date().getFullYear()
  }
});

module.exports = mongoose.model('LeaveBalance', LeaveBalanceSchema);
