const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');

// Import middleware
const errorHandler = require('./middlewares/errorHandler');

// Import event listeners
const { initializeEventListeners } = require('./config/events');

const app = express();

// ============================================
// MIDDLEWARE SETUP
// ============================================

// Enable CORS
app.use(cors());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// INITIALIZE EVENT SYSTEM
// ============================================
initializeEventListeners();

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Event Hub API Running',
    version: '1.0.0',
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/recommendations', recommendationRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;