const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const User = require('../models/User');
const moment = require('moment-timezone');

// Clock in
exports.clockIn = async (req, res) => {
  try {
    const indiaTime = moment().tz('Asia/Kolkata');
    const isLate = indiaTime.hour() > 10 || (indiaTime.hour() === 10 && indiaTime.minute() > 15);

    const start = new Date().setHours(0, 0, 0, 0);
    const end = new Date().setHours(23, 59, 59, 999);

    let attendance = await Attendance.findOne({
      user: req.user.id,
      date: { $gte: start, $lt: end }
    });

    if (attendance) {
      return res.status(400).json({ msg: 'Already clocked in today.' });
    }

    attendance = new Attendance({
      user: req.user.id,
      clockIn: new Date(),
      status: isLate ? 'late' : 'present'
    });

    await attendance.save();
    res.json(attendance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


// Clock out
exports.clockOut = async (req, res) => {
  const { notes } = req.body;

  try {
    let attendance = await Attendance.findOne({ 
      user: req.user.id,
      date: { 
        $gte: new Date().setHours(0,0,0,0),
        $lt: new Date().setHours(23,59,59,999)
      }
    });

    if (!attendance) return res.status(400).json({ msg: 'No clock-in record found' });

    attendance.clockOut = new Date();
    attendance.notes = notes;
    
    await attendance.save();
    res.json(attendance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Apply for leave
exports.applyLeave = async (req, res) => {
  const { type, startDate, endDate, reason } = req.body; // ✅ include reason

  try {
    const user = await User.findById(req.user.id).populate('employee');
    if (!user.employee) return res.status(400).json({ msg: 'Employee record not found' });

    // Check leave balance
    if ((type === 'casual' && user.employee.casualLeaves <= 0) || 
        (type === 'sick' && user.employee.sickLeaves <= 0)) {
      return res.status(400).json({ msg: 'Insufficient leave balance' });
    }

    const leave = new Leave({
      user: req.user.id,
      type,
      startDate,
      endDate,
      reason // ✅ save to DB
    });

    await leave.save();
    res.json(leave);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get leave history
exports.getLeaveHistory = async (req, res) => {
  try {
    const leaves = await Leave.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};


// Get employee profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -__v')
      .populate('employee', '-user -__v');

    if (!user) return res.status(404).json({ msg: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get attendance history
exports.getAttendanceHistory = async (req, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const attendance = await Attendance.find({
      user: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 });

    res.json(attendance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get payroll history
exports.getPayrollHistory = async (req, res) => {
  try {
    const payrolls = await Payroll.find({ user: req.user.id })
      .sort({ paymentDate: -1 })
      .limit(6);

    res.json(payrolls);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// controllers/employeeController.js
exports.getMonthlyAttendanceStats = async (req, res) => {
  try {
    const { id } = req.user;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const records = await Attendance.find({
      user: id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const stats = {
      present: 0,
      absent: 0,
      late: 0
    };

    records.forEach((r) => {
      if (r.status === 'present') stats.present++;
      else if (r.status === 'late') stats.late++;
      else stats.absent++;
    });

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};
