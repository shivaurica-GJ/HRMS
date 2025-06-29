const express = require('express');
const router = express.Router();
const holidayController = require('../controllers/holidayController');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// All routes require authentication
router.use(authMiddleware);

// GET /api/holidays?month=YYYY-MM
router.get('/', holidayController.getHolidays);

// POST /api/holidays - admin and hr only
router.post(
  '/',
  roleMiddleware(['admin', 'hr']),
  holidayController.createHoliday
);

// PUT /api/holidays/:id - admin and hr only
router.put(
  '/:id',
  roleMiddleware(['admin', 'hr']),
  holidayController.updateHoliday
);

// DELETE /api/holidays/:id - admin and hr only
router.delete(
  '/:id',
  roleMiddleware(['admin', 'hr']),
  holidayController.deleteHoliday
);

// POST /api/holidays/import - admin and hr only
router.post(
  '/import',
  roleMiddleware(['admin', 'hr']),
  upload.single('file'),
  holidayController.importHolidays
);

// GET /api/holidays/export - All authenticated users
router.get('/export', holidayController.exportHolidays);

// POST /api/holidays/bulk-weekends - admin only
router.post(
  '/bulk-weekends',
  roleMiddleware(['admin']),
  holidayController.bulkMarkWeekends
);

module.exports = router;
