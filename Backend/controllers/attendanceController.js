const Attendance = require("../models/Attendance");
const moment = require("moment-timezone");

// Clock in
exports.clockIn = async (req, res) => {
  try {
    const indiaTime = moment().tz("Asia/Kolkata");
    const isLate =
      indiaTime.hour() > 10 ||
      (indiaTime.hour() === 10 && indiaTime.minute() > 15);

    const attendance = new Attendance({
      user: req.user.id,
      clockIn: new Date(),
      status: isLate ? "late" : "present",
    });

    await attendance.save();
    res.json(attendance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Clock out
exports.clockOut = async (req, res) => {
  const { notes } = req.body;

  try {
    let attendance = await Attendance.findOne({
      user: req.user.id,
      date: {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lt: new Date().setHours(23, 59, 59, 999),
      },
    });

    if (!attendance)
      return res.status(400).json({ msg: "No clock-in record found" });

    attendance.clockOut = new Date();
    attendance.notes = notes;

    await attendance.save();
    res.json(attendance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Get monthly attendance
exports.getMonthlyAttendance = async (req, res) => {
  try {
    const { month, year, userId } = req.query;

    // Validate input
    if (!month || !year) {
      return res.status(400).json({ error: "Month and year are required" });
    }

    const startDate = moment(`${year}-${month}-01`, "YYYY-MM-DD")
      .tz("Asia/Kolkata")
      .startOf("month")
      .toDate();

    const endDate = moment(startDate)
      .tz("Asia/Kolkata")
      .endOf("month")
      .toDate();

    // Build query
    const query = {
      date: { $gte: startDate, $lte: endDate },
    };

    // Add user filter if specified
    if (userId) {
      query.user = userId;
    }

    const attendance = await Attendance.find(query)
      .populate({
        path: "user",
        select: "fullName email designation department role",
      })
      .sort({ date: 1, clockIn: 1 });

    const filtered = attendance.filter(
      (record) => record.user?.role === "employee" || record.user?.role === "hr"
    );

    // Format response
    const formattedAttendance = filtered.map((record) => ({
      id: record._id,
      userId: record.user._id,
      name: record.user.fullName,
      email: record.user.email,
      designation: record.user.designation,
      department: record.user.department,
      date: moment(record.date).format("YYYY-MM-DD"),
      clockIn: record.clockIn
        ? moment(record.clockIn).tz("Asia/Kolkata").format("HH:mm")
        : null,
      clockOut: record.clockOut
        ? moment(record.clockOut).tz("Asia/Kolkata").format("HH:mm")
        : null,
      status: record.status,
      notes: record.notes,
      workingHours:
        record.clockIn && record.clockOut
          ? (new Date(record.clockOut) - new Date(record.clockIn)) /
            (1000 * 60 * 60)
          : null,
    }));

    res.json({
      month: moment(startDate).format("MMMM YYYY"),
      totalDays: moment(endDate).date(),
      totalRecords: attendance.length,
      data: formattedAttendance,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Get attendance for specific employee and month
exports.getEmployeeAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { month, year } = req.query;

    // Validate input
    if (!month || !year) {
      return res.status(400).json({ error: "Month and year are required" });
    }

    if (!id) {
      return res.status(400).json({ error: "Employee ID is required" });
    }

    const monthPadded = String(month).padStart(2, "0");
    const startDate = moment(`${year}-${monthPadded}-01`, "YYYY-MM-DD")
      .tz("Asia/Kolkata")
      .startOf("month")
      .toDate();

    const endDate = moment(startDate)
      .tz("Asia/Kolkata")
      .endOf("month")
      .toDate();

    const attendance = await Attendance.find({
      user: id,
      date: { $gte: startDate, $lte: endDate },
    })
      .sort({ date: 1 })
      .lean();

    // Format response for frontend
    const formattedAttendance = attendance.map((record) => ({
      id: record._id,
      date: moment(record.date).format("YYYY-MM-DD"),
      clockIn: record.clockIn
        ? moment(record.clockIn).tz("Asia/Kolkata").format("HH:mm")
        : null,
      clockOut: record.clockOut
        ? moment(record.clockOut).tz("Asia/Kolkata").format("HH:mm")
        : null,
      status: record.status,
      reason: record.notes || null,
      workDone: record.workDone || null,
    }));

    res.json(formattedAttendance);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
};
