import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function RoleGuard(props) {
  const allow = props.allow || [];
  const user = useSelector((s) => s.auth.user);

  if (!user) return React.createElement(Navigate, { to: "/login", replace: true });
  if (allow.length && allow.indexOf(user.role) === -1) return React.createElement(Navigate, { to: "/", replace: true });

  return props.children;
}

export default RoleGuard;
