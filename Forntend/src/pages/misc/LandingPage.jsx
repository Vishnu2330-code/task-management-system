import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Layers,
  ShieldCheck,
  Briefcase,
  CheckSquare,
  ArrowRight,
  Kanban,
  MessageSquare,
  Activity,
  BarChart3,
  Lock,
  Sparkles,
  ChevronDown,
  Zap,
  Server,
  Shield,
  Clock,
} from "lucide-react";
import { useScrollThreshold, useParallaxRef } from "../../hooks/useScrollAnimations";
import ScrollProgressBar from "../../components/common/ScrollProgressBar";
import ScrollToTopButton from "../../components/common/ScrollToTopButton";
import ScrollReveal from "../../components/common/ScrollReveal";

export const LandingPage = () => {
  const { isAuthenticated, getDashboardPath } = useAuth();
  const isScrolled = useScrollThreshold(40);
  const parallaxRef = useParallaxRef(0.12);

  const scrollToHeroContent = () => {
    const portalSection = document.getElementById("role-portals");
    if (portalSection) {
      portalSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="landing-page landing-scroll-experience">
      {/* Top Fixed Scroll Progress Indicator */}
      <ScrollProgressBar colorClass="progress-landing" height={3} />

      {/* Ambient Parallax Glow Orbs in Background */}
      <div
        ref={parallaxRef}
        className="landing-ambient-orbs"
        aria-hidden="true"
      >
        <div className="ambient-orb orb-primary" />
        <div className="ambient-orb orb-indigo" />
        <div className="ambient-orb orb-emerald" />
      </div>

      {/* Navigation Header with Scroll Glass Transition */}
      <header className={`landing-nav ${isScrolled ? "is-scrolled" : ""}`}>
        <div className="landing-nav-inner">
          <div className="landing-brand">
            <div className="brand-icon-box">
              <Layers size={22} className="text-white" />
            </div>
            <span className="brand-name">TaskFlow</span>
            <span className="brand-version-badge">Enterprise v2.4</span>
          </div>

          <div className="landing-nav-actions">
            {isAuthenticated ? (
              <Link to={getDashboardPath()} className="btn btn-primary btn-glow">
                <span>Go to Dashboard</span>
                <ArrowRight size={16} />
              </Link>
            ) : (
              <div className="flex-align-center gap-2">
                <Link to="/login/member" className="btn btn-secondary">
                  Sign In
                </Link>
                <Link to="/signup" className="btn btn-primary btn-glow">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-content">
          <div className="hero-pill animate-fade-in">
            <Sparkles size={14} className="text-amber-400" />
            <span>MERN Stack Production Architecture</span>
          </div>

          <h1 className="hero-title animate-slide-up">
            Enterprise Task Management & Collaborative Sprint Platform
          </h1>

          <p className="hero-subtitle animate-slide-up">
            Architected with short-lived JWT access tokens, rotating refresh
            tokens with reuse detection, strict role-based authorization (Admin,
            Manager, Member), Kanban workflows, threaded task discussions, and
            real-time workload telemetry.
          </p>

          {/* Interactive Scroll Cue */}
          <div
            className={`hero-scroll-cue ${isScrolled ? "is-faded" : ""}`}
            onClick={scrollToHeroContent}
            role="button"
            tabIndex={0}
            title="Scroll to explore portals"
          >
            <span className="cue-text">Scroll to explore portals</span>
            <div className="cue-mouse">
              <div className="cue-wheel" />
            </div>
            <ChevronDown size={14} className="cue-arrow-bounce" />
          </div>

          {/* Three Dedicated Role Portals with 3D Perspective Reveal */}
          <div id="role-portals" className="role-portals-grid mt-8">
            {/* Admin Portal Card */}
            <ScrollReveal
              variant="tilt-3d"
              delay={0}
              duration={650}
              className="h-full"
            >
              <div className="role-portal-card border-admin h-full">
                <div className="portal-card-icon bg-indigo-50 text-indigo-600">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="portal-card-title">Admin Portal</h3>
                <p className="portal-card-desc">
                  Full governance: user provisioning, role promotions, and
                  enterprise oversight.
                </p>
                <div className="portal-credentials-tag">
                  <code>admin@taskflow.io</code> / <code>Password@123</code>
                </div>
                <Link to="/login/admin" className="btn btn-admin-portal w-full">
                  <span>Enter Admin Gateway</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </ScrollReveal>

            {/* Manager Portal Card */}
            <ScrollReveal
              variant="tilt-3d"
              delay={140}
              duration={650}
              className="h-full"
            >
              <div className="role-portal-card border-manager h-full">
                <div className="portal-card-icon bg-purple-50 text-purple-600">
                  <Briefcase size={28} />
                </div>
                <h3 className="portal-card-title">Manager Portal</h3>
                <p className="portal-card-desc">
                  Project leadership: sprint planning, member allocation, task
                  assignments, and workload metrics.
                </p>
                <div className="portal-credentials-tag">
                  <code>sarah.manager@taskflow.io</code> /{" "}
                  <code>Password@123</code>
                </div>
                <Link
                  to="/login/manager"
                  className="btn btn-manager-portal w-full"
                >
                  <span>Enter Manager Portal</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </ScrollReveal>

            {/* Member Portal Card */}
            <ScrollReveal
              variant="tilt-3d"
              delay={280}
              duration={650}
              className="h-full"
            >
              <div className="role-portal-card border-member h-full">
                <div className="portal-card-icon bg-emerald-50 text-emerald-600">
                  <CheckSquare size={28} />
                </div>
                <h3 className="portal-card-title">Member Portal</h3>
                <p className="portal-card-desc">
                  Your personal workspace for assigned tasks, sprint progress, and
                  team collaboration.
                </p>
                <div className="portal-credentials-tag">
                  <code>priya.hr@taskflow.io</code> / <code>Password@123</code>
                </div>
                <Link to="/login/member" className="btn btn-member-portal w-full">
                  <span>Enter Member Workspace</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Live Enterprise Telemetry Ticker Strip */}
      <section className="landing-telemetry-strip">
        <div className="telemetry-inner">
          <ScrollReveal variant="fade-up" delay={0} className="telemetry-stat">
            <div className="telemetry-icon-box bg-blue-subtle text-blue-600">
              <Zap size={20} />
            </div>
            <div className="telemetry-info">
              <span className="telemetry-value">99.99%</span>
              <span className="telemetry-label">Cloud Availability</span>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={100} className="telemetry-stat">
            <div className="telemetry-icon-box bg-emerald-subtle text-emerald-600">
              <Clock size={20} />
            </div>
            <div className="telemetry-info">
              <span className="telemetry-value">15 min</span>
              <span className="telemetry-label">Token Expiration Cycle</span>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={200} className="telemetry-stat">
            <div className="telemetry-icon-box bg-indigo-subtle text-indigo-600">
              <Server size={20} />
            </div>
            <div className="telemetry-info">
              <span className="telemetry-value">50k+</span>
              <span className="telemetry-label">Sprint Deliverables</span>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="fade-up" delay={300} className="telemetry-stat">
            <div className="telemetry-icon-box bg-purple-subtle text-purple-600">
              <Shield size={20} />
            </div>
            <div className="telemetry-info">
              <span className="telemetry-value">Zero Trust</span>
              <span className="telemetry-label">Role Isolation</span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Feature Showcase Grid with Staggered Cascading Scroll Entrance */}
      <section className="landing-features">
        <div className="features-container">
          <ScrollReveal variant="fade-up" duration={700}>
            <div className="section-header text-center">
              <h2 className="section-title">
                Built for Scalable Engineering & Product Teams
              </h2>
              <p className="section-subtitle">
                Engineered from the ground up to meet stringent security,
                performance, and accessibility standards
              </p>
            </div>
          </ScrollReveal>

          <div className="features-grid">
            <ScrollReveal variant="fade-up" delay={50}>
              <div className="feature-item feature-card-interactive">
                <div className="feature-icon bg-blue-50 text-blue-600">
                  <Kanban size={22} />
                </div>
                <h4 className="feature-item-title">Kanban Sprint Boards</h4>
                <p className="feature-item-desc">
                  Organize deliverables across To Do, In Progress, and Done
                  columns with instant move buttons, priority badges, and overdue
                  indicators.
                </p>
                <div className="feature-card-glow-line" />
              </div>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={120}>
              <div className="feature-item feature-card-interactive">
                <div className="feature-icon bg-violet-50 text-violet-600">
                  <MessageSquare size={22} />
                </div>
                <h4 className="feature-item-title">Threaded Task Discussions</h4>
                <p className="feature-item-desc">
                  1-level nested discussion threads on tasks for feedback,
                  unblocking discussions, and team collaboration.
                </p>
                <div className="feature-card-glow-line" />
              </div>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={190}>
              <div className="feature-item feature-card-interactive">
                <div className="feature-icon bg-emerald-50 text-emerald-600">
                  <Activity size={22} />
                </div>
                <h4 className="feature-item-title">Audit Activity Timelines</h4>
                <p className="feature-item-desc">
                  Chronological changelogs recording task creation, status
                  transitions, reassignments, comments, and project membership
                  updates.
                </p>
                <div className="feature-card-glow-line" />
              </div>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={260}>
              <div className="feature-item feature-card-interactive">
                <div className="feature-icon bg-rose-50 text-rose-600">
                  <BarChart3 size={22} />
                </div>
                <h4 className="feature-item-title">
                  Real-Time Workload & Overdue Analytics
                </h4>
                <p className="feature-item-desc">
                  Accurate overdue calculation comparing due dates with status,
                  paired with team member capacity metrics and visual chart
                  telemetry.
                </p>
                <div className="feature-card-glow-line" />
              </div>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={330}>
              <div className="feature-item feature-card-interactive">
                <div className="feature-icon bg-indigo-50 text-indigo-600">
                  <Lock size={22} />
                </div>
                <h4 className="feature-item-title">Enterprise Token Security</h4>
                <p className="feature-item-desc">
                  Access tokens with 15-minute expirations and 7-day refresh
                  tokens with automated family rotation and reuse detection.
                </p>
                <div className="feature-card-glow-line" />
              </div>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={400}>
              <div className="feature-item feature-card-interactive">
                <div className="feature-icon bg-amber-50 text-amber-600">
                  <ShieldCheck size={22} />
                </div>
                <h4 className="feature-item-title">
                  Strict Role-Based Permissions
                </h4>
                <p className="feature-item-desc">
                  Enforced server-side: members can only update statuses of tasks
                  assigned to them and cannot create projects or modify protected
                  fields.
                </p>
                <div className="feature-card-glow-line" />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Footer with Subtle Scroll Reveal */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="font-bold text-white">TaskFlow Enterprise</span>
            <span className="text-xs text-muted ml-2">
              Production MERN Architecture
            </span>
          </div>
          <div className="footer-links">
            <Link to="/login/admin" className="footer-link">
              Admin Portal
            </Link>
            <Link to="/login/manager" className="footer-link">
              Manager Portal
            </Link>
            <Link to="/login/member" className="footer-link">
              Member Portal
            </Link>
          </div>
        </div>
      </footer>

      {/* Floating Scroll-To-Top Button with Radial Progress Ring */}
      <ScrollToTopButton threshold={320} label="Back to top" />
    </div>
  );
};

export default LandingPage;
