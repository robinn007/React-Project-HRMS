// backend/models/Attendance.js
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee ID is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      index: true, // Index for faster queries by date
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: ['Present', 'Absent'],
      default: 'Present',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
  },
  { timestamps: true }
);

// Ensure unique attendance record per employee per date
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);