// backend/routes/attendance.js
const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const { protect } = require('../middleware/auth');

// POST /api/attendance - Save or update attendance record
router.post('/', protect, async (req, res) => {
  try {
    const { employeeId, date, status } = req.body;

    // Validate inputs
    if (!employeeId || !date || !status) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID, date, and status are required',
      });
    }

    if (!['Present', 'Absent'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
    }

    if (isNaN(new Date(date).getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format',
      });
    }

    // Check if employee exists and belongs to the user
    const employee = await Employee.findOne({ _id: employeeId, createdBy: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found or unauthorized',
      });
    }

    // Normalize date to start of day (remove time component)
    const normalizedDate = new Date(new Date(date).setHours(0, 0, 0, 0));

    // Check for existing attendance record
    const existingAttendance = await Attendance.findOne({
      employeeId,
      date: normalizedDate,
    });

    if (existingAttendance) {
      // Update existing record
      existingAttendance.status = status;
      await existingAttendance.save();
      return res.json({
        success: true,
        message: 'Attendance updated successfully',
        data: existingAttendance,
      });
    }

    // Create new attendance record
    const attendance = new Attendance({
      employeeId,
      date: normalizedDate,
      status,
      createdBy: req.user._id,
    });
    await attendance.save();

    res.status(201).json({
      success: true,
      message: 'Attendance recorded successfully',
      data: attendance,
    });
  } catch (error) {
    console.error('Create/Update attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording attendance',
      error: error.message,
    });
  }
});

// GET /api/attendance - Get attendance records
router.get('/', protect, async (req, res) => {
  try {
    const { date, employeeId } = req.query;

    let query = { createdBy: req.user._id };

    if (employeeId) {
      query.employeeId = employeeId;
    }

    if (date) {
      const normalizedDate = new Date(new Date(date).setHours(0, 0, 0, 0));
      query.date = normalizedDate;
    }

    const attendanceRecords = await Attendance.find(query)
      .populate('employeeId', 'name department position tasks')
      .sort({ date: -1 });

    res.json({
      success: true,
      data: attendanceRecords,
    });
  } catch (error) {
    console.error('Fetch attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance records',
      error: error.message,
    });
  }
});

module.exports = router;