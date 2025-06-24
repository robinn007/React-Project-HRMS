// backend/routes/leave.js
const express = require("express");
const router = express.Router();
const Leave = require("../models/Leave");
const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const path = require("path");
const fs = require("fs");
const moment = require("moment-timezone");

// POST /api/leave - Create a new leave request
router.post("/", protect, upload.single("document"), async (req, res) => {
  try {
    const { employeeId, startDate, endDate, leaveType, reason } = req.body;

    // Validate inputs
    if (!employeeId || !startDate || !endDate || !leaveType || !reason) {
      return res.status(400).json({
        success: false,
        message: "Employee ID, start date, end date, leave type, and reason are required",
      });
    }

    // Parse dates strictly as YYYY-MM-DD
    const parsedStartDate = moment(startDate, "YYYY-MM-DD", true);
    const parsedEndDate = moment(endDate, "YYYY-MM-DD", true);

    if (!parsedStartDate.isValid() || !parsedEndDate.isValid()) {
      console.log("Invalid date format - startDate:", startDate, "endDate:", endDate);
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD (e.g., 2025-06-25).",
      });
    }

    // Normalize to midnight IST
    const normalizedStartDate = parsedStartDate.tz("Asia/Kolkata").startOf("day").toDate();
    const normalizedEndDate = parsedEndDate.tz("Asia/Kolkata").startOf("day").toDate();

    // Validate endDate >= startDate
    if (normalizedEndDate < normalizedStartDate) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date",
      });
    }

    // Check if startDate is tomorrow or later
    const today = moment().tz("Asia/Kolkata").startOf("day").toDate();
    const tomorrow = moment(today).add(1, "day").toDate();

    console.log("Received startDate:", startDate);
    console.log("Parsed startDate:", parsedStartDate.format());
    console.log("Normalized startDate (IST):", normalizedStartDate);
    console.log("Today (IST):", today);
    console.log("Tomorrow (IST):", tomorrow);

    if (normalizedStartDate < tomorrow) {
      return res.status(400).json({
        success: false,
        message: "Leave can only start from tomorrow or later",
      });
    }

    // Check if employee exists and belongs to the user
    const employee = await Employee.findOne({
      _id: employeeId,
      createdBy: req.user._id,
    });
    if (!employee) {
      return res.status(400).json({
        success: false,
        message: "Employee not found or unauthorized",
      });
    }

    // Check if employee is "Present" today
    const attendance = await Attendance.findOne({
      employeeId,
      date: today,
    });

    if (!attendance || attendance.status !== "Present") {
      return res.status(400).json({
        success: false,
        message: "Employee must be marked as Present today to request a leave",
      });
    }

    // Validate leave type
    if (
      ![
        "Sick Leave",
        "Casual Leave",
        "Annual Leave",
        "Maternity Leave",
        "Paternity Leave",
        "Emergency Leave",
      ].includes(leaveType)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave type",
      });
    }

    const leaveData = {
      employeeId,
      startDate: normalizedStartDate,
      endDate: normalizedEndDate,
      leaveType,
      reason,
      status: "Pending",
      createdBy: req.user._id,
    };

    if (req.file) {
      leaveData.document = req.file.path;
    }

    const leave = new Leave(leaveData);
    await leave.save();

    res.status(201).json({
      success: true,
      message: "Leave request created successfully",
      data: leave,
    });
  } catch (error) {
    console.error("Create leave error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating leave request",
      error: error.message,
    });
  }
});


// GET /api/leave - Get leave requests
router.get("/", protect, async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = { createdBy: req.user._id };

    if (search) {
      const employees = await Employee.find({
        createdBy: req.user._id,
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      const employeeIds = employees.map((emp) => emp._id);
      query.employeeId = { $in: employeeIds };
    }

    if (status && status !== "All") {
      query.status = status;
    }

    const leaves = await Leave.find(query)
      .populate("employeeId", "name position")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: leaves,
    });
  } catch (error) {
    console.error("Fetch leaves error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching leave requests",
      error: error.message,
    });
  }
});

// PATCH /api/leave/:id/status - Update leave status
router.patch("/:id/status", protect, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Pending", "Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const leave = await Leave.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found or unauthorized",
      });
    }

    leave.status = status;
    await leave.save();

    res.json({
      success: true,
      message: "Leave status updated successfully",
      data: leave,
    });
  } catch (error) {
    console.error("Update leave status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating leave status",
      error: error.message,
    });
  }
});

// GET /api/leave/:id/document - Download leave document
router.get("/:id/document", protect, async (req, res) => {
  try {
    const leave = await Leave.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found or unauthorized",
      });
    }
    if (!leave.document) {
      return res.status(404).json({
        success: false,
        message: "No document uploaded for this leave",
      });
    }

    const filePath = path.resolve(leave.document);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Document file not found on server",
      });
    }

    res.download(filePath, path.basename(leave.document), (err) => {
      if (err) {
        console.error("File download error:", err);
        res.status(500).json({
          success: false,
          message: "Error downloading document",
        });
      }
    });
  } catch (error) {
    console.error("Download document error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;
