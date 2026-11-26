# Task Management System

A full-stack Task Management System featuring a Node.js/Express REST API backend with MongoDB and a modern React (Vite) frontend with role-based access control (RBAC), JWT authentication, and interactive dashboards.

## Features

- **Authentication & Authorization**: Secure JWT-based authentication with refresh token rotation and role-based permissions (RBAC).
- **Task Management**: Create, assign, update status, prioritize, and track tasks.
- **Interactive UI**: Responsive frontend built with React, Vite, and Lucide icons.
- **Analytics & Reporting**: Visual data metrics powered by Chart.js.
- **Security**: Hardened backend with Helmet, express-rate-limit, express-validator, and HTTP-only cookie support.

## Project Structure

```text
├── Backend/          # Node.js, Express, MongoDB API
│   ├── src/          # Controllers, models, routes, middlewares
│   ├── tests/        # Test suites (Vitest)
│   ├── server.js     # Entry point
│   └── package.json
└── Forntend/         # React + Vite frontend
    ├── src/          # React components, pages, hooks, services
    ├── index.html
    └── package.json
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (running locally or MongoDB Atlas)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd Forntend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
4. Start Vite development server:
   ```bash
   npm run dev
   ```
