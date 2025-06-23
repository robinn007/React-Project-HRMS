// backend/routes/candidates.js
const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');
const Employee = require('../models/Employee');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// GET /api/candidates - Get all candidates with filtering and search
router.get('/', protect, async (req, res) => {
  try {
    const { search, status, position, page = 1, limit = 10 } = req.query;
    let query = { createdBy: req.user._id };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (position && position !== 'all') {
      query.position = { $regex: position, $options: 'i' };
    }

    const candidates = await Candidate.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((page - 1) * Number(limit));

    const total = await Candidate.countDocuments(query);

    res.json({
      success: true,
      data: candidates,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    console.error('Fetch candidates error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching candidates',
      error: error.message,
    });
  }
});

// POST /api/candidates - Create new candidate
router.post('/', protect, upload.single('resume'), async (req, res) => {
  try {
    const { name, email, phone, position, status, experience, notes } = req.body;
    const existingCandidate = await Candidate.findOne({ email });
    if (existingCandidate) {
      return res.status(400).json({
        success: false,
        message: 'Candidate with this email already exists',
      });
    }

    const candidateData = {
      name,
      email,
      phone,
      position,
      status,
      experience,
      notes,
      createdBy: req.user._id,
    };

    if (req.file) {
      candidateData.resume = req.file.path;
    }

    const candidate = new Candidate(candidateData);
    await candidate.save();

    res.status(201).json({
      success: true,
      message: 'Candidate created successfully',
      data: candidate,
    });
  } catch (error) {
    console.error('Create candidate error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating candidate',
      error: error.message,
    });
  }
});

// DELETE /api/candidates/:id - Delete candidate
router.delete('/:id', protect, async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found',
      });
    }

    await Candidate.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'Candidate deleted successfully',
    });
  } catch (error) {
    console.error('Delete candidate error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting candidate',
      error: error.message,
    });
  }
});

// GET /api/candidates/:id/resume - Download candidate resume
router.get('/:id/resume', protect, async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }
    if (!candidate.resume) {
      return res.status(404).json({ success: false, message: 'No resume uploaded for this candidate' });
    }

    const filePath = path.resolve(candidate.resume);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Resume file not found on server' });
    }

    res.download(filePath, path.basename(candidate.resume), (err) => {
      if (err) {
        console.error('File download error:', err);
        res.status(500).json({ success: false, message: 'Error downloading resume' });
      }
    });
  } catch (error) {
    console.error('Download resume error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// PATCH /api/candidates/:id/status - Update candidate status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status, employeeData } = req.body;
    if (![ 'Scheduled', 'Ongoing', 'Selected', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
    }

    const candidate = await Candidate.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found',
      });
    }

    // If status is "Selected," create an employee record
    if (status === 'Selected' && candidate.status !== 'Selected') {
      if (!employeeData) {
        return res.status(400).json({
          success: false,
          message: 'Employee data is required to convert candidate to employee',
        });
      }

      const existingEmployee = await Employee.findOne({ email: candidate.email });
      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: 'Employee with this email already exists',
        });
      }

      const employee = new Employee({
        employeeId: employeeData.employeeId,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        position: candidate.position,
        department: employeeData.department,
        salary: employeeData.salary,
        joiningDate: employeeData.joiningDate,
        manager: employeeData.manager || '',
        workLocation: employeeData.workLocation,
        employmentType: employeeData.employmentType,
        resume: candidate.resume,
        candidateId: candidate._id,
        createdBy: req.user._id,
      });

      await employee.save();
    }

    candidate.status = status;
    await candidate.save();

    res.json({
      success: true,
      message: 'Candidate status updated successfully',
      data: candidate,
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating candidate status',
      error: error.message,
    });
  }
});

module.exports = router;