const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

// Overall summary based on role
router.get('/summary', dashboardController.getSummary);

// Member workload breakdown
router.get('/workload', dashboardController.getMemberWorkload);

// Project specific metrics
router.get('/project/:projectId', dashboardController.getProjectStats);

module.exports = router;

