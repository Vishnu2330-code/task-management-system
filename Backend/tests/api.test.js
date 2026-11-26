import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { connectDB, disconnectDB } from '../src/config/db';
import env from '../src/config/env';
import User from '../src/models/User';
import Project from '../src/models/Project';
import Task from '../src/models/Task';
import Comment from '../src/models/Comment';
import Activity from '../src/models/Activity';
import RefreshToken from '../src/models/RefreshToken';
import PasswordResetToken from '../src/models/PasswordResetToken';

describe('Task Management System API Test Suite', () => {
  let adminToken = '';
  let managerToken = '';
  let memberToken = '';
  let memberId = '';
  let managerId = '';
  let testProjectId = '';
  let testTaskId = '';
  let initialRefreshToken = '';

  beforeAll(async () => {
    const testDatabaseUri = new URL(env.mongodbUri);
    testDatabaseUri.pathname = '/task_management_test_db';
    await connectDB(testDatabaseUri.toString());
    // Clean collections
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Task.deleteMany({}),
      Comment.deleteMany({}),
      Activity.deleteMany({}),
      RefreshToken.deleteMany({}),
    ]);

    // Create Admin
    const adminUser = await User.create({
      name: 'Test Admin',
      email: 'test.admin@taskflow.io',
      password: 'Password@123',
      role: 'admin',
    });

    // Create Manager
    const managerUser = await User.create({
      name: 'Test Manager',
      email: 'test.manager@taskflow.io',
      password: 'Password@123',
      role: 'manager',
    });
    managerId = managerUser._id.toString();

    // Create Member
    const memberUser = await User.create({
      name: 'Test Member',
      email: 'test.member@taskflow.io',
      password: 'Password@123',
      role: 'member',
    });
    memberId = memberUser._id.toString();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  // ==========================================
  // 1. AUTHENTICATION & TOKEN ROTATION TESTS
  // ==========================================
  describe('1. Authentication & Security', () => {
    it('should reject public signup attempting to claim admin role', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Hacker',
          email: 'hacker@taskflow.io',
          password: 'Password@123',
          role: 'admin',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should allow public signup for normal member', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'New Registered User',
          email: 'newuser@taskflow.io',
          password: 'Password@123',
          role: 'member',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('member');
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test.admin@taskflow.io',
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should enforce role portal restriction when portalRole is specified', async () => {
      // Member trying to log into Admin Portal
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test.member@taskflow.io',
          password: 'Password@123',
          portalRole: 'admin',
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain("attempted to log in via the ADMIN portal");
    });

    it('should login Admin, Manager, and Member successfully', async () => {
      // Admin Login
      const adminRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test.admin@taskflow.io',
          password: 'Password@123',
          portalRole: 'admin',
        });
      expect(adminRes.status).toBe(200);
      expect(adminRes.body.data.accessToken).toBeDefined();
      adminToken = adminRes.body.data.accessToken;

      // Manager Login
      const mgrRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test.manager@taskflow.io',
          password: 'Password@123',
          portalRole: 'manager',
        });
      expect(mgrRes.status).toBe(200);
      managerToken = mgrRes.body.data.accessToken;

      // Extract refresh token from cookies
      const cookies = mgrRes.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const refreshCookie = cookies.find((c) => c.startsWith('refreshToken='));
      expect(refreshCookie).toBeDefined();
      initialRefreshToken = refreshCookie.split(';')[0].split('=')[1];

      // Member Login
      const memRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test.member@taskflow.io',
          password: 'Password@123',
          portalRole: 'member',
        });
      expect(memRes.status).toBe(200);
      memberToken = memRes.body.data.accessToken;
    });

    it('should access /api/auth/me with valid Bearer token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.role).toBe('admin');
    });

    it('should rotate refresh token and issue new token pair', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', `refreshToken=${initialRefreshToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      // Verify new cookie is set
      const newCookies = res.headers['set-cookie'];
      expect(newCookies).toBeDefined();
      const newRefreshCookie = newCookies.find((c) => c.startsWith('refreshToken='));
      expect(newRefreshCookie).toBeDefined();
      const rotatedRefreshToken = newRefreshCookie.split(';')[0].split('=')[1];
      expect(rotatedRefreshToken).not.toBe(initialRefreshToken);

      // Now attempt REUSE of the old initialRefreshToken -> must trigger 403 reuse detection!
      const reuseRes = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', `refreshToken=${initialRefreshToken}`);

      expect(reuseRes.status).toBe(403);
      expect(reuseRes.body.message).toContain('Refresh token reuse detected');
    });
  });

  // ==========================================
  // 2. USER MANAGEMENT & RBAC TESTS
  // ==========================================
  describe('2. User Management RBAC', () => {
    it('should forbid Member from accessing admin user list', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(403);
    });

    it('should allow Admin to list users with pagination and search', async () => {
      const res = await request(app)
        .get('/api/users?search=Manager&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.pagination.total).toBeDefined();
    });

    it('should allow Member to update their own permitted profile fields', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          name: 'Updated Member Name',
          department: 'Frontend Engineering',
          bio: 'Writing tested React components.',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.user.name).toBe('Updated Member Name');
    });

    it('should permanently delete a user and their associated work', async () => {
      const targetUser = await User.create({
        name: 'User To Delete',
        email: 'user.to.delete@taskflow.io',
        password: 'Password@123',
        role: 'member',
      });
      const ownedProject = await Project.create({
        name: 'Project To Delete',
        owner: targetUser._id,
      });
      const retainedProject = await Project.create({
        name: 'Retained Project',
        owner: managerId,
        members: [targetUser._id],
      });
      const ownedTask = await Task.create({
        title: 'Task In Owned Project',
        project: ownedProject._id,
        creator: targetUser._id,
      });
      const createdTask = await Task.create({
        title: 'Task Created By Deleted User',
        project: retainedProject._id,
        creator: targetUser._id,
      });
      const retainedTask = await Task.create({
        title: 'Task Assigned To Deleted User',
        project: retainedProject._id,
        creator: managerId,
        assignee: targetUser._id,
      });
      const userComment = await Comment.create({
        content: 'Comment by user to delete',
        task: retainedTask._id,
        author: targetUser._id,
      });
      const commentReply = await Comment.create({
        content: 'Reply to deleted comment',
        task: retainedTask._id,
        author: managerId,
        parentComment: userComment._id,
      });
      const retainedActivity = await Activity.create({
        project: retainedProject._id,
        task: retainedTask._id,
        actor: targetUser._id,
        action: 'TASK_UPDATED',
        details: 'Activity by user to delete',
      });
      const refreshToken = await RefreshToken.create({
        user: targetUser._id,
        tokenHash: 'user-to-delete-refresh',
        family: 'user-to-delete-family',
        expiresAt: new Date(Date.now() + 60_000),
      });
      const resetToken = await PasswordResetToken.create({
        user: targetUser._id,
        tokenHash: 'user-to-delete-reset',
        expiresAt: new Date(Date.now() + 60_000),
      });

      const res = await request(app)
        .delete(`/api/users/${targetUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(await User.findById(targetUser._id)).toBeNull();
      expect(await Project.findById(ownedProject._id)).toBeNull();
      expect(await Task.findById(ownedTask._id)).toBeNull();
      expect(await Task.findById(createdTask._id)).toBeNull();
      expect((await Task.findById(retainedTask._id)).assignee).toBeNull();
      expect((await Project.findById(retainedProject._id)).members).not.toContain(targetUser._id);
      expect(await Comment.findById(userComment._id)).toBeNull();
      expect(await Comment.findById(commentReply._id)).toBeNull();
      expect(await Activity.findById(retainedActivity._id)).toBeNull();
      expect(await RefreshToken.findById(refreshToken._id)).toBeNull();
      expect(await PasswordResetToken.findById(resetToken._id)).toBeNull();
    });
  });

  // ==========================================
  // 3. PROJECT MANAGEMENT TESTS
  // ==========================================
  describe('3. Project Management', () => {
    it('should prevent Member from creating projects', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          name: 'Unauthorized Member Project',
          description: 'Testing permission block',
        });

      expect(res.status).toBe(403);
    });

    it('should allow Manager to create project', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          name: 'Enterprise Cloud Platform',
          description: 'Scalable cloud infrastructure migration',
          members: [memberId],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.project.name).toBe('Enterprise Cloud Platform');
      testProjectId = res.body.data.project._id;
    });

    it('should allow authorized Manager to add and remove members', async () => {
      // Create a temporary user to add
      const tempUser = await User.create({
        name: 'Temp User',
        email: 'temp.user@taskflow.io',
        password: 'Password@123',
        role: 'member',
      });

      const availableUsersRes = await request(app)
        .get('/api/users/project-members')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(availableUsersRes.status).toBe(200);
      expect(
        availableUsersRes.body.data.members.some(
          (user) => user._id === tempUser._id.toString()
        )
      ).toBe(true);

      // Add member
      const addRes = await request(app)
        .post(`/api/projects/${testProjectId}/members`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ userId: tempUser._id.toString() });

      expect(addRes.status).toBe(200);

      // Remove member
      const removeRes = await request(app)
        .delete(`/api/projects/${testProjectId}/members`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ userId: tempUser._id.toString() });

      expect(removeRes.status).toBe(200);
    });

    it('should allow project members to view the project details', async () => {
      const res = await request(app)
        .get(`/api/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.project._id).toBe(testProjectId);
      expect(res.body.data.project.taskMetrics).toBeDefined();
    });

    it('should limit admin projects to selected users and tasks to assignees', async () => {
      const otherMember = await User.create({
        name: 'Other Project Member',
        email: 'other.project.member@taskflow.io',
        password: 'Password@123',
        role: 'member',
      });
      const otherMemberLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'other.project.member@taskflow.io',
          password: 'Password@123',
          portalRole: 'member',
        });
      expect(otherMemberLogin.status).toBe(200);
      const otherMemberToken = otherMemberLogin.body.data.accessToken;

      const projectRes = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Admin Shared Project',
          members: [managerId, otherMember._id.toString()],
        });
      expect(projectRes.status).toBe(201);
      const projectId = projectRes.body.data.project._id;

      const taskRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Admin Shared Task',
          project: projectId,
          assignee: memberId,
        });
      expect(taskRes.status).toBe(201);
      const taskId = taskRes.body.data.task._id;

      const unassignedTaskRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Admin Unassigned Task', project: projectId });
      expect(unassignedTaskRes.status).toBe(201);

      for (const token of [managerToken, otherMemberToken]) {
        const projectView = await request(app)
          .get(`/api/projects/${projectId}`)
          .set('Authorization', `Bearer ${token}`);
        expect(projectView.status).toBe(200);

        const projectList = await request(app)
          .get('/api/projects?limit=100')
          .set('Authorization', `Bearer ${token}`);
        expect(projectList.body.data.some((project) => project._id === projectId)).toBe(true);

        const taskList = await request(app)
          .get(`/api/tasks?project=${projectId}&limit=100`)
          .set('Authorization', `Bearer ${token}`);
        expect(taskList.status).toBe(200);
        expect(
          taskList.body.data.some((task) => task._id === taskId)
        ).toBe(token === managerToken);
        expect(
          taskList.body.data.some(
            (task) => task.title === 'Admin Unassigned Task'
          )
        ).toBe(token === managerToken);
      }

      const assignedTaskList = await request(app)
        .get('/api/tasks?limit=100')
        .set('Authorization', `Bearer ${memberToken}`);
      expect(assignedTaskList.body.data.some((task) => task._id === taskId)).toBe(true);

      const assignedProjectList = await request(app)
        .get('/api/projects?limit=100')
        .set('Authorization', `Bearer ${memberToken}`);
      expect(
        assignedProjectList.body.data.some((project) => project._id === projectId)
      ).toBe(false);

      const assignedTaskDetails = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${memberToken}`);
      expect(assignedTaskDetails.status).toBe(200);

      const assignedTaskStatus = await request(app)
        .patch(`/api/tasks/${taskId}/status`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ status: 'in_progress' });
      expect(assignedTaskStatus.status).toBe(200);

      const otherMemberTaskList = await request(app)
        .get(`/api/tasks?project=${projectId}&limit=100`)
        .set('Authorization', `Bearer ${otherMemberToken}`);
      expect(otherMemberTaskList.body.data.some((task) => task._id === taskId)).toBe(false);

      const unauthorizedTaskDetails = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${otherMemberToken}`);
      expect(unauthorizedTaskDetails.status).toBe(403);

      const unauthorizedComments = await request(app)
        .get(`/api/tasks/${taskId}/comments`)
        .set('Authorization', `Bearer ${otherMemberToken}`);
      expect(unauthorizedComments.status).toBe(403);

      const assignedProjectView = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${memberToken}`);
      expect(assignedProjectView.status).toBe(403);
    });

    it('should limit manager projects to selected users and tasks to assignees', async () => {
      const projectRes = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ name: 'Manager Shared Project', members: [memberId] });
      expect(projectRes.status).toBe(201);
      const projectId = projectRes.body.data.project._id;

      const taskRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          title: 'Manager Shared Task',
          project: projectId,
          assignee: memberId,
        });
      expect(taskRes.status).toBe(201);
      const taskId = taskRes.body.data.task._id;

      const projectView = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${memberToken}`);
      expect(projectView.status).toBe(200);

      const projectList = await request(app)
        .get('/api/projects?limit=100')
        .set('Authorization', `Bearer ${memberToken}`);
      expect(projectList.body.data.some((project) => project._id === projectId)).toBe(true);

      const taskList = await request(app)
        .get('/api/tasks?limit=100')
        .set('Authorization', `Bearer ${memberToken}`);
      expect(taskList.status).toBe(200);
      expect(taskList.body.data.some((task) => task._id === taskId)).toBe(true);
    });

    it('should allow the owning Manager to delete a project and all its data', async () => {
      const project = await Project.create({
        name: 'Project For Deletion',
        owner: managerId,
        members: [memberId],
      });
      const task = await Task.create({
        title: 'Task For Deleted Project',
        project: project._id,
        creator: managerId,
      });
      const comment = await Comment.create({
        content: 'Comment for deleted project task',
        task: task._id,
        author: memberId,
      });
      const activity = await Activity.create({
        project: project._id,
        task: task._id,
        actor: managerId,
        action: 'TASK_UPDATED',
        details: 'Activity for deleted project',
      });

      const res = await request(app)
        .delete(`/api/projects/${project._id}`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
      expect(await Project.findById(project._id)).toBeNull();
      expect(await Task.findById(task._id)).toBeNull();
      expect(await Comment.findById(comment._id)).toBeNull();
      expect(await Activity.findById(activity._id)).toBeNull();
    });
  });

  // ==========================================
  // 4. TASK MANAGEMENT & PERMISSIONS
  // ==========================================
  describe('4. Task Management & Permissions', () => {
    it('should prevent Member from creating a new task', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          title: 'Member Attempted Task',
          project: testProjectId,
        });

      expect(res.status).toBe(403);
    });

    it('should allow Manager to create a task assigned to Member with due date', async () => {
      const overdueDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          title: 'Implement TLS Ingress Routing',
          description: 'Configure Let’s Encrypt automated challenge response.',
          project: testProjectId,
          status: 'todo',
          priority: 'high',
          assignee: memberId,
          dueDate: overdueDate,
          labels: ['DevOps', 'Security'],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.task.title).toBe('Implement TLS Ingress Routing');
      testTaskId = res.body.data.task._id;
    });

    it('should allow assigned Member to update task status', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${testTaskId}/status`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({ status: 'in_progress' });

      expect(res.status).toBe(200);
      expect(res.body.data.task.status).toBe('in_progress');
    });

    it('should prevent Member from modifying unauthorized fields like title or priority', async () => {
      const res = await request(app)
        .put(`/api/tasks/${testTaskId}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          title: 'Hacked Title By Member',
          priority: 'low',
        });

      expect(res.status).toBe(403);
    });

    it('should support task filtering by status, priority, and sorting', async () => {
      const res = await request(app)
        .get(`/api/tasks?project=${testProjectId}&status=in_progress&priority=high&sortBy=dueDate&order=asc`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].status).toBe('in_progress');
    });

    it('should filter overdue tasks to incomplete tasks with past due dates', async () => {
      const res = await request(app)
        .get(`/api/tasks?project=${testProjectId}&overdue=true`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.some((task) => task._id === testTaskId)).toBe(true);
      expect(
        res.body.data.every(
          (task) => task.status !== 'done' && new Date(task.dueDate) < new Date()
        )
      ).toBe(true);
    });
  });

  // ==========================================
  // 5. COMMENTS & THREADING
  // ==========================================
  describe('5. Task Threaded Comments', () => {
    let rootCommentId = '';

    it('should allow Member to comment on accessible task', async () => {
      const res = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          task: testTaskId,
          content: 'I have started testing the ingress challenge responses.',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.comment.content).toContain('ingress challenge');
      rootCommentId = res.body.data.comment._id;
    });

    it('should allow Manager to reply to comment (1-level threading)', async () => {
      const res = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          task: testTaskId,
          content: 'Great! Make sure to verify the DNS propagate timeouts as well.',
          parentComment: rootCommentId,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.comment.parentComment).toBe(rootCommentId);
    });

    it('should fetch structured comments with nested replies', async () => {
      const res = await request(app)
        .get(`/api/tasks/${testTaskId}/comments`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.comments.length).toBe(1);
      expect(res.body.data.comments[0].replies.length).toBe(1);
      expect(res.body.data.comments[0].replies[0].content).toContain('DNS propagate');
    });
  });

  // ==========================================
  // 6. ACTIVITY LOG & TIMELINE
  // ==========================================
  describe('6. Activity Logs & Timeline', () => {
    it('should fetch project activity timeline in chronological order', async () => {
      const res = await request(app)
        .get(`/api/projects/${testProjectId}/activity`)
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      const actions = res.body.data.map((a) => a.action);
      expect(actions).toContain('PROJECT_CREATED');
      expect(actions).toContain('TASK_CREATED');
      expect(actions).toContain('STATUS_CHANGED');
    });
  });

  // ==========================================
  // 7. DASHBOARD & STATS CALCULATIONS
  // ==========================================
  describe('7. Dashboard & Reporting Statistics', () => {
    it('should accurately calculate overdue tasks (dueDate in past & status != done)', async () => {
      const res = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
      const { tasks } = res.body.data;
      expect(tasks.totalTasks).toBeGreaterThanOrEqual(1);
      expect(tasks.inProgressTasks).toBeGreaterThanOrEqual(1);
      // Our task is in_progress and dueDate is 2 days in the past -> must be counted in overdueTasks!
      expect(tasks.overdueTasks).toBeGreaterThanOrEqual(1);
    });

    it('should calculate member workload metrics', async () => {
      const res = await request(app)
        .get(`/api/dashboard/workload?projectId=${testProjectId}`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.workload.length).toBeGreaterThan(0);
      const memberWork = res.body.data.workload[0];
      expect(memberWork.totalTasks).toBeGreaterThanOrEqual(1);
      expect(memberWork.name).toBeDefined();
    });
  });
});
