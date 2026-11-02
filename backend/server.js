require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const locationRoutes = require('./routes/locationRoutes');
const inspectionRoutes = require('./routes/inspectionRoutes');
const violationRoutes = require('./routes/violationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/violations', violationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Serve frontend static build
const distPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(distPath));

// Fallback to index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
