import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";

interface LoginValues {
  email: string;
  password: string;
}

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, status, error } = useAppSelector((state) => state.auth);
  const { register, handleSubmit } = useForm<LoginValues>();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const onSubmit = async (values: LoginValues) => {
    try {
      await dispatch(loginUser(values)).unwrap();
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-card">
        <div className="auth-badge" aria-hidden="true">
          ✈️
        </div>
        <div className="auth-header">
          <h1>Log In to Journey Booking Platform</h1>
          <p>Welcome back! Please enter your credentials to continue.</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <label className="auth-field">
            <span>Email</span>
            <div className="input-wrapper input-wrapper--elevated">
              <span className="input-icon">
                <MailIcon />
              </span>
              <input
                type="email"
                placeholder="you@example.com"
                {...register("email", { required: true })}
              />
            </div>
          </label>
          <label className="auth-field">
            <span>Password</span>
            <div className="input-wrapper input-wrapper--elevated">
              <span className="input-icon">
                <LockIcon />
              </span>
              <input
                type="password"
                placeholder="Enter your password"
                {...register("password", { required: true })}
              />
              <button type="button" className="input-adornment" tabIndex={-1} aria-hidden="true">
                <EyeIcon />
              </button>
            </div>
          </label>
          <div className="auth-inline">
          {error && <p className="error-text">{error}</p>}
            <a href="#" className="link-quiet">
              Forgot password?
            </a>
          </div>
          <button type="submit" className="primary-button auth-submit" disabled={status === "loading"}>
            {status === "loading" ? "Signing in..." : "Log In"}
          </button>
        </form>
        <p className="auth-footer">
          Don&apos;t have an account? <Link to="/register">Sign Up</Link>
        </p>
      </section>
    </div>
  );
};

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="m5 8 7 5 7-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M9 11V7a3 3 0 1 1 6 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export default LoginPage;

