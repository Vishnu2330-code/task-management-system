const mongoose = require("mongoose");
const { connectDB, disconnectDB } = require("../config/db");
const User = require("../models/User");
const Project = require("../models/Project");
const Task = require("../models/Task");
const Comment = require("../models/Comment");
const Activity = require("../models/Activity");
const RefreshToken = require("../models/RefreshToken");
const PasswordResetToken = require("../models/PasswordResetToken");

const seedData = async () => {
  try {
    console.log("[Seeder] Connecting to database...");
    await connectDB();

    console.log("[Seeder] Clearing old records...");
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Task.deleteMany({}),
      Comment.deleteMany({}),
      Activity.deleteMany({}),
      RefreshToken.deleteMany({}),
      PasswordResetToken.deleteMany({}),
    ]);

    console.log("[Seeder] Creating users...");
    // Notice: userSchema.pre('save') hashes password automatically
    const admin = await User.create({
      name: "Eleanor Vance (Admin)",
      email: "admin@taskflow.io",
      password: "Password@123",
      role: "admin",
      department: "Executive Operations",
      phone: "+1 (555) 019-2834",
      bio: "Enterprise Systems Director overseeing workspace infrastructure and governance.",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
    });

    const manager1 = await User.create({
      name: "Sarah Jenkins",
      email: "sarah.manager@taskflow.io",
      password: "Password@123",
      role: "manager",
      department: "Engineering Management",
      phone: "+1 (555) 018-7721",
      bio: "Senior Technical Project Manager driving core infrastructure roadmaps.",
      avatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250",
    });

    const manager2 = await User.create({
      name: "Alex Rivera",
      email: "alex.manager@taskflow.io",
      password: "Password@123",
      role: "manager",
      department: "Product Strategy",
      phone: "+1 (555) 016-9932",
      bio: "Product Lead bridging user experience, design systems, and rapid delivery.",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
    });

    const member1 = await User.create({
      name: "Johnathan Cole",
      email: "john.dev@taskflow.io",
      password: "Password@123",
      role: "member",
      department: "Full-Stack Engineering",
      phone: "+1 (555) 014-4411",
      bio: "Full-stack developer building resilient microservices and React interfaces.",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250",
    });

    const member2 = await User.create({
      name: "Emily Zhang",
      email: "emily.design@taskflow.io",
      password: "Password@123",
      role: "member",
      department: "Product Design",
      phone: "+1 (555) 013-8822",
      bio: "UI/UX Designer crafting design systems, typography tokens, and responsive experiences.",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250",
    });

    const member3 = await User.create({
      name: "David Miller",
      email: "david.qa@taskflow.io",
      password: "Password@123",
      role: "member",
      department: "Quality Assurance",
      phone: "+1 (555) 011-5533",
      bio: "QA Engineer specializing in automated integration suites and performance testing.",
      avatar:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=250",
    });

    const hrMember = await User.create({
      name: "Priya Nair",
      email: "priya.hr@taskflow.io",
      password: "Password@123",
      role: "member",
      department: "HR Team",
      phone: "+1 (555) 010-7788",
      bio: "HR specialist supporting recruitment, engagement, and employee experience programs.",
      avatar:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=250",
    });

    console.log("[Seeder] Creating projects...");
    const project1 = await Project.create({
      name: "NextGen Cloud Platform",
      description:
        "Distributed microservices architecture deployment with zero-downtime CI/CD workflows and multi-region failover.",
      owner: manager1._id,
      members: [manager1._id, member1._id, member2._id, member3._id],
      status: "active",
    });

    const project2 = await Project.create({
      name: "Mobile App Redesign 2.0",
      description:
        "Complete visual identity overhaul and React Native performance tuning for iOS and Android platforms.",
      owner: manager2._id,
      members: [manager2._id, member1._id, member2._id],
      status: "active",
    });

    const project3 = await Project.create({
      name: "Real-Time Messaging Platform",
      description:
        "Build a live chat application with HTML, CSS, JavaScript, Firebase, and real-time communication features for instant collaboration.",
      owner: manager1._id,
      members: [manager1._id, member1._id, member2._id, member3._id],
      status: "active",
    });

    const project4 = await Project.create({
      name: "E-Commerce Website",
      description:
        "Create an online store using PHP, MySQL, React, and Stripe for secure shopping, product management, and checkout flows.",
      owner: manager2._id,
      members: [manager2._id, member1._id, member2._id, hrMember._id],
      status: "active",
    });

    const project5 = await Project.create({
      name: "Library Management System",
      description:
        "Track books, members, and borrowing activity using Python, Django, and SQLite for streamlined library operations.",
      owner: manager1._id,
      members: [manager1._id, member3._id, hrMember._id],
      status: "active",
    });

    const project6 = await Project.create({
      name: "AI-Powered Chatbot",
      description:
        "Design an intelligent assistant using Python, TensorFlow, and Dialogflow to answer user queries with natural language understanding.",
      owner: manager2._id,
      members: [manager2._id, member1._id, member3._id],
      status: "active",
    });

    const project7 = await Project.create({
      name: "Online Examination System",
      description:
        "Manage digital tests with Java, Spring Boot, and MySQL for secure exam scheduling, grading, and reporting.",
      owner: manager1._id,
      members: [manager1._id, member1._id, member2._id, member3._id],
      status: "active",
    });

    const project8 = await Project.create({
      name: "Weather Forecasting App",
      description:
        "Pull live weather data using JavaScript, Node.js, and OpenWeatherMap to present forecast insights in a clean dashboard.",
      owner: manager2._id,
      members: [manager2._id, member1._id, member2._id],
      status: "active",
    });

    const project9 = await Project.create({
      name: "Traffic Management System",
      description:
        "Monitor traffic flow with IoT, Python, and MATLAB to support smart city monitoring and congestion analysis.",
      owner: manager1._id,
      members: [manager1._id, member1._id, member3._id],
      status: "active",
    });

    const project10 = await Project.create({
      name: "Personal Budget Tracker",
      description:
        "Track income and expenditure using Kotlin, Flutter, and SQLite with budgeting insights and spending analytics.",
      owner: manager2._id,
      members: [manager2._id, member2._id, hrMember._id],
      status: "active",
    });

    const project11 = await Project.create({
      name: "Phishing Detection System",
      description:
        "Flag malicious links using Python and machine learning with scikit-learn to identify suspicious patterns and protect users.",
      owner: manager1._id,
      members: [manager1._id, member1._id, member3._id],
      status: "active",
    });

    const project12 = await Project.create({
      name: "Social Media Analytics Dashboard",
      description:
        "Analyze trends and feeds using Python, Tweepy, and Tableau to turn social data into actionable insights.",
      owner: manager2._id,
      members: [manager2._id, member1._id, member2._id, member3._id],
      status: "active",
    });

    console.log("[Seeder] Creating tasks...");
    const today = new Date();
    const pastDate3Days = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // overdue!
    const pastDate1Day = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000); // overdue!
    const futureDate2Days = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    const futureDate5Days = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    const futureDate10Days = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);

    const task1 = await Task.create({
      title: "Configure Kubernetes ingress controller with TLS certificates",
      description:
        "Implement cert-manager automated Let’s Encrypt renewal and test ingress routing across canary clusters.",
      project: project1._id,
      status: "in_progress",
      priority: "high",
      assignee: member1._id,
      creator: manager1._id,
      dueDate: futureDate2Days,
      labels: ["DevOps", "Security", "Infrastructure"],
      order: 1,
    });

    const task2 = await Task.create({
      title: "Design high-fidelity design system tokens in Figma",
      description:
        "Deliver responsive token sets for spacing, typography, neutral palettes, and interactive states.",
      project: project1._id,
      status: "done",
      priority: "med",
      assignee: member2._id,
      creator: manager1._id,
      dueDate: pastDate1Day, // was completed on time
      labels: ["Design", "UI/UX"],
      order: 2,
    });

    const task3 = await Task.create({
      title: "Run end-to-end integration benchmark tests for API endpoints",
      description:
        "Simulate 5,000 concurrent requests on task creation and event broadcast channels.",
      project: project1._id,
      status: "todo",
      priority: "high",
      assignee: member3._id,
      creator: manager1._id,
      dueDate: pastDate3Days, // OVERDUE!
      labels: ["Testing", "QA", "Performance"],
      order: 3,
    });

    const task4 = await Task.create({
      title: "Implement refresh token reuse detection and revoking",
      description:
        "Track token families in MongoDB, detect compromised tokens, and invalidate all siblings immediately upon collision.",
      project: project1._id,
      status: "done",
      priority: "high",
      assignee: member1._id,
      creator: manager1._id,
      dueDate: pastDate3Days,
      labels: ["Security", "Auth", "Backend"],
      order: 4,
    });

    const task5 = await Task.create({
      title: "Audit third-party dependencies for CVE vulnerabilities",
      description:
        "Run npm audit and Snyk vulnerability scanner across backend and frontend package trees.",
      project: project3._id,
      status: "in_progress",
      priority: "med",
      assignee: member3._id,
      creator: manager1._id,
      dueDate: futureDate5Days,
      labels: ["Compliance", "Security"],
      order: 1,
    });

    const task6 = await Task.create({
      title: "Refactor bottom navigation and smooth gesture handlers",
      description:
        "Optimize react-native-reanimated transitions and test 60fps framerate on low-end test devices.",
      project: project2._id,
      status: "todo",
      priority: "med",
      assignee: member1._id,
      creator: manager2._id,
      dueDate: futureDate10Days,
      labels: ["Mobile", "Frontend"],
      order: 1,
    });

    const task7 = await Task.create({
      title: "Draft accessible color contrast matrix for WCAG AA compliance",
      description:
        "Verify 4.5:1 ratio for regular text and 3:1 for graphical UI objects across light and dark themes.",
      project: project2._id,
      status: "in_progress",
      priority: "low",
      assignee: member2._id,
      creator: manager2._id,
      dueDate: pastDate1Day, // OVERDUE in_progress!
      labels: ["Accessibility", "Design"],
      order: 2,
    });

    console.log("[Seeder] Creating comments with threaded replies...");
    const parentComment = await Comment.create({
      content:
        "I have started testing the ingress controller configs in staging environment. Cert-manager is passing challenge tests!",
      task: task1._id,
      author: member1._id,
      parentComment: null,
    });

    await Comment.create({
      content:
        "Excellent progress Johnathan! Make sure to verify the DNS propagate timeout settings as well.",
      task: task1._id,
      author: manager1._id,
      parentComment: parentComment._id,
    });

    await Comment.create({
      content:
        "Will do! Adding automated test assertions in the staging smoke test runner.",
      task: task1._id,
      author: member1._id,
      parentComment: parentComment._id,
    });

    console.log("[Seeder] Creating activity log...");
    await Activity.create([
      {
        project: project1._id,
        task: null,
        actor: manager1._id,
        action: "PROJECT_CREATED",
        details: 'Sarah Jenkins created project "NextGen Cloud Platform"',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        project: project1._id,
        task: task1._id,
        actor: manager1._id,
        action: "TASK_CREATED",
        details:
          'Sarah Jenkins created task "Configure Kubernetes ingress controller with TLS certificates"',
        metadata: { priority: "high", status: "todo" },
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        project: project1._id,
        task: task1._id,
        actor: member1._id,
        action: "STATUS_CHANGED",
        details:
          'Johnathan Cole changed status of "Configure Kubernetes ingress controller with TLS certificates" to IN PROGRESS',
        metadata: { from: "todo", to: "in_progress" },
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        project: project1._id,
        task: task2._id,
        actor: member2._id,
        action: "STATUS_CHANGED",
        details:
          'Emily Zhang changed status of "Design high-fidelity design system tokens in Figma" to DONE',
        metadata: { from: "in_progress", to: "done" },
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        project: project1._id,
        task: task1._id,
        actor: member1._id,
        action: "COMMENT_ADDED",
        details:
          'Johnathan Cole commented on "Configure Kubernetes ingress controller with TLS certificates"',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
    ]);

    console.log(
      "===============================================================",
    );
    console.log(
      " SEEDING COMPLETED SUCCESSFULLY!                               ",
    );
    console.log(
      " Default Accounts:                                             ",
    );
    console.log(
      " ------------------------------------------------------------- ",
    );
    console.log(
      " [Admin]   admin@taskflow.io          / Password@123            ",
    );
    console.log(
      " [Manager] sarah.manager@taskflow.io  / Password@123            ",
    );
    console.log(
      " [Manager] alex.manager@taskflow.io   / Password@123            ",
    );
    console.log(
      " [Member]  john.dev@taskflow.io       / Password@123            ",
    );
    console.log(
      " [Member]  emily.design@taskflow.io   / Password@123            ",
    );
    console.log(
      " [Member]  david.qa@taskflow.io       / Password@123            ",
    );
    console.log(
      " [Member]  priya.hr@taskflow.io       / Password@123            ",
    );
    console.log(
      "===============================================================",
    );

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error("[Seeder Error] Failed to seed database:", error);
    await disconnectDB();
    process.exit(1);
  }
};

seedData();
