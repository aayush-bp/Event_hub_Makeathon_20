const express = require('express');
const aiController = require('../controllers/aiController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.post('/generate-event', protect, aiController.generateEventDetails);

module.exports = router;
