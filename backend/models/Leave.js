// backend/models/Leave.js
const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee ID is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    leaveType: {
      type: String,
      required: [true, 'Leave type is required'],
      enum: ['Sick Leave', 'Casual Leave', 'Annual Leave', 'Maternity Leave', 'Paternity Leave', 'Emergency Leave'],
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    document: {
      type: String,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
  },
  { timestamps: true }
);

// Index for faster queries
leaveSchema.index({ employeeId: 1, startDate: 1 });

module.exports = mongoose.model('Leave', leaveSchema);