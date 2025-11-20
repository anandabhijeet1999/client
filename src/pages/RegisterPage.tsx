import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";

interface RegisterValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, status, error } = useAppSelector((state) => state.auth);
  const { register, handleSubmit } = useForm<RegisterValues>();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const onSubmit = async (values: RegisterValues) => {
    try {
      await dispatch(registerUser(values)).unwrap();
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
          <h1>Create Your Account</h1>
          <p>Join us today and get started</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <label className="auth-field">
            <span>Full Name</span>
            <div className="input-wrapper input-wrapper--elevated">
              <span className="input-icon">
                <UserIcon />
              </span>
              <input type="text" placeholder="John Doe" {...register("name", { required: true })} />
            </div>
          </label>
          <label className="auth-field">
            <span>Email</span>
            <div className="input-wrapper input-wrapper--elevated">
              <span className="input-icon">
                <MailIcon />
              </span>
              <input type="email" placeholder="john.doe@example.com" {...register("email", { required: true })} />
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
                placeholder="Choose a strong password"
                {...register("password", { required: true, minLength: 8 })}
              />
            </div>
            <small className="helper-text">Password must be at least 8 characters long.</small>
          </label>
          <label className="auth-field">
            <span>Confirm Password</span>
            <div className="input-wrapper input-wrapper--elevated">
              <span className="input-icon">
                <LockIcon />
              </span>
              <input type="password" placeholder="Re-enter your password" {...register("confirmPassword", { required: true })} />
            </div>
          </label>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="primary-button auth-submit" disabled={status === "loading"}>
            {status === "loading" ? "Creating account..." : "Sign Up"}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Log In</Link>
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

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5 20c1.5-3 4-5 7-5s5.5 2 7 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M9 11V7a3 3 0 1 1 6 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default RegisterPage;

