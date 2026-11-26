const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [120, 'Project name cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Project description cannot exceed 1000 characters'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project owner is required'],
      index: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['active', 'archived', 'completed'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ members: 1 });
projectSchema.index({ name: 'text', description: 'text' });

const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);
module.exports = Project;
