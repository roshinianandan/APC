import React, { useEffect, useMemo, useState } from "react";
import PageContainer from "../../components/PageContainer";
import Loader from "../../components/Loader";
import AlertMessage from "../../components/AlertMessage";

function AdminDashboard() {
  const storedUser = useMemo(function () {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch (e) {
      return null;
    }
  }, []);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [users, setUsers] = useState([]);
  const [recordsCount, setRecordsCount] = useState(0);
  const [latestRun, setLatestRun] = useState(null);

  const getToken = function () {
    return localStorage.getItem("accessToken") || "";
  };

  const roleCounts = useMemo(
    function () {
      const c = { admin: 0, faculty: 0, student: 0, other: 0 };
      for (let i = 0; i < (users || []).length; i++) {
        const r = String(users[i].role || "").toLowerCase();
        if (r === "admin") c.admin += 1;
        else if (r === "faculty") c.faculty += 1;
        else if (r === "student") c.student += 1;
        else c.other += 1;
      }
      return c;
    },
    [users]
  );

  const loadDashboard = async function () {
    setLoading(true);
    setErr("");
    setUsers([]);
    setRecordsCount(0);
    setLatestRun(null);

    try {
      const token = getToken();
      if (!token) throw new Error("Not logged in");

      // 1) Users list (admin)
      // ✅ This assumes your backend has GET /api/users
      const usersRes = await fetch("/api/users", {
        headers: { Authorization: "Bearer " + token }
      });

      const usersJson = await usersRes.json().catch(function () {
        return {};
      });

      if (!usersRes.ok) throw new Error(usersJson.message || "Failed to load users");
      setUsers(Array.isArray(usersJson.users) ? usersJson.users : []);

      // 2) Records count
      // ✅ We use a safe endpoint: list records for a default term/department is not good
      // So: try GET /api/records/stats if exists else fallback count via /api/records?department=CSE&term=2025-SEM5
      let count = 0;

      const statsRes = await fetch("/api/records/stats", {
        headers: { Authorization: "Bearer " + token }
      });

      if (statsRes.ok) {
        const statsJson = await statsRes.json().catch(function () {
          return {};
        });
        if (statsJson && statsJson.success && typeof statsJson.totalRecords === "number") {
          count = statsJson.totalRecords;
        }
      } else {
        // fallback
        const fallbackRes = await fetch("/api/records?department=CSE&term=2025-SEM5", {
          headers: { Authorization: "Bearer " + token }
        });
        const fallbackJson = await fallbackRes.json().catch(function () {
          return {};
        });
        if (fallbackRes.ok && fallbackJson && fallbackJson.records) {
          count = fallbackJson.records.length;
        }
      }

      setRecordsCount(count);

      // 3) Latest clustering run (fallback search)
      // ✅ If you have any known department/term, try CSE + 2025-SEM5
      const runRes = await fetch("/api/clustering/latest?department=CSE&term=2025-SEM5", {
        headers: { Authorization: "Bearer " + token }
      });

      const runJson = await runRes.json().catch(function () {
        return {};
      });

      if (runRes.ok && runJson && runJson.success && runJson.run) {
        setLatestRun(runJson.run);
      } else {
        setLatestRun(null);
      }
    } catch (e) {
      setErr(e.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(function () {
    loadDashboard();
    // eslint-disable-next-line
  }, []);

  const quickActions = React.createElement(
    "div",
    { className: "d-flex flex-wrap gap-2" },
    React.createElement(
      "button",
      { className: "btn btn-dark", onClick: function () { window.location.href = "/admin/users/create"; } },
      "Create User"
    ),
    React.createElement(
      "button",
      { className: "btn btn-outline-dark", onClick: function () { window.location.href = "/admin/users"; } },
      "Users List"
    ),
    React.createElement(
      "button",
      { className: "btn btn-outline-dark", onClick: function () { window.location.href = "/faculty/records"; } },
      "Manage Records"
    ),
    React.createElement(
      "button",
      { className: "btn btn-outline-dark", onClick: function () { window.location.href = "/faculty/clustering"; } },
      "Run Clustering"
    ),
    React.createElement(
      "button",
      { className: "btn btn-outline-dark", onClick: function () { window.location.href = "/faculty/results"; } },
      "View Results"
    ),
    React.createElement(
      "button",
      { className: "btn btn-outline-secondary", onClick: loadDashboard, disabled: loading },
      loading ? "Refreshing..." : "Refresh"
    )
  );

  const userSummaryCard = React.createElement(
    "div",
    { className: "card shadow-sm h-100" },
    React.createElement(
      "div",
      { className: "card-body" },
      React.createElement("div", { className: "d-flex justify-content-between align-items-start" },
        React.createElement("h6", { className: "card-title mb-0" }, "Users"),
        React.createElement("span", { className: "badge text-bg-dark" }, String(users.length))
      ),
      React.createElement("hr", { className: "my-3" }),
      React.createElement("div", { className: "d-flex flex-wrap gap-2" },
        React.createElement("span", { className: "badge text-bg-danger" }, "Admin: " + roleCounts.admin),
        React.createElement("span", { className: "badge text-bg-primary" }, "Faculty: " + roleCounts.faculty),
        React.createElement("span", { className: "badge text-bg-success" }, "Student: " + roleCounts.student),
        roleCounts.other ? React.createElement("span", { className: "badge text-bg-secondary" }, "Other: " + roleCounts.other) : null
      ),
      React.createElement("p", { className: "text-muted mt-3 mb-0" }, "Manage accounts, roles, and access securely.")
    )
  );

  const recordsCard = React.createElement(
    "div",
    { className: "card shadow-sm h-100" },
    React.createElement(
      "div",
      { className: "card-body" },
      React.createElement("div", { className: "d-flex justify-content-between align-items-start" },
        React.createElement("h6", { className: "card-title mb-0" }, "Academic Records"),
        React.createElement("span", { className: "badge text-bg-dark" }, String(recordsCount))
      ),
      React.createElement("hr", { className: "my-3" }),
      React.createElement("p", { className: "mb-1" }, React.createElement("b", null, "Tip: "), "Ensure every student has a record before clustering."),
      React.createElement("p", { className: "text-muted mb-0" }, "Records include attendance, CGPA, internals, backlogs.")
    )
  );

  const runCard = React.createElement(
    "div",
    { className: "card shadow-sm h-100" },
    React.createElement(
      "div",
      { className: "card-body" },
      React.createElement("h6", { className: "card-title" }, "Latest Clustering Run (CSE / 2025-SEM5)"),
      latestRun
        ? React.createElement(
            "div",
            null,
            React.createElement("p", { className: "mb-1" }, React.createElement("b", null, "Run ID: "), String(latestRun._id || "")),
            React.createElement("p", { className: "mb-1" }, React.createElement("b", null, "K: "), String(latestRun.k)),
            React.createElement("p", { className: "mb-1" }, React.createElement("b", null, "Total Records: "), String(latestRun.totalRecords || 0)),
            React.createElement("p", { className: "mb-0 text-muted" }, "View Results to see assignments & cluster stats.")
          )
        : React.createElement(
            AlertMessage,
            { type: "warning", text: "No clustering run found yet for CSE / 2025-SEM5. Run clustering from the Clustering page." }
          )
    )
  );

  const header = React.createElement(
    "div",
    { className: "d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3" },
    React.createElement(
      "div",
      null,
      React.createElement("h4", { className: "mb-1" }, "Admin Dashboard"),
      React.createElement(
        "div",
        { className: "text-muted" },
        "Welcome ",
        (storedUser && storedUser.name) ? storedUser.name : "Admin",
        ". Manage users, records, and clustering runs."
      )
    ),
    React.createElement("div", null, quickActions)
  );

  return React.createElement(
    PageContainer,
    null,
    header,

    err ? React.createElement(AlertMessage, { type: "danger", text: err }) : null,
    loading ? React.createElement(Loader) : null,

    React.createElement(
      "div",
      { className: "row g-3" },
      React.createElement("div", { className: "col-lg-4" }, userSummaryCard),
      React.createElement("div", { className: "col-lg-4" }, recordsCard),
      React.createElement("div", { className: "col-lg-4" }, runCard)
    ),

    React.createElement("div", { className: "mt-4 text-muted small" }, "Academic Performance Clustering System • MERN Stack")
  );
}

export default AdminDashboard;