const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' })
      .select('-password -__v')
      .populate('employee', '-user -__v');

    res.json(employees);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get employee by ID (for HR)
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id)
      .select('-password -__v')
      .populate('employee', '-user -__v');

    if (!employee) {
      return res.status(404).json({ msg: 'Employee not found' });
    }

    res.json(employee);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get all attendance
exports.getAllAttendance = async (req, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const attendance = await Attendance.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate('user', 'fullName email');

    res.json(attendance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get pending leave requests
exports.getPendingLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ status: 'pending' })
      .populate('user', 'fullName email designation');

    res.json(leaves);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Approve/reject leave
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