const express = require('express');
const router = express.Router();
const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const Leave = require("../models/Leave");
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const { getMonthlyAttendance, getEmployeeAttendance } = require('../controllers/attendanceController');

// Get monthly attendance
router.get('/monthly', auth, role(['admin', 'hr']), getMonthlyAttendance);
router.get('/:id', auth, getEmployeeAttendance);


// router.get('/attendance/:employeeId', auth, role(['admin', 'hr']), async (req, res) => {
//   try {
//     const { month, year } = req.query;
//     const startDate = new Date(year, month - 1, 1);
//     const endDate = new Date(year, month, 0);
    
//     const attendance = await Attendance.find({
//       user: req.params.employeeId,
//       date: { $gte: startDate, $lte: endDate }
//     }).sort({ date: -1 });

//     res.json(attendance);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });

module.exports = router;