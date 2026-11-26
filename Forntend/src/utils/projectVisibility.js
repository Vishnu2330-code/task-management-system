export const PROJECT_IDEAS = [
  "Real-Time Messaging Platform",
  "E-Commerce Website",
  "Library Management System",
  "AI-Powered Chatbot",
  "Online Examination System",
  "Weather Forecasting App",
  "Traffic Management System",
  "Personal Budget Tracker",
  "Phishing Detection System",
  "Social Media Analytics Dashboard",
];

export const DEMO_PROJECT_NAMES = new Set([
  "NextGen Cloud Platform",
  "Mobile App Redesign 2.0",
]);

const normalizeProjectName = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().toLowerCase();
};

const DEMO_PROJECT_NAME_LOOKUP = new Set(
  [...DEMO_PROJECT_NAMES].map((name) => normalizeProjectName(name))
);

export const getVisibleProjects = (projects = [], user = null) => {
  if (!Array.isArray(projects)) {
    return [];
  }

  const role = typeof user?.role === "string" ? user.role.trim().toLowerCase() : "";

  if (!user || !role || role === "admin" || role === "manager" || role !== "member") {
    return [...projects];
  }

  return projects.filter((project) => {
    if (project?.isDemo === true || project?.demo === true) {
      return false;
    }

    const normalizedName = normalizeProjectName(project?.name);
    return !DEMO_PROJECT_NAME_LOOKUP.has(normalizedName);
  });
};
