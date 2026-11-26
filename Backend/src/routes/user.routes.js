const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  createUserValidator,
  updateUserValidator,
  userIdParamValidator,
} = require('../validators/user.validator');
const { updateProfileValidator } = require('../validators/auth.validator');

router.use(authenticate);

// Profile endpoint for any authenticated user
router.put('/profile', updateProfileValidator, validate, userController.updateProfile);

// Get members accessible for projects/tasks (Manager and Admin)
router.get('/project-members', userController.getProjectMembers);

// Admin-only User Management
router.get('/', authorizeRoles('admin'), userController.getUsers);
router.post('/', authorizeRoles('admin'), createUserValidator, validate, userController.createUser);
router.get('/:id', authorizeRoles('admin'), userIdParamValidator, validate, userController.getUserById);
router.put('/:id', authorizeRoles('admin'), updateUserValidator, validate, userController.updateUser);
router.delete(
  '/:id',
  authorizeRoles('admin'),
  userIdParamValidator,
  validate,
  userController.deleteUser
);

module.exports = router;
