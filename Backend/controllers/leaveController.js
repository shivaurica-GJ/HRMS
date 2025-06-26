const Leave = require('../models/Leave');
const User = require('../models/User');
const LeaveBalance = require('../models/LeaveBalance');
const Employee = require('../models/Employee');

// Get my leaves
exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ user: req.user.id }).sort({ startDate: -1 });
    res.json(leaves);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update leave status (for HR/Admin)
exports.updateLeaveStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ msg: 'Leave not found' });

    if (status === 'approved') {
      const user = await User.findById(leave.user).populate('employee');
      
      if (leave.type === 'casual') {
        user.employee.casualLeaves -= 1;
      } else if (leave.type === 'sick') {
        user.employee.sickLeaves -= 1;
      }
      
      await user.employee.save();
    }

    leave.status = status;
    await leave.save();

    res.json(leave);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get all leave requests (for admin/HR)
exports.getAllLeaveRequests = async (req, res) => {
  try {
    const { status, type, startDate, endDate } = req.query;
    
    // Build query
    const query = {};
    
    if (status) query.status = status;
    if (type) query.type = type;
    
    if (startDate && endDate) {
      query.$or = [
        { 
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) }
        },
        {
          startDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }
      ];
    }

    const leaves = await Leave.find(query)
      .populate('user', 'fullName email designation department')
      .sort({ startDate: -1 });

    res.json(leaves);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get leave requests by employee
exports.getLeaveRequestsByEmployee = async (req, res) => {
  try {
    const { userId } = req.params;
    const leaves = await Leave.find({ user: userId })
      .sort({ startDate: -1 });

    res.json(leaves);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// GET leave balance for a user (HR/Admin only)
exports.getLeaveBalanceByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const balance = await Employee.findOne({ user: userId }).populate('user', 'fullName email');

    if (!balance) {
      return res.status(404).json({ msg: 'Leave balance not found for this user' });
    }

    res.json(balance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};