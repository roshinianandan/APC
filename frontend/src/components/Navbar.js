import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch (e) {
    return null;
  }
}

function activeClass(pathname, to) {
  return pathname.indexOf(to) === 0 ? " active fw-semibold" : "";
}

function Navbar() {
  const user = getUser();
  const role = user?.role || "";
  const location = useLocation();
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    navigate("/login");
  }

  let links = [];

  if (user) {
    const r = role.toLowerCase();

    if (r === "student") {
      links = [
        { to: "/student", label: "Dashboard" },
        { to: "/student/record", label: "My Record" },
        { to: "/student/cluster", label: "My Group" },
        { to: "/student/suggestions", label: "Suggestions" }
      ];
    } else if (r === "faculty") {
      links = [
        { to: "/faculty", label: "Dashboard" },
        { to: "/faculty/records", label: "Records" },
        { to: "/faculty/clustering", label: "Clustering" },
        { to: "/faculty/results", label: "Results" }
      ];
    } else {
      links = [
        { to: "/admin", label: "Dashboard" },
        { to: "/admin/users", label: "Users" },
        { to: "/faculty/records", label: "Records" },
        { to: "/faculty/clustering", label: "Clustering" },
        { to: "/faculty/results", label: "Results" }
      ];
    }
  }

  const homeLink =
    role === "student"
      ? "/student"
      : role === "faculty"
      ? "/faculty"
      : role === "admin"
      ? "/admin"
      : "/";

  function roleBadge(role) {
    const r = role.toLowerCase();

    if (r === "admin")
      return (
        <span
          className="px-3 py-2 rounded-pill fw-semibold text-white"
          style={{ background: "#7c3aed" }} // Bright Purple
        >
          ADMIN
        </span>
      );

    if (r === "faculty")
      return (
        <span
          className="px-3 py-2 rounded-pill fw-semibold text-white"
          style={{ background: "#2563eb" }} // Bright Blue
        >
          FACULTY
        </span>
      );

    if (r === "student")
      return (
        <span
          className="px-3 py-2 rounded-pill fw-semibold text-white"
          style={{ background: "#16a34a" }} // Bright Green
        >
          STUDENT
        </span>
      );

    return null;
  }

  return (
    <nav
      className="navbar navbar-expand-lg shadow-sm"
      style={{ background: "#1f2937" }} // Modern dark gray (not pure black)
    >
      <div className="container">

        {/* Brand */}
        <Link to={homeLink} className="navbar-brand fw-bold text-white">
          🎓 Academic Clustering
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">

          {/* Center Links */}
          <ul className="navbar-nav mx-auto">
            {links.map((l) => (
              <li className="nav-item" key={l.to}>
                <Link
                  className={
                    "nav-link text-light px-3" +
                    activeClass(location.pathname, l.to)
                  }
                  to={l.to}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right Side */}
          {user && (
            <div className="d-flex align-items-center gap-3">

              {roleBadge(role)}

              <span className="text-light small fw-medium">
                {user.name || "User"}
              </span>

              {/* Bright Logout Button */}
              <button
                onClick={logout}
                className="btn fw-semibold text-white"
                style={{
                  background: "#f59e0b", // Bright Orange
                  border: "none",
                  padding: "6px 16px",
                  borderRadius: "8px"
                }}
              >
                Logout
              </button>

            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;