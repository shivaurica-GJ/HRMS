const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  aadharNumber: String,
  panNumber: String,
  bankName: String,
  accountNumber: String,
  ifscCode: String,
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


module.exports = mongoose.model('Employee', EmployeeSchema);