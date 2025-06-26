const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const {
  getMyLeaves,
  updateLeaveStatus,
  getAllLeaveRequests,
  getLeaveRequestsByEmployee,
  getLeaveBalanceByUserId
} = require('../controllers/leaveController');

// Leave routes
router.get('/', auth, role(['hr', 'admin']), getAllLeaveRequests);
router.get('/employee/:userId', auth, role(['hr', 'admin']), getLeaveRequestsByEmployee);
router.get('/balance/:userId', auth, role(['hr', 'employee']), getLeaveBalanceByUserId);
router.get('/me', auth, role(['employee', 'hr']), getMyLeaves);
router.put('/:id', auth, role(['hr', 'admin']), updateLeaveStatus);

module.exports = router;