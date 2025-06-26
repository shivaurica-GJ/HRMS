const User = require("../models/User");
const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance")
const LeaveBalance = require("../models/LeaveBalance")
const Leave = require("../models/Leave")
const bcrypt = require("bcryptjs");
const Payroll = require("../models/Payroll")

// Get all employees
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: { $in: ["employee", "hr"] } })
      .select("-password -__v")
      .populate("employee", "-user -__v");

    res.json(employees);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Get employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id)
      .select("-password -__v")
      .populate({
        path: "employee",
        options: { strictPopulate: false } // ensures virtual works across versions
      })
      .lean({ virtuals: true }); 
      
    if (!employee) {
      return res.status(404).json({ msg: "Employee not found" });
    }

    res.json(employee);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Update employee details
exports.updateEmployee = async (req, res) => {
  const {
    fullName,
    email,
    phoneNumber,
    designation,
    joinDate,
    department,
    isActive,
    aadharNumber,
    panNumber,
    bankName,
    accountNumber,
    ifscCode,
  } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Update User fields
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (designation) user.designation = designation;
    if (joinDate) user.joinDate = joinDate;
    if (department) user.department = department;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    // Update Employee details
    const employee = await Employee.findOne({ user: user._id });
    if (employee) {
      if (aadharNumber) employee.aadharNumber = aadharNumber;
      if (panNumber) employee.panNumber = panNumber;
      if (bankName) employee.bankName = bankName;
      if (accountNumber) employee.accountNumber = accountNumber;
      if (ifscCode) employee.ifscCode = ifscCode;

      await employee.save();
    }

    const updatedEmployee = await User.findById(user._id)
      .select("-password -__v")
      .populate({
        path: "employee",
        select: "-user -__v",
      });

    res.json(updatedEmployee);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Add employee
exports.addEmployee = async (req, res) => {
  const { fullName, email, designation, startDate, password, role } = req.body;

  // Validate role
  const validRoles = ["admin", "hr", "employee"];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ 
      msg: "Invalid role specified. Valid roles: admin, hr, employee" 
    });
  }

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    // Create user
    user = new User({
      fullName,
      email,
      password,
      role, // Use the role from request
      designation,
      joinDate: startDate,
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Create employee record only for employees
    if (role === "employee") {
      const employee = new Employee({ user: user._id });
      await employee.save();
    }

    res.json({ 
      msg: "User added successfully",
      role: user.role,
      id: user._id
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Get admin profile
exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id)
      .select('-password -__v -isActive -designation -department -joinDate');
    
    if (!admin) {
      return res.status(404).json({ msg: 'Admin not found' });
    }
    
    if (admin.role !== 'admin') {
      return res.status(403).json({ msg: 'Access forbidden' });
    }

    res.json(admin);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update admin profile
exports.updateAdminProfile = async (req, res) => {
  const { 
    fullName, 
    phoneNumber, 
    businessName, 
    gstNumber, 
    businessAddress 
  } = req.body;

  try {
    const admin = await User.findById(req.user.id);
    
    if (!admin) {
      return res.status(404).json({ msg: 'Admin not found' });
    }
    
    if (admin.role !== 'admin') {
      return res.status(403).json({ msg: 'Access forbidden' });
    }

    // Update fields
    if (fullName) admin.fullName = fullName;
    if (phoneNumber) admin.phoneNumber = phoneNumber;
    if (businessName) admin.businessName = businessName;
    if (gstNumber) admin.gstNumber = gstNumber;
    if (businessAddress) admin.businessAddress = businessAddress;
    
    await admin.save();
    
    // Return updated profile without sensitive fields
    const updatedAdmin = admin.toObject();
    delete updatedAdmin.password;
    delete updatedAdmin.__v;
    
    res.json(updatedAdmin);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getEmployeeProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    // 1. Find user by ID
    const user = await User.findById(userId).select('-password -__v').exec();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 2. Find Employee by user reference, populate leaveBalance
    const employee = await Employee.findOne({ user: userId })
      .select('-__v -user')
      .exec();

    if (!employee) {
      return res.status(404).json({ error: 'Employee record not found for this user' });
    }

    // REMOVED: Attendance aggregation (step 3)

    // 3. Recent Leaves (renumbered from original step 4)
    const recentLeaves = await Leave.find({ user: userId })
      .sort({ startDate: -1 })
      .limit(3)
      .select('type startDate endDate status')
      .exec();

    // 4. Payroll Summary (renumbered from original step 5)
    const payrollSummary = await Payroll.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: { $add: ["$baseSalary", "$overtime", "$bonus"] } },
          totalDeductions: { $sum: { $sum: "$deductions.amount" } },
          lastPaymentDate: { $max: "$paymentDate" }
        }
      }
    ]);

    // 5. Compose response without attendance
    res.json({
      profile: {
        ...user.toObject(),
        employee: employee.toObject()
      },
      stats: {
        // REMOVED: attendance property
        leaveBalance: employee.leaveBalance || null,
        recentLeaves,
        payroll: payrollSummary[0] || {}
      }
    });

  } catch (err) {
    console.error('Error in getEmployeeProfile:', err);
    res.status(500).json({ error: 'Server error' });
  }
};