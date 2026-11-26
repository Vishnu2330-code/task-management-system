const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
      index: true,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
      index: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Actor reference is required'],
    },
    action: {
      type: String,
      required: true,
      enum: [
        'PROJECT_CREATED',
        'PROJECT_UPDATED',
        'PROJECT_DELETED',
        'MEMBER_ADDED',
        'MEMBER_REMOVED',
        'TASK_CREATED',
        'TASK_UPDATED',
        'STATUS_CHANGED',
        'TASK_REASSIGNED',
        'TASK_DELETED',
        'COMMENT_ADDED',
        'COMMENT_DELETED',
      ],
      index: true,
    },
    details: {
      type: String,
      required: [true, 'Activity details are required'],
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

activitySchema.index({ project: 1, timestamp: -1 });

const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema);
module.exports = Activity;
