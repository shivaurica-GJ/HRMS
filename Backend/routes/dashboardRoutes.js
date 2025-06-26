const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const {
  getDashboardStats,
  processLeaveRequest,
} = require("../controllers/dashboardController");

// Dashboard routes (accessible by admin and HR)
router.get("/", auth, role(["admin", "hr"]), getDashboardStats);

router.put('/leaves/:id', auth, role(['admin', 'hr']), processLeaveRequest);

module.exports = router;
