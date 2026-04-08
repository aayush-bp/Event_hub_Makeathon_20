require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const startServer = async () => {
  try {
    await connectDB();   // DB connect

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Startup error:", err);
  }
};

startServer();