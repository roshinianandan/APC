import React, { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const role = user && user.role ? String(user.role).toLowerCase() : "";

  function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    navigate("/login");
  }

  function roleBadgeClass(r) {
    if (r === "admin") return "badge bg-danger-subtle text-danger border border-danger-subtle";
    if (r === "faculty") return "badge bg-warning-subtle text-warning border border-warning-subtle";
    if (r === "student") return "badge bg-info-subtle text-info border border-info-subtle";
    return "badge bg-secondary-subtle text-secondary border border-secondary-subtle";
  }

  function isActive(to) {
    // exact matching for main pages
    if (to === "/") return location.pathname === "/";
    return location.pathname === to || location.pathname.startsWith(to + "/");
  }

  const homeLink = !user
    ? "/"
    : role === "student"
    ? "/student"
    : role === "faculty"
    ? "/faculty"
    : "/admin";

  let links = [];

  if (!user) {
    links = [
      { to: "/login", label: "Login" },
      { to: "/register", label: "Register" }
    ];
  } else if (role === "student") {
    links = [
      { to: "/student", label: "Dashboard" },
      { to: "/student/record", label: "My Record" },
      { to: "/student/cluster", label: "My Cluster" },
      { to: "/student/suggestions", label: "Suggestions" }
    ];
  } else if (role === "faculty") {
    links = [
      { to: "/faculty", label: "Dashboard" },
      { to: "/faculty/records", label: "Manage Records" },
      { to: "/faculty/run", label: "Run Clustering" },
      { to: "/faculty/results", label: "Cluster Results" }
    ];
  } else {
    // admin
    links = [
      { to: "/admin", label: "Dashboard" },
      { to: "/admin/users", label: "Users" },
      { to: "/faculty/records", label: "Records" },
      { to: "/faculty/run", label: "Clustering" },
      { to: "/faculty/results", label: "Results" }
    ];
  }

  return React.createElement(
    "nav",
    { className: "navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm" },
    React.createElement(
      "div",
      { className: "container" },

      // Brand
      React.createElement(
        Link,
        { className: "navbar-brand fw-bold d-flex align-items-center gap-2", to: homeLink },
        React.createElement("span", { className: "brand-dot" }),
        "Academic Clustering"
      ),

      // Mobile toggler
      React.createElement(
        "button",
        {
          className: "navbar-toggler",
          type: "button",
          "data-bs-toggle": "collapse",
          "data-bs-target": "#mainNavbar",
          "aria-controls": "mainNavbar",
          "aria-expanded": "false",
          "aria-label": "Toggle navigation"
        },
        React.createElement("span", { className: "navbar-toggler-icon" })
      ),

      React.createElement(
        "div",
        { className: "collapse navbar-collapse", id: "mainNavbar" },

        // Left links
        React.createElement(
          "ul",
          { className: "navbar-nav me-auto mb-2 mb-lg-0" },
          links.map(function (l) {
            return React.createElement(
              "li",
              { className: "nav-item", key: l.to },
              React.createElement(
                Link,
                {
                  className: "nav-link " + (isActive(l.to) ? "active fw-semibold nav-active" : ""),
                  to: l.to
                },
                l.label
              )
            );
          })
        ),

        // Right user section
        user
          ? React.createElement(
              "div",
              { className: "d-flex align-items-center gap-2" },

              React.createElement(
                "span",
                { className: roleBadgeClass(role) },
                role.toUpperCase()
              ),

              React.createElement(
                "span",
                { className: "text-white-50 small d-none d-lg-inline" },
                user.name ? String(user.name) : "User"
              ),

              React.createElement(
                "button",
                { className: "btn btn-sm btn-outline-light", onClick: logout },
                "Logout"
              )
            )
          : React.createElement(
              "div",
              { className: "d-flex gap-2" },
              React.createElement(Link, { className: "btn btn-sm btn-outline-light", to: "/login" }, "Login"),
              React.createElement(Link, { className: "btn btn-sm btn-light", to: "/register" }, "Register")
            )
      )
    )
  );
}

export default Navbar;
