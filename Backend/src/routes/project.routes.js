const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const activityController = require('../controllers/activity.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  createProjectValidator,
  updateProjectValidator,
  projectIdParamValidator,
  manageMemberValidator,
} = require('../validators/project.validator');

router.use(authenticate);

// List projects accessible to user
router.get('/', projectController.getProjects);

// Create project (Admin or Manager only)
router.post(
  '/',
  authorizeRoles('admin', 'manager'),
  createProjectValidator,
  validate,
  projectController.createProject
);

// Get single project
router.get('/:id', projectIdParamValidator, validate, projectController.getProjectById);

// Update project (Admin or Owner Manager)
router.put(
  '/:id',
  authorizeRoles('admin', 'manager'),
  updateProjectValidator,
  validate,
  projectController.updateProject
);

// Delete project (Admin or Owner Manager)
router.delete(
  '/:id',
  authorizeRoles('admin', 'manager'),
  projectIdParamValidator,
  validate,
  projectController.deleteProject
);

// Add member to project (Admin or Owner Manager)
router.post(
  '/:id/members',
  authorizeRoles('admin', 'manager'),
  manageMemberValidator,
  validate,
  projectController.addMember
);

// Remove member from project (Admin or Owner Manager)
router.delete(
  '/:id/members',
  authorizeRoles('admin', 'manager'),
  manageMemberValidator,
  validate,
  projectController.removeMember
);

// Project activity timeline (GET /api/projects/:id/activity)
router.get('/:id/activity', projectIdParamValidator, validate, activityController.getProjectActivity);

module.exports = router;

