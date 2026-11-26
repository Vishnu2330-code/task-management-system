const { body, param, query } = require('express-validator');

const createTaskValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ max: 200 })
    .withMessage('Task title cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 4000 })
    .withMessage('Description cannot exceed 4000 characters'),
  body('project')
    .notEmpty()
    .withMessage('Project ID is required')
    .isMongoId()
    .withMessage('Invalid project ID format'),
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'done'])
    .withMessage('Status must be todo, in_progress, or done'),
  body('priority')
    .optional()
    .isIn(['low', 'med', 'high'])
    .withMessage('Priority must be low, med, or high'),
  body('assignee')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Invalid assignee user ID format'),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date string'),
  body('labels')
    .optional()
    .isArray()
    .withMessage('Labels must be an array of strings'),
];

const updateTaskValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid task ID parameter'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 200 }),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 4000 }),
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'done'])
    .withMessage('Status must be todo, in_progress, or done'),
  body('priority')
    .optional()
    .isIn(['low', 'med', 'high'])
    .withMessage('Priority must be low, med, or high'),
  body('assignee')
    .optional({ nullable: true })
    .custom((val) => {
      if (val === null || val === '') return true;
      if (/^[0-9a-fA-F]{24}$/.test(val)) return true;
      throw new Error('Assignee must be a valid Mongo ID or null');
    }),
  body('dueDate')
    .optional({ nullable: true })
    .custom((val) => {
      if (val === null || val === '') return true;
      if (!isNaN(Date.parse(val))) return true;
      throw new Error('Invalid due date');
    }),
  body('labels')
    .optional()
    .isArray()
    .withMessage('Labels must be an array of strings'),
  body('order')
    .optional()
    .isNumeric()
    .withMessage('Order must be a number'),
];

const updateTaskStatusValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid task ID parameter'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['todo', 'in_progress', 'done'])
    .withMessage('Status must be todo, in_progress, or done'),
];

const taskIdParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid task ID parameter'),
];

module.exports = {
  createTaskValidator,
  updateTaskValidator,
  updateTaskStatusValidator,
  taskIdParamValidator,
};

