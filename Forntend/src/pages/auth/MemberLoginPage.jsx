import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../components/layout/AuthLayout";
import Alert from "../../components/common/Alert";
import { CheckSquare, ArrowRight, KeyRound } from "lucide-react";

export const MemberLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleFillDemo = () => {
    setEmail("priya.hr@taskflow.io");
    setPassword("Password@123");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({
        email,
        password,
        portalRole: "member",
      });
      const target = location.state?.from?.pathname || "/member/dashboard";
      navigate(target, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Authentication failed. Please verify credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Member Workspace Login"
      subtitle="Sign in to view your assigned sprint tasks, collaborate on comments, and update progress"
      roleTheme="member"
    >
      {error && (
        <Alert type="error" message={error} onClose={() => setError("")} />
      )}

      <div className="demo-credentials-box box-member">
        <div className="demo-header">
          <KeyRound size={15} />
          <span>Evaluation Credentials (Member)</span>
        </div>
        <p className="demo-text">
          <code>priya.hr@taskflow.io</code> / <code>Password@123</code>
        </p>
        <button
          type="button"
          className="btn-demo-fill btn-fill-member"
          onClick={handleFillDemo}
        >
          Auto-fill HR Member Account
        </button>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label className="form-label" htmlFor="mem-email">
            Member Email
          </label>
          <input
            id="mem-email"
            type="email"
            className="form-input"
            placeholder="priya.hr@organization.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <div className="flex-between">
            <label className="form-label" htmlFor="mem-pass">
              Password
            </label>
            <Link to="/forgot-password" className="auth-link-sm">
              Forgot password?
            </Link>
          </div>
          <input
            id="mem-pass"
            type="password"
            className="form-input"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block btn-member-theme"
          disabled={loading}
        >
          {loading ? (
            "Accessing Dashboard..."
          ) : (
            <>
              <span>Sign In to Workspace</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default MemberLoginPage;
