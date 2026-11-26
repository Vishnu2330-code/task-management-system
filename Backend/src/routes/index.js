const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const projectRoutes = require('./project.routes');
const taskRoutes = require('./task.routes');
const commentRoutes = require('./comment.routes');
const activityRoutes = require('./activity.routes');
const dashboardRoutes = require('./dashboard.routes');

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Task Management System API',
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/comments', commentRoutes);
router.use('/activity', activityRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;

