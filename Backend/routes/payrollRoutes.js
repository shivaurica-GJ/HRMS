const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const {
  createPayroll,
  getPayrollByEmployee,
  getAllPayrolls
} = require('../controllers/payrollController');

// Payroll routes (Admin only)
router.post('/', auth, role(['admin']), createPayroll);
router.get('/employee/:userId', auth, role(['admin', 'employee']), getPayrollByEmployee);
router.get('/', auth, role(['admin']), getAllPayrolls);

module.exports = router;