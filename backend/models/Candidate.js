// backend/models/Candidate.js
const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
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
    status: {
      type: String,
      required : true,
      enum: [ "Active",
      "Pending",
      "Inactive",
      "Scheduled",
      "Ongoing",
      "Selected",
      "Rejected",],
      default: 'Pending',
    },
    experience: {
      type: String,
      required: [true, 'Experience is required'],
      trim: true,
    },
    resume: {
      type: String, // File path
      default: null,
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
candidateSchema.index({ name: 'text', email: 'text', position: 'text' });

module.exports = mongoose.model('Candidate', candidateSchema);