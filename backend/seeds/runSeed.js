require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const seedDatabase = require('./seedData');

const runSeed = async () => {
  try {
    await connectDB();
    await seedDatabase();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

runSeed();
