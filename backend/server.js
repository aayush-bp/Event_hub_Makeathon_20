require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    const PORT = process.env.PORT || 5000;

    const server = app.listen(PORT, () => {
      console.log(`
      ╔━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╗
      ║     EVENT HUB API SERVER STARTED  ║
      ║                                  ║
      ║  🚀 Server running on port: ${PORT}   ║
      ║  📍 Environment: ${process.env.NODE_ENV || 'development'} ║
      ║  🗄️  Connected to MongoDB        ║
      ╚━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╝
      `);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('❌ Unhandled Rejection:', err.message);
      server.close(() => process.exit(1));
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('❌ Uncaught Exception:', err.message);
      process.exit(1);
    });
  } catch (err) {
    console.error('❌ Startup Error:', err.message);
    process.exit(1);
  }
};

startServer();