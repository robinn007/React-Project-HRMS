// backend/server.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const candidateRoutes = require('./routes/candidates');
const employeeRoutes = require('./routes/employees'); // 
const attendanceRoutes = require('./routes/attendance'); // 
const leaveRoutes = require('./routes/leave'); // Add this line
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Create uploads directory
const uploadsDir = path.join(__dirname, process.env.UPLOAD_PATH || 'Uploads/resumes');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/employees', employeeRoutes); // Added
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes); 

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.use ("/", (req, res) => {
  res.send("Welcome to the HRMS API");
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));