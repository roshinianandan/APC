import React, { useEffect, useMemo, useState } from "react";
import PageContainer from "../../components/PageContainer";
import Loader from "../../components/Loader";
import AlertMessage from "../../components/AlertMessage";

function getClusterInfoFromGrade(grade) {
  if (!grade) return null;

  if (grade === "A") return { grade: "A", meaning: "HIGH Performer", badge: "success", note: "Excellent performance group." };
  if (grade === "B") return { grade: "B", meaning: "MEDIUM / AVERAGE Performer", badge: "warning", note: "Good, but can improve to reach HIGH." };
  if (grade === "C") return { grade: "C", meaning: "LOW Performer", badge: "danger", note: "Needs improvement and support plan." };

  return { grade: grade, meaning: "Performance Group", badge: "secondary", note: "Additional group." };
}

function formatNum(v) {
  var n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return String(n);
}

/** -----------------------------------------
 *  Deterministic performance-based grouping
 *  -----------------------------------------
 *  A = HIGH
 *  B = MEDIUM / AVERAGE
 *  C = LOW
 */
function computeGradeFromRecord(rec) {
  if (!rec) return null;

  var att = Number(rec.attendancePct || 0);
  var cgpa = Number(rec.cgpa || 0);
  var internal = Number(rec.avgInternal || 0);
  var backlogs = Number(rec.backlogs || 0);

  // HIGH (A): strong overall + no backlogs
  if (backlogs === 0 && cgpa >= 8 && att >= 75 && internal >= 70) return "A";

  // MEDIUM (B): decent, but not top / slight issues allowed
  if (backlogs <= 1 && cgpa >= 6.5 && att >= 65) return "B";

  // LOW (C): backlogs, low attendance, low cgpa
  return "C";
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
  var [grade, setGrade] = useState(null);

  function getToken() {
    return localStorage.getItem("accessToken") || "";
  }

  function buildSuggestions(rec, gradeValue) {
    var tips = [];

    if (!rec) {
      tips.push("No academic record found for this term. Ask your faculty to add your record.");
      tips.push("Once records are available, the system shows your performance group and suggestions.");
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

    var info = getClusterInfoFromGrade(gradeValue);
    if (!info) {
      tips.push("Performance group not available yet (record missing).");
      return tips;
    }

    tips.push("Your performance group: " + info.grade + " — " + info.meaning + ".");

    if (info.grade === "A") {
      tips.push("Maintain consistency and aim for top grades + skill building (projects/internships).");
      tips.push("Try mentoring peers or preparing for placements with DSA + mock interviews.");
    } else if (info.grade === "B") {
      tips.push("You are close to HIGH. Improve weak subjects + target 8.0 CGPA and 75% attendance.");
      tips.push("Weekly routine: revise 2 units + solve 20 questions + 1 mock test.");
    } else if (info.grade === "C") {
      tips.push("Immediate improvement plan: daily revision + faculty support + clear backlogs.");
      tips.push("Fix basics first: attendance 75%+, CGPA 6.5+, and internals 60+.");
    }

    // Extra pattern-based hints
    if (att < 70 && cgpa >= 7.5) tips.push("You score well but attendance is low—improve attendance to stay eligible.");
    if (att >= 80 && cgpa < 6.5) tips.push("Attendance is good but marks are low—focus on concept clarity + practice.");
    if (cgpa >= 8 && backlogs === 0) tips.push("Strong performance—try advanced electives or research-style projects.");

    return tips;
  }

  var suggestions = useMemo(
    function () {
      return buildSuggestions(record, grade);
    },
    [record, grade]
  );

  var loadDashboard = async function () {
    setLoading(true);
    setErr("");
    setRecord(null);
    setGrade(null);

    try {
      var token = getToken();
      if (!token) throw new Error("Please login again.");

      // My Record
      var recUrl = "/api/records/my?term=" + encodeURIComponent(term);

      var recRes = await fetch(recUrl, {
        headers: { Authorization: "Bearer " + token }
      });

      var recJson = await recRes.json().catch(function () {
        return {};
      });

      if (!recRes.ok) throw new Error(recJson.message || "Failed to load record");

      var rec = recJson.record || null;
      setRecord(rec);

      // ✅ Compute performance grade from record (NOT random)
      setGrade(computeGradeFromRecord(rec));
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

  var clusterInfo = getClusterInfoFromGrade(grade);

  return React.createElement(
    PageContainer,
    null,

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
          ". View your record, performance group and suggestions."
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
          "My Group"
        )
      )
    ),

    err ? React.createElement(AlertMessage, { type: "danger", text: err }) : null,

    // Filters
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

    // Summary + Group + Suggestions
    React.createElement(
      "div",
      { className: "row g-3" },

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

      React.createElement(
        "div",
        { className: "col-lg-4" },
        React.createElement(
          "div",
          { className: "card h-100" },
          React.createElement(
            "div",
            { className: "card-body" },
            React.createElement("h5", { className: "card-title fw-bold mb-2" }, "My Performance Group"),

            clusterInfo
              ? React.createElement(
                  "div",
                  null,
                  React.createElement(
                    "div",
                    { className: "d-flex align-items-center justify-content-between" },
                    React.createElement("div", { className: "text-muted small" }, "Group"),
                    React.createElement("span", { className: "badge bg-" + clusterInfo.badge + " fs-6" }, clusterInfo.grade + " - " + clusterInfo.meaning)
                  ),
                  React.createElement("div", { className: "text-muted small mt-2" }, clusterInfo.note)
                )
              : React.createElement(AlertMessage, { type: "info", text: "Performance group not available yet (record missing)." }),

            React.createElement(
              "div",
              { className: "mt-3" },
              React.createElement(
                "button",
                { className: "btn btn-outline-dark w-100", onClick: function () { window.location.href = "/student/cluster"; } },
                "View Group Details"
              )
            )
          )
        )
      ),

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
                { className: "btn btn-dark w-100", onClick: function () { window.location.href = "/student/suggestions"; } },
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
