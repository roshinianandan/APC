import React, { useEffect, useMemo, useState } from "react";
import PageContainer from "../../components/PageContainer";
import Loader from "../../components/Loader";
import AlertMessage from "../../components/AlertMessage";

function getClusterInfo(label) {
  // Numeric label => Grade + Meaning
  // 0 -> A (HIGH), 1 -> B (MEDIUM), 2 -> C (LOW)
  if (label === null || label === undefined) return null;

  var n = Number(label);
  if (!Number.isFinite(n) || n < 0) return null;

  if (n === 0) return { grade: "A", meaning: "HIGH Performer", badge: "success", note: "Excellent performance group." };
  if (n === 1) return { grade: "B", meaning: "MEDIUM / AVERAGE Performer", badge: "warning", note: "Good, but can improve to reach HIGH." };
  if (n === 2) return { grade: "C", meaning: "LOW Performer", badge: "danger", note: "Needs improvement and support plan." };

  // If k > 3 later, use letters after C
  return { grade: String.fromCharCode(65 + n), meaning: "Performance Group", badge: "secondary", note: "Additional group based on clustering." };
}

function formatNum(v) {
  var n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return String(n);
}

function StudentDashboard() {
  var storedUser = useMemo(function () {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch (e) {
      return null;
    }
  }, []);

  var [term, setTerm] = useState("2025-SEM5");
  var [department, setDepartment] = useState((storedUser && storedUser.department) || "CSE");

  var [loading, setLoading] = useState(false);
  var [err, setErr] = useState("");

  var [record, setRecord] = useState(null);
  var [clusterLabel, setClusterLabel] = useState(null);

  function getToken() {
    return localStorage.getItem("accessToken") || "";
  }

  function buildSuggestions(rec, label) {
    var tips = [];

    if (!rec) {
      tips.push("No academic record found for this term. Ask your faculty to add your record.");
      tips.push("Once records are available, clustering can be run to generate performance group insights.");
      return tips;
    }

    var att = Number(rec.attendancePct || 0);
    var cgpa = Number(rec.cgpa || 0);
    var internal = Number(rec.avgInternal || 0);
    var backlogs = Number(rec.backlogs || 0);

    // Attendance
    if (att < 65) tips.push("Attendance is low. Target 75%+ to avoid shortage issues and maintain eligibility.");
    else if (att < 75) tips.push("Try pushing attendance above 75% for safety and smooth semester progress.");
    else tips.push("Good attendance! Maintain consistency.");

    // CGPA
    if (cgpa < 6.5) tips.push("CGPA needs improvement. Focus on fundamentals + weekly revision plan.");
    else if (cgpa < 8) tips.push("CGPA is decent. Improve with mock tests + problem practice.");
    else tips.push("Excellent CGPA. Keep it stable with consistent revision.");

    // Internal
    if (internal < 60) tips.push("Internal marks are low. Submit assignments early and prepare well for internals.");
    else tips.push("Internal marks are good. Keep tracking weak units before tests.");

    // Backlogs
    if (backlogs > 0) tips.push("Backlogs found. Create a clear plan (daily 1–2 hrs) until cleared.");
    else tips.push("No backlogs. Great! Keep momentum.");

    // Cluster meaning (A/B/C)
    var info = getClusterInfo(label);
    if (!info) {
      tips.push("Cluster not assigned yet. Ask faculty/admin to run clustering for this term.");
      return tips;
    }

    tips.push("Your cluster group: " + info.grade + " — " + info.meaning + ".");

    // Cluster-based suggestions
    if (info.grade === "A") {
      tips.push("You are in the HIGH group. Maintain consistency and aim for top grades + skill building.");
      tips.push("Try advanced learning: projects, internships, peer mentoring, competitive coding (if relevant).");
    } else if (info.grade === "B") {
      tips.push("You are in the MEDIUM group. Focus on weak subjects to move into HIGH group.");
      tips.push("Use a weekly routine: revise 2 units + solve 20 questions + 1 mock test.");
    } else if (info.grade === "C") {
      tips.push("You are in the LOW group. Immediate improvement plan: daily revision + faculty guidance.");
      tips.push("Make a strict schedule: 2 hrs/day study + clear backlogs + improve attendance.");
    }

    // Extra pattern-based hints
    if (att < 70 && cgpa >= 7.5) tips.push("You score well but attendance is low—improve attendance to stay eligible.");
    if (att >= 80 && cgpa < 6.5) tips.push("Attendance is good but marks are low—focus on concept clarity + practice.");
    if (cgpa >= 8 && backlogs === 0) tips.push("Strong performance—try mentoring peers or taking advanced electives.");

    return tips;
  }

  var suggestions = useMemo(
    function () {
      return buildSuggestions(record, clusterLabel);
    },
    [record, clusterLabel]
  );

  var loadDashboard = async function () {
    setLoading(true);
    setErr("");
    setRecord(null);
    setClusterLabel(null);

    try {
      var token = getToken();
      if (!token) throw new Error("Please login again.");

      // 1) My Record
      var recUrl = "/api/records/my?term=" + encodeURIComponent(term);

      var recRes = await fetch(recUrl, {
        headers: { Authorization: "Bearer " + token }
      });

      var recJson = await recRes.json().catch(function () {
        return {};
      });

      if (!recRes.ok) throw new Error(recJson.message || "Failed to load record");
      setRecord(recJson.record || null);

      // 2) Cluster label (prefer record.clusterLabel; else fallback latest run)
      if (recJson.record && (recJson.record.clusterLabel === 0 || recJson.record.clusterLabel === 1 || recJson.record.clusterLabel === 2)) {
        setClusterLabel(recJson.record.clusterLabel);
        return;
      }

      // fallback: latest run assignment
      var runUrl =
        "/api/clustering/latest?department=" +
        encodeURIComponent(department) +
        "&term=" +
        encodeURIComponent(term);

      var runRes = await fetch(runUrl, {
        headers: { Authorization: "Bearer " + token }
      });

      var runJson = await runRes.json().catch(function () {
        return {};
      });

      if (runRes.ok && runJson.run && runJson.run.assignments) {
        var myId = storedUser && (storedUser.id || storedUser._id);
        var found = runJson.run.assignments.find(function (a) {
          if (!a) return false;
          if (a.studentId && typeof a.studentId === "object") return String(a.studentId._id) === String(myId);
          return String(a.studentId) === String(myId);
        });

        if (found && (found.clusterLabel === 0 || found.clusterLabel === 1 || found.clusterLabel === 2)) {
          setClusterLabel(found.clusterLabel);
        }
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

  // KPI values
  var attendance = record ? Number(record.attendancePct || 0) : null;
  var cgpa = record ? Number(record.cgpa || 0) : null;
  var internal = record ? Number(record.avgInternal || 0) : null;
  var backlogs = record ? Number(record.backlogs || 0) : null;

  function kpiColor(type, value) {
    if (value === null || value === undefined || !Number.isFinite(Number(value))) return "text-muted";
    var v = Number(value);

    if (type === "attendance") return v >= 75 ? "text-success" : v >= 65 ? "text-warning" : "text-danger";
    if (type === "cgpa") return v >= 8 ? "text-success" : v >= 6.5 ? "text-warning" : "text-danger";
    if (type === "internal") return v >= 60 ? "text-success" : "text-danger";
    if (type === "backlogs") return v === 0 ? "text-success" : "text-danger";
    return "text-muted";
  }

  var clusterInfo = getClusterInfo(clusterLabel);

  return React.createElement(
    PageContainer,
    null,

    // Header
    React.createElement(
      "div",
      { className: "d-flex align-items-start align-items-md-center justify-content-between flex-column flex-md-row gap-2 mb-3" },
      React.createElement(
        "div",
        null,
        React.createElement("h3", { className: "mb-0 fw-bold" }, "Student Dashboard"),
        React.createElement(
          "div",
          { className: "text-muted" },
          "Welcome ",
          storedUser && storedUser.name ? storedUser.name : "Student",
          ". View your record, cluster and suggestions."
        )
      ),
      React.createElement(
        "div",
        { className: "d-flex gap-2 flex-wrap" },
        React.createElement(
          "button",
          { className: "btn btn-dark", onClick: loadDashboard, disabled: loading },
          loading ? "Refreshing..." : "Refresh"
        ),
        React.createElement(
          "button",
          { className: "btn btn-outline-dark", onClick: function () { window.location.href = "/student/record"; } },
          "My Record"
        ),
        React.createElement(
          "button",
          { className: "btn btn-outline-dark", onClick: function () { window.location.href = "/student/cluster"; } },
          "My Cluster"
        )
      )
    ),

    err ? React.createElement(AlertMessage, { type: "danger", text: err }) : null,

    // Filters row
    React.createElement(
      "div",
      { className: "card mb-3" },
      React.createElement(
        "div",
        { className: "card-body" },
        React.createElement(
          "div",
          { className: "row g-2" },
          React.createElement(
            "div",
            { className: "col-md-6" },
            React.createElement("label", { className: "form-label" }, "Term"),
            React.createElement("input", {
              className: "form-control",
              value: term,
              onChange: function (e) { setTerm(e.target.value); }
            })
          ),
          React.createElement(
            "div",
            { className: "col-md-6" },
            React.createElement("label", { className: "form-label" }, "Department"),
            React.createElement("input", {
              className: "form-control",
              value: department,
              onChange: function (e) { setDepartment(e.target.value); }
            })
          )
        )
      )
    ),

    loading ? React.createElement(Loader) : null,

    // KPI Cards
    React.createElement(
      "div",
      { className: "row g-3 mb-3" },

      React.createElement(
        "div",
        { className: "col-md-3" },
        React.createElement(
          "div",
          { className: "card h-100" },
          React.createElement(
            "div",
            { className: "card-body" },
            React.createElement("div", { className: "text-muted small" }, "Attendance"),
            React.createElement("div", { className: "fs-3 fw-bold " + kpiColor("attendance", attendance) }, record ? formatNum(attendance) + "%" : "—"),
            React.createElement("div", { className: "text-muted small" }, "Target: 75%+")
          )
        )
      ),

      React.createElement(
        "div",
        { className: "col-md-3" },
        React.createElement(
          "div",
          { className: "card h-100" },
          React.createElement(
            "div",
            { className: "card-body" },
            React.createElement("div", { className: "text-muted small" }, "CGPA"),
            React.createElement("div", { className: "fs-3 fw-bold " + kpiColor("cgpa", cgpa) }, record ? formatNum(cgpa) : "—"),
            React.createElement("div", { className: "text-muted small" }, "Goal: 8.0+")
          )
        )
      ),

      React.createElement(
        "div",
        { className: "col-md-3" },
        React.createElement(
          "div",
          { className: "card h-100" },
          React.createElement(
            "div",
            { className: "card-body" },
            React.createElement("div", { className: "text-muted small" }, "Internal"),
            React.createElement("div", { className: "fs-3 fw-bold " + kpiColor("internal", internal) }, record ? formatNum(internal) : "—"),
            React.createElement("div", { className: "text-muted small" }, "Aim: 60+")
          )
        )
      ),

      React.createElement(
        "div",
        { className: "col-md-3" },
        React.createElement(
          "div",
          { className: "card h-100" },
          React.createElement(
            "div",
            { className: "card-body" },
            React.createElement("div", { className: "text-muted small" }, "Backlogs"),
            React.createElement("div", { className: "fs-3 fw-bold " + kpiColor("backlogs", backlogs) }, record ? formatNum(backlogs) : "—"),
            React.createElement("div", { className: "text-muted small" }, "Goal: 0")
          )
        )
      )
    ),

    // Record + Cluster + Suggestions
    React.createElement(
      "div",
      { className: "row g-3" },

      // Summary
      React.createElement(
        "div",
        { className: "col-lg-4" },
        React.createElement(
          "div",
          { className: "card h-100" },
          React.createElement(
            "div",
            { className: "card-body" },
            React.createElement("h5", { className: "card-title fw-bold mb-2" }, "Summary"),
            React.createElement("div", { className: "text-muted small mb-2" }, "Term: ", term, " | Dept: ", department),

            record
              ? React.createElement(
                  "div",
                  null,
                  React.createElement("div", { className: "d-flex justify-content-between py-1" }, React.createElement("span", null, "Attendance"), React.createElement("b", null, String(record.attendancePct) + "%")),
                  React.createElement("div", { className: "d-flex justify-content-between py-1" }, React.createElement("span", null, "CGPA"), React.createElement("b", null, String(record.cgpa))),
                  React.createElement("div", { className: "d-flex justify-content-between py-1" }, React.createElement("span", null, "Internal"), React.createElement("b", null, String(record.avgInternal))),
                  React.createElement("div", { className: "d-flex justify-content-between py-1" }, React.createElement("span", null, "Backlogs"), React.createElement("b", null, String(record.backlogs)))
                )
              : React.createElement(AlertMessage, { type: "warning", text: "No record found for this term." })
          )
        )
      ),

      // Cluster Card
      React.createElement(
        "div",
        { className: "col-lg-4" },
        React.createElement(
          "div",
          { className: "card h-100" },
          React.createElement(
            "div",
            { className: "card-body" },
            React.createElement("h5", { className: "card-title fw-bold mb-2" }, "My Cluster"),

            clusterInfo
              ? React.createElement(
                  "div",
                  null,
                  React.createElement(
                    "div",
                    { className: "d-flex align-items-center justify-content-between" },
                    React.createElement("div", { className: "text-muted small" }, "Cluster Group"),
                    React.createElement(
                      "span",
                      { className: "badge bg-" + clusterInfo.badge + " fs-6" },
                      clusterInfo.grade + " - " + clusterInfo.meaning
                    )
                  ),
                  React.createElement("div", { className: "text-muted small mt-2" }, clusterInfo.note)
                )
              : React.createElement(AlertMessage, { type: "info", text: "Cluster not assigned yet. Ask faculty/admin to run clustering." }),

            React.createElement(
              "div",
              { className: "mt-3" },
              React.createElement(
                "button",
                {
                  className: "btn btn-outline-dark w-100",
                  onClick: function () {
                    window.location.href = "/student/cluster";
                  }
                },
                "View Cluster Details"
              )
            )
          )
        )
      ),

      // Suggestions
      React.createElement(
        "div",
        { className: "col-lg-4" },
        React.createElement(
          "div",
          { className: "card h-100" },
          React.createElement(
            "div",
            { className: "card-body" },
            React.createElement("h5", { className: "card-title fw-bold mb-2" }, "Suggestions"),
            React.createElement(
              "ul",
              { className: "mb-0" },
              suggestions.slice(0, 7).map(function (t, idx) {
                return React.createElement("li", { key: idx, className: "mb-1" }, t);
              })
            ),
            React.createElement(
              "div",
              { className: "mt-3" },
              React.createElement(
                "button",
                {
                  className: "btn btn-dark w-100",
                  onClick: function () {
                    window.location.href = "/student/suggestions";
                  }
                },
                "Open Suggestions Page"
              )
            )
          )
        )
      )
    )
  );
}

export default StudentDashboard;
