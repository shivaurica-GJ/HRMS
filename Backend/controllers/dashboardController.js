const Leave = require("../models/Leave");
const User  = require('../models/User')
const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const moment = require("moment-timezone");

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const todayStart = moment().tz("Asia/Kolkata").startOf("day").toDate();
    const todayEnd = moment().tz("Asia/Kolkata").endOf("day").toDate();

    // Total active employees and HRs
    const totalStaff = await User.countDocuments({
      role: { $in: ["employee", "hr"] },
      isActive: true,
    });

    // Present today
    const presentStaff = await Attendance.countDocuments({
      date: { $gte: todayStart, $lte: todayEnd },
      status: { $in: ["present", "late"] },
    });

    // Absent = total - present
    const absentStaff = totalStaff - presentStaff;

    // Recent leave requests (last 7 days)
    const recentLeaves = await Leave.find({
      createdAt: { $gte: moment().subtract(7, "days").toDate() },
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: "user",
        select: "fullName email role",
        match: { role: { $in: ["employee", "hr"] } },
      });

    // Filter out leaves with no matched user (other roles)
    const filteredLeaves = recentLeaves.filter(l => l.user);

    // Today's attendance
    const todayAttendance = await Attendance.find({
      date: { $gte: todayStart, $lte: todayEnd },
    })
      .populate({
        path: "user",
        select: "fullName email designation role",
        match: { role: { $in: ["employee", "hr"] } },
      })
      .sort({ clockIn: -1 });

    const filteredAttendance = todayAttendance.filter(a => a.user);

    res.json({
      stats: {
        totalStaff,
        presentToday: presentStaff,
        absentToday: absentStaff,
      },
      recentLeaves: filteredLeaves,
      todayAttendance: filteredAttendance,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};


// Approve/reject leave from dashboard
exports.processLeaveRequest = async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  try {
    const leave = await Leave.findById(id).populate("user");
    if (!leave) return res.status(404).json({ msg: "Leave request not found" });

    // Ensure only employee or HR leave requests are processed
    if (!["employee", "hr"].includes(leave.user.role)) {
      return res.status(403).json({ msg: "Cannot process leave for this role" });
    }

    // Check if leave already processed
    if (leave.status !== "pending") {
      return res.status(400).json({ msg: "Leave request already processed" });
    }

    // Update status
    leave.status = status;
    await leave.save();

    // Deduct leave if approved
    if (status === "approved") {
      const employee = await Employee.findOne({ user: leave.user._id });
      if (!employee)
        return res.status(404).json({ msg: "Employee record not found" });

      if (leave.type === "casual" && employee.casualLeaves > 0) {
        employee.casualLeaves -= 1;
      } else if (leave.type === "sick" && employee.sickLeaves > 0) {
        employee.sickLeaves -= 1;
      }

      await employee.save();
    }

    // Return updated dashboard data
    const recentLeaves = await Leave.find({
      createdAt: { $gte: moment().subtract(7, "days").toDate() },
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: "user",
        select: "fullName email role",
        match: { role: { $in: ["employee", "hr"] } },
      });

    const filteredLeaves = recentLeaves.filter(l => l.user);

    res.json({
      message: `Leave request ${status}`,
      recentLeaves: filteredLeaves,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
