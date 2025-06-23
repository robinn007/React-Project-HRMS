// backend/routes/employees.js
const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// GET /api/employees - Get all employees with filtering and search
router.get('/', protect, async (req, res) => {
  try {
    const { search, status, department, page = 1, limit = 10 } = req.query;
    let query = { createdBy: req.user._id };

    if (search) {
      query.$text = { $search: search };
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (department && department !== 'all') {
      query.department = { $regex: department, $options: 'i' };
    }

    const employees = await Employee.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((page - 1) * Number(limit));

    const total = await Employee.countDocuments(query);

    res.json({
      success: true,
      data: employees,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    console.error('Fetch employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employees',
      error: error.message,
    });
  }
});

// POST /api/employees - Create new employee
router.post('/', protect, upload.single('resume'), async (req, res) => {
  try {
    const {
      employeeId,
      name,
      email,
      phone,
      position,
      department,
      salary,
      joiningDate,
      manager,
      workLocation,
      employmentType,
      candidateId,
      tasks,
    } = req.body;

    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this email already exists',
      });
    }

    const employeeData = {
      employeeId,
      name,
      email,
      phone,
      position,
      department,
      salary,
      joiningDate,
      manager,
      workLocation,
      employmentType,
      candidateId,
      createdBy: req.user._id,
      tasks: tasks ? JSON.parse(tasks) : [],
    };

    if (req.file) {
      employeeData.resume = req.file.path;
    }

    const employee = new Employee(employeeData);
    await employee.save();

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee,
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating employee',
      error: error.message,
    });
  }
});

// PATCH /api/employees/:id - Update employee fields
router.patch('/:id', protect, async (req, res) => {
  try {
    const { joiningDate, employmentType, position, tasks } = req.body;

    // Validate inputs
    if (!joiningDate || !employmentType || !position || tasks === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Joining date, employment type, position, and tasks are required',
      });
    }

    if (!['Full-time', 'Part-time', 'Contract', 'Internship'].includes(employmentType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid employment type',
      });
    }

    // Validate tasks
    if (!Array.isArray(tasks)) {
      return res.status(400).json({
        success: false,
        message: 'Tasks must be an array',
      });
    }

    for (const task of tasks) {
      if (!task.description || !task.dueDate) {
        return res.status(400).json({
          success: false,
          message: 'Each task must have a description and due date',
        });
      }
      if (isNaN(new Date(task.dueDate).getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid due date in tasks',
        });
      }
    }

    // Validate date format
    if (isNaN(new Date(joiningDate).getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid joining date format',
      });
    }

    const employee = await Employee.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      { joiningDate, employmentType, position, tasks },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: updatedEmployee,
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating employee',
      error: error.message,
    });
  }
});

// DELETE /api/employees/:id - Delete employee
router.delete('/:id', protect, async (req, res) => {
  try {
    const employee = await Employee.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    await Employee.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'Employee deleted successfully',
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting employee',
      error: error.message,
    });
  }
});

// GET /api/employees/:id/resume - Download employee resume
router.get('/:id/resume', protect, async (req, res) => {
  try {
    const employee = await Employee.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    if (!employee.resume) {
      return res.status(404).json({ success: false, message: 'No resume uploaded for this employee' });
    }

    const filePath = path.resolve(employee.resume);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Resume file not found on server' });
    }

    res.download(filePath, path.basename(employee.resume), (err) => {
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

// PATCH /api/employees/:id/status - Update employee status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Selected', 'Ongoing', 'Scheduled', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
    }

    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { status },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    res.json({
      success: true,
      message: 'Employee status updated successfully',
      data: employee,
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating employee status',
      error: error.message,
    });
  }
});

module.exports = router;