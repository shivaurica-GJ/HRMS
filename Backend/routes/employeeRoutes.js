const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance')
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const {
  clockIn,
  clockOut,
  applyLeave,
  getProfile,
  getAttendanceHistory,
  getPayrollHistory,
  getMonthlyAttendanceStats,
  getLeaveHistory
} = require('../controllers/employeeController');

// Employee routes
router.post('/clockin', auth, role(['employee', 'hr']), clockIn);
router.post('/clockout', auth, role(['employee', 'hr']), clockOut);
router.post('/leave', auth, role(['employee', 'hr']), applyLeave);
router.get('/profile', auth, role(['employee', 'hr']), getProfile);
router.get('/attendance', auth, role(['employee', 'hr']), getAttendanceHistory);
router.get('/attendance/stats', auth, role(['employee', 'hr']), getMonthlyAttendanceStats);
router.get('/payroll', auth, role(['employee', 'hr']), getPayrollHistory);
router.get('/leave', auth, role(['employee', 'hr']), getLeaveHistory);

router.get('/attendance/status', auth, async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const attendance = await Attendance.findOne({
      user: req.user.id,
      date: { $gte: todayStart, $lte: todayEnd }
    });

    const clockedIn = !!(attendance && attendance.clockIn);
    const clockedOut = !!(attendance && attendance.clockOut);

    res.json({ clockedIn: clockedIn && !clockedOut }); // only show clock-out if not already done
  } catch (err) {
    console.error("Status Check Error:", err.message);
    res.status(500).send("Server error");
  }
});


module.exports = router;