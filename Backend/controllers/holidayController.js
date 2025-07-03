const Holiday = require('../models/Holiday');
const csv = require('csv-parser');
const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

// Helper function to send email notifications
async function sendHolidayNotification(holiday, recipients) {
  // Configure your email transporter here
  const transporter = nodemailer.createTransport({
    // Example using Gmail SMTP
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipients.join(','),
    subject: `Holiday Notification: ${holiday.title}`,
    text: `A new holiday has been added/updated: ${holiday.title} from ${holiday.start_date.toDateString()} to ${holiday.end_date.toDateString()}. Description: ${holiday.description}`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending holiday notification email:', error);
  }
}

exports.getHolidays = async (req, res) => {
  try {
    const { month } = req.query;
    let filter = {};
    if (month) {
      const start = new Date(month + '-01');
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
      filter = {
        start_date: { $lt: end },
        end_date: { $gte: start },
      };
    }
    const holidays = await Holiday.find(filter).sort({ start_date: 1 });
    res.json(holidays);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch holidays' });
  }
};

exports.createHoliday = async (req, res) => {
  try {
    const holidayData = req.body;
    holidayData.created_by = req.user._id; // assuming req.user is set by auth middleware
    const holiday = new Holiday(holidayData);
    await holiday.save();

    // Send notification to employees
    // Fetch employee emails - this is a placeholder, adjust as per your user model
    const recipients = []; // TODO: fetch employee emails
    await sendHolidayNotification(holiday, recipients);

    res.status(201).json(holiday);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create holiday' });
  }
};

exports.updateHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const holidayData = req.body;
    holidayData.updated_at = new Date();
    const holiday = await Holiday.findByIdAndUpdate(id, holidayData, { new: true });

    if (!holiday) {
      return res.status(404).json({ error: 'Holiday not found' });
    }

    // Send notification to employees
    const recipients = []; // TODO: fetch employee emails
    await sendHolidayNotification(holiday, recipients);

    res.json(holiday);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update holiday' });
  }
};

exports.deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const holiday = await Holiday.findByIdAndDelete(id);
    if (!holiday) {
      return res.status(404).json({ error: 'Holiday not found' });
    }
    res.json({ message: 'Holiday deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete holiday' });
  }
};

exports.importHolidays = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'CSV file is required' });
    }
    const holidays = [];
    const filePath = req.file.path;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        holidays.push({
          title: row.title,
          start_date: new Date(row.start_date),
          end_date: new Date(row.end_date),
          type: row.type,
          recurrence_rule: row.recurrence_rule || null,
          description: row.description || '',
          created_by: req.user._id,
        });
      })
      .on('end', async () => {
        await Holiday.insertMany(holidays);
        fs.unlinkSync(filePath);
        res.json({ message: 'Holidays imported successfully' });
      });
  } catch (error) {
    res.status(500).json({ error: 'Failed to import holidays' });
  }
};

exports.exportHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find().lean();
    const fields = ['title', 'start_date', 'end_date', 'type', 'recurrence_rule', 'description'];
    const json2csvParser = new Parser({ fields });
    const csvData = json2csvParser.parse(holidays);

    res.header('Content-Type', 'text/csv');
    res.attachment('holidays.csv');
    res.send(csvData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export holidays' });
  }
};

exports.bulkMarkWeekends = async (req, res) => {
  try {
    const { year } = req.body;
    if (!year) {
      return res.status(400).json({ error: 'Year is required' });
    }

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);
    const holidaysToInsert = [];

    for (let d = new Date(startDate); d < endDate; d.setDate(d.getDate() + 1)) {
      const day = d.getDay();
      if (day === 0 || day === 6) { // Sunday=0, Saturday=6
        holidaysToInsert.push({
          title: 'Weekend',
          start_date: new Date(d),
          end_date: new Date(d),
          type: 'Company-wide',
          recurrence_rule: null,
          description: 'Weekend',
          created_by: req.user._id,
        });
      }
    }

    // Remove existing weekend holidays for the year to avoid duplicates
    await Holiday.deleteMany({
      title: 'Weekend',
      start_date: { $gte: startDate, $lt: endDate }
    });

    await Holiday.insertMany(holidaysToInsert);

    res.json({ message: 'Weekends marked as holidays successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to bulk mark weekends' });
  }
};
