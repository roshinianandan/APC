import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedRoute(props) {
  const user = useSelector((s) => s.auth.user);
  if (!user) return React.createElement(Navigate, { to: "/login", replace: true });
  return props.children;
}

export default ProtectedRoute;
