import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { logout } from "../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import logo from "../assets/svg.png";

interface Props {
  children: React.ReactNode;
}

const getInitials = (name?: string) => {
  if (!name) return "A";
  const [first = "", ...rest] = name.trim().split(/\s+/);
  const last = rest.length ? rest[rest.length - 1] : "";
  const initials = `${first.charAt(0)}${last.charAt(0)}`;
  return initials.toUpperCase() || "A";
};

const Layout = ({ children }: Props) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const navLinks = [
    { label: "Home", to: "/" },
    { label: "My Bookings", to: "/bookings" },
    { label: "Profile", to: "/profile" },
  ];

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand">
          <span className="brand-icon" aria-hidden="true">
            <img src={logo} alt="brand logo" className="h-6 w-6" />
          </span>
          <span className="brand-name">Argo</span>
        </Link>

        <div className="app-header__center">
          <nav className="nav-links">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `nav-link${isActive ? " nav-link--active" : ""}`
                }
              >
                {link.label}
              </NavLink>
            ))}
            {user?.role === "admin" && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `nav-link${isActive ? " nav-link--active" : ""}`
                }
              >
                Admin
              </NavLink>
            )}
          </nav>
        </div>

        <div className="header-actions">
          {!user && (
            <Link to="/register" className="avatar avatar--cta" title="Sign up">
              <span className="avatar-icon" aria-hidden="true">
                ✈️
              </span>
              <span className="avatar-label">Sign Up</span>
            </Link>
          )}
          {user && (
            <div className="header-user-menu" ref={menuRef}>
              <button
                type="button"
                className="avatar avatar--button"
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen((prev) => !prev)}
              >
                {user.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="avatar-image" />
                ) : (
                  getInitials(user.name)
                )}
              </button>
              {isMenuOpen && (
                <div className="header-user-menu__dropdown" role="menu">
                  <button
                    type="button"
                    className="ghost-button"
                    role="menuitem"
                    onClick={() => {
                      setIsMenuOpen(false);
                      dispatch(logout());
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
      <main className="app-content">{children}</main>
    </div>
  );
};

export default Layout;
