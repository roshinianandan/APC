import React from "react";
import { Navigate } from "react-router-dom";

function HomeRedirect() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) return React.createElement(Navigate, { to: "/login", replace: true });
  if (user.role === "student") return React.createElement(Navigate, { to: "/student", replace: true });
  if (user.role === "admin") return React.createElement(Navigate, { to: "/admin", replace: true });
  return React.createElement(Navigate, { to: "/faculty", replace: true });
}

export default HomeRedirect;
