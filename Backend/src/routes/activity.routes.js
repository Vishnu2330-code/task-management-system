const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activity.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { projectIdParamValidator } = require('../validators/project.validator');
const { validate } = require('../middleware/validate.middleware');

router.use(authenticate);

// Activity for project
router.get('/project/:id', projectIdParamValidator, validate, activityController.getProjectActivity);

module.exports = router;

