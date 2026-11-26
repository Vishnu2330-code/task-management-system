const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  createCommentValidator,
  updateCommentValidator,
  commentIdParamValidator,
} = require('../validators/comment.validator');

router.use(authenticate);

// Create comment or reply
router.post('/', createCommentValidator, validate, commentController.createComment);

// Update comment
router.put('/:id', updateCommentValidator, validate, commentController.updateComment);

// Delete comment
router.delete('/:id', commentIdParamValidator, validate, commentController.deleteComment);

module.exports = router;

