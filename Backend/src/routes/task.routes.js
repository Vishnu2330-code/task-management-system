const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const commentController = require('../controllers/comment.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  createTaskValidator,
  updateTaskValidator,
  updateTaskStatusValidator,
  taskIdParamValidator,
} = require('../validators/task.validator');

router.use(authenticate);

// List tasks (with filter, search, sort, pagination)
router.get('/', taskController.getTasks);

// Create task (Admin or Manager)
router.post(
  '/',
  authorizeRoles('admin', 'manager'),
  createTaskValidator,
  validate,
  taskController.createTask
);

// Get single task
router.get('/:id', taskIdParamValidator, validate, taskController.getTaskById);

// Update full task (Admin or Manager)
router.put(
  '/:id',
  authorizeRoles('admin', 'manager'),
  updateTaskValidator,
  validate,
  taskController.updateTask
);

// Update task status (Members allowed if assigned; Admin and Manager always allowed)
router.patch(
  '/:id/status',
  updateTaskStatusValidator,
  validate,
  taskController.updateTaskStatus
);

// Delete task (Admin or Manager)
router.delete(
  '/:id',
  authorizeRoles('admin', 'manager'),
  taskIdParamValidator,
  validate,
  taskController.deleteTask
);

// Comments for task
router.get('/:taskId/comments', commentController.getTaskComments);

module.exports = router;

