import React from "react";
import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";
import RoleGuard from "../components/RoleGuard";
import NotFound from "../components/NotFound";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Logout from "../pages/auth/Logout";
import HomeRedirect from "../pages/common/HomeRedirect";

import StudentDashboard from "../pages/student/StudentDashboard";
import MyCluster from "../pages/student/MyCluster";
import MyRecord from "../pages/student/MyRecord";
import Suggestions from "../pages/student/Suggestions";

import FacultyDashboard from "../pages/faculty/FacultyDashboard";
import ManageRecords from "../pages/faculty/ManageRecords";
import RunClustering from "../pages/faculty/RunClustering";
import ClusterResults from "../pages/faculty/ClusterResults";
import StudentList from "../pages/faculty/StudentList";

import AdminDashboard from "../pages/admin/AdminDashboard";
import Users from "../pages/admin/Users";
import CreateUser from "../pages/admin/CreateUser";

function AppRoutes() {
  return React.createElement(
    Routes,
    null,

    // AUTH
    React.createElement(Route, { key: "login", path: "/login", element: React.createElement(Login) }),
    React.createElement(Route, { key: "register", path: "/register", element: React.createElement(Register) }),
    React.createElement(Route, { key: "logout", path: "/logout", element: React.createElement(Logout) }),

    // HOME -> redirect by role
    React.createElement(Route, {
      key: "home",
      path: "/",
      element: React.createElement(ProtectedRoute, null, React.createElement(HomeRedirect))
    }),

    // STUDENT
    React.createElement(Route, {
      key: "student",
      path: "/student",
      element: React.createElement(
        ProtectedRoute,
        null,
        React.createElement(RoleGuard, { allow: ["student"] }, React.createElement(StudentDashboard))
      )
    }),

    React.createElement(Route, {
      key: "studentCluster",
      path: "/student/cluster",
      element: React.createElement(
        ProtectedRoute,
        null,
        React.createElement(RoleGuard, { allow: ["student"] }, React.createElement(MyCluster))
      )
    }),

    React.createElement(Route, {
      key: "studentRecord",
      path: "/student/record",
      element: React.createElement(
        ProtectedRoute,
        null,
        React.createElement(RoleGuard, { allow: ["student"] }, React.createElement(MyRecord))
      )
    }),

    React.createElement(Route, {
      key: "studentSuggestions",
      path: "/student/suggestions",
      element: React.createElement(
        ProtectedRoute,
        null,
        React.createElement(RoleGuard, { allow: ["student"] }, React.createElement(Suggestions))
      )
    }),

    // FACULTY (faculty + admin)
    React.createElement(Route, {
      key: "faculty",
      path: "/faculty",
      element: React.createElement(
        ProtectedRoute,
        null,
        React.createElement(RoleGuard, { allow: ["faculty", "admin"] }, React.createElement(FacultyDashboard))
      )
    }),

    React.createElement(Route, {
      key: "facultyRecords",
      path: "/faculty/records",
      element: React.createElement(
        ProtectedRoute,
        null,
        React.createElement(RoleGuard, { allow: ["faculty", "admin"] }, React.createElement(ManageRecords))
      )
    }),

    // ✅ FIX: add /faculty/clustering (navbar uses this)
    React.createElement(Route, {
      key: "facultyClustering",
      path: "/faculty/clustering",
      element: React.createElement(
        ProtectedRoute,
        null,
        React.createElement(RoleGuard, { allow: ["faculty", "admin"] }, React.createElement(RunClustering))
      )
    }),

    // ✅ keep /faculty/run also (optional, for backward compatibility)
    React.createElement(Route, {
      key: "facultyRun",
      path: "/faculty/run",
      element: React.createElement(
        ProtectedRoute,
        null,
        React.createElement(RoleGuard, { allow: ["faculty", "admin"] }, React.createElement(RunClustering))
      )
    }),

    React.createElement(Route, {
      key: "facultyResults",
      path: "/faculty/results",
      element: React.createElement(
        ProtectedRoute,
        null,
        React.createElement(RoleGuard, { allow: ["faculty", "admin"] }, React.createElement(ClusterResults))
      )
    }),

    React.createElement(Route, {
      key: "facultyStudents",
      path: "/faculty/students",
      element: React.createElement(
        ProtectedRoute,
        null,
        React.createElement(RoleGuard, { allow: ["faculty", "admin"] }, React.createElement(StudentList))
      )
    }),

    // ADMIN
    React.createElement(Route, {
      key: "admin",
      path: "/admin",
      element: React.createElement(
        ProtectedRoute,
        null,
        React.createElement(RoleGuard, { allow: ["admin"] }, React.createElement(AdminDashboard))
      )
    }),

    React.createElement(Route, {
      key: "adminUsers",
      path: "/admin/users",
      element: React.createElement(
        ProtectedRoute,
        null,
        React.createElement(RoleGuard, { allow: ["admin"] }, React.createElement(Users))
      )
    }),

    React.createElement(Route, {
      key: "adminCreateUser",
      path: "/admin/users/create",
      element: React.createElement(
        ProtectedRoute,
        null,
        React.createElement(RoleGuard, { allow: ["admin"] }, React.createElement(CreateUser))
      )
    }),

    // 404
    React.createElement(Route, { key: "404", path: "*", element: React.createElement(NotFound) })
  );
}

export default AppRoutes;
