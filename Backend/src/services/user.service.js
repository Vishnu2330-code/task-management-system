const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const Activity = require('../models/Activity');
const RefreshToken = require('../models/RefreshToken');
const PasswordResetToken = require('../models/PasswordResetToken');
const { getProjectVisibilityQuery } = require('./project-visibility');

class UserService {
  /**
   * Get paginated users with search & filters (Admin)
   */
  async getUsers({ page = 1, limit = 10, search = '', role = '', isActive = '' }) {
    const query = {};

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }, { department: searchRegex }];
    }

    if (role) {
      query.role = role;
    }

    if (isActive !== '') {
      query.isActive = isActive === 'true' || isActive === true;
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(query),
    ]);

    return { users, total, page, limit };
  }

  /**
   * Get single user by ID
   */
  async getUserById(userId) {
    const user = await User.findById(userId).lean();
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }
    return user;
  }

  /**
   * Admin Create User
   */
  async createUser({ name, email, password, role, department = 'Engineering' }) {
    const existing = await User.findOne({ email });
    if (existing) {
      const err = new Error('A user with this email address already exists');
      err.statusCode = 409;
      throw err;
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'member',
      department,
      isActive: true,
    });

    return user;
  }

  /**
   * Admin Update User
   */
  async updateUser(userId, updateData) {
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    // Check duplicate email if email is being updated
    if (updateData.email && updateData.email !== user.email) {
      const existing = await User.findOne({ email: updateData.email });
      if (existing) {
        const err = new Error('Email is already taken by another user');
        err.statusCode = 409;
        throw err;
      }
      user.email = updateData.email;
    }

    if (updateData.name !== undefined) user.name = updateData.name;
    if (updateData.role !== undefined) user.role = updateData.role;
    if (updateData.department !== undefined) user.department = updateData.department;
    if (updateData.phone !== undefined) user.phone = updateData.phone;
    if (updateData.bio !== undefined) user.bio = updateData.bio;

    await user.save();
    return user;
  }

  /**
   * Permanently delete a user and their associated work
   */
  async deleteUser(userId, adminUserId) {
    if (userId.toString() === adminUserId.toString()) {
      const err = new Error('You cannot delete your own admin account');
      err.statusCode = 400;
      throw err;
    }

    const user = await User.findById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    const ownedProjects = await Project.find({ owner: user._id }).select('_id').lean();
    const ownedProjectIds = ownedProjects.map((project) => project._id);
    const userTasks = await Task.find({
      $or: [{ project: { $in: ownedProjectIds } }, { creator: user._id }],
    })
      .select('_id')
      .lean();
    const userTaskIds = userTasks.map((task) => task._id);
    const authoredRootComments = await Comment.find({
      author: user._id,
      parentComment: null,
    })
      .select('_id')
      .lean();
    const authoredRootCommentIds = authoredRootComments.map((comment) => comment._id);

    await Comment.deleteMany({
      $or: [
        { task: { $in: userTaskIds } },
        { author: user._id },
        { parentComment: { $in: authoredRootCommentIds } },
      ],
    });
    await Activity.deleteMany({
      $or: [
        { project: { $in: ownedProjectIds } },
        { task: { $in: userTaskIds } },
        { actor: user._id },
      ],
    });
    await Task.deleteMany({ _id: { $in: userTaskIds } });
    await Project.deleteMany({ _id: { $in: ownedProjectIds } });
    await Project.updateMany(
      { members: user._id },
      { $pull: { members: user._id } }
    );
    await Task.updateMany(
      { assignee: user._id },
      { $set: { assignee: null } }
    );
    await RefreshToken.deleteMany({ user: user._id });
    await PasswordResetToken.deleteMany({ user: user._id });
    await User.findByIdAndDelete(user._id);

    return { success: true, message: 'User and associated work deleted successfully' };
  }

  /**
   * Update User's Own Profile
   */
  async updateProfile(userId, { name, phone, department, bio, avatar }) {
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (department !== undefined) user.department = department;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();
    return user;
  }

  /**
   * Get members belonging to manager's projects or available for assignment
   */
  async getProjectMembersForUser(currentUser) {
    if (currentUser.role === 'admin') {
      // Admins can see all active members and managers
      return User.find({ isActive: true }).select('name email role department avatar').lean();
    }

    if (currentUser.role === 'manager') {
      return User.find({
        isActive: true,
        role: { $ne: 'admin' },
      })
        .select('name email role department avatar')
        .lean();
    }

    // Members can view colleagues in shared projects
    const projects = await Project.find(
      await getProjectVisibilityQuery(currentUser)
    ).select('members owner');
    const userIds = new Set();
    userIds.add(currentUser._id.toString());
    projects.forEach((proj) => {
      if (proj.owner) userIds.add(proj.owner.toString());
      proj.members.forEach((m) => userIds.add(m.toString()));
    });

    return User.find({
      _id: { $in: Array.from(userIds) },
      isActive: true,
    })
      .select('name email role department avatar')
      .lean();
  }
}

module.exports = new UserService();
