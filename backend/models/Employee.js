// backend/models/Employee.js
const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^\+?[\d\s-]{10,}$/, 'Please enter a valid phone number'],
    },
    position: {
      type: String,
      required: [true, 'Position is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    salary: {
      type: Number,
      required: [true, 'Salary is required'],
      min: [0, 'Salary must be positive'],
    },
    joiningDate: {
      type: Date,
      required: [true, 'Joining date is required'],
    },
    manager: {
      type: String,
      trim: true,
      default: '',
    },
    workLocation: {
      type: String,
      required: [true, 'Work location is required'],
      trim: true,
    },
    employmentType: {
      type: String,
      required: [true, 'Employment type is required'],
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
    },
    status: {
      type: String,
      enum: ['Selected', 'Ongoing', 'Scheduled', 'Rejected'],
      default: 'Selected',
    },
    resume: {
      type: String,
      default: null,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tasks: [
      {
        description: {
          type: String,
          required: [true, 'Task description is required'],
          trim: true,
        },
        dueDate: {
          type: Date,
          required: [true, 'Task due date is required'],
        },
      },
    ],
  },
  { timestamps: true }
);

// Indexes for faster queries
employeeSchema.index({ name: 'text', email: 'text', position: 'text' });

module.exports = mongoose.model('Employee', employeeSchema);