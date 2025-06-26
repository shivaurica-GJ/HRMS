const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const {
  getAllEmployees,
  getAllAttendance,
  getPendingLeaves,
  updateLeaveStatus,
    getEmployeeById
} = require('../controllers/hrController');

// HR routes
router.get('/employees/:id', auth, role(['hr', 'admin']), getEmployeeById);
router.get('/employees', auth, role(['hr', 'admin']), getAllEmployees);
router.get('/attendance', auth, role(['hr', 'admin']), getAllAttendance);
router.get('/leaves/pending', auth, role(['hr', 'admin']), getPendingLeaves);
router.put('/leaves/:id', auth, role(['hr', 'admin']), updateLeaveStatus);

module.exports = router;