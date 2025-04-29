const express = require('express');
const router = express.Router();
const { runForecast } = require('../controllers/predictCashFlowController');
const { authenticate } = require('../middlewares/authMiddleware');

router.use(authenticate);

router.get('/', runForecast);

module.exports = router;