const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Task title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [4000, 'Task description cannot exceed 4000 characters'],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Associated project is required'],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['todo', 'in_progress', 'done'],
        message: 'Status must be todo, in_progress, or done',
      },
      default: 'todo',
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'med', 'high'],
        message: 'Priority must be low, med, or high',
      },
      default: 'med',
      index: true,
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task creator is required'],
    },
    dueDate: {
      type: Date,
      default: null,
      index: true,
    },
    labels: {
      type: [String],
      default: [],
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ project: 1, assignee: 1 });
taskSchema.index({ dueDate: 1, status: 1 });
taskSchema.index({ title: 'text', description: 'text' });

const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);
module.exports = Task;
