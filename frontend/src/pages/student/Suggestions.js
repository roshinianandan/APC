import React, { useEffect, useMemo, useState } from "react";
import PageContainer from "../../components/PageContainer";
import Loader from "../../components/Loader";
import AlertMessage from "../../components/AlertMessage";

function getClusterInfoFromGrade(grade) {
  if (!grade) return null;

  if (grade === "A") return { grade: "A", meaning: "HIGH Performer", badge: "success" };
  if (grade === "B") return { grade: "B", meaning: "MEDIUM / AVERAGE Performer", badge: "warning" };
  if (grade === "C") return { grade: "C", meaning: "LOW Performer", badge: "danger" };

  return { grade: grade, meaning: "Performance Group", badge: "secondary" };
}

/** Deterministic grade from record (NOT random) */
function computeGradeFromRecord(rec) {
  if (!rec) return null;

  var att = Number(rec.attendancePct || 0);
  var cgpa = Number(rec.cgpa || 0);
  var internal = Number(rec.avgInternal || 0);
  var backlogs = Number(rec.backlogs || 0);

  // A = HIGH (strong across the board)
  if (backlogs === 0 && cgpa >= 8 && att >= 75 && internal >= 70) return "A";

  // B = MEDIUM / AVERAGE
  if (backlogs <= 1 && cgpa >= 6.5 && att >= 65) return "B";

  // C = LOW (backlogs or low scores/attendance)
  return "C";
}

function Suggestions() {
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

  function buildSuggestions(rec, gradeLetter) {
    var tips = [];

    if (!rec) {
      tips.push("No academic record found for this term.");
      tips.push("Ask your faculty to add your attendance/CGPA/internal/backlog data.");
      tips.push("Once your record is added, your performance group (A/B/C) will be generated.");
      return tips;
    }

    var att = Number(rec.attendancePct || 0);
    var cgpa = Number(rec.cgpa || 0);
    var internal = Number(rec.avgInternal || 0);
    var backlogs = Number(rec.backlogs || 0);

    // Attendance tips
    if (att < 65) tips.push("⚠ Attendance is very low. Attend all classes and labs to reach 75%+.");
    else if (att < 75) tips.push("Attendance is below 75%. Increase attendance to avoid shortage risk.");
    else tips.push("✅ Attendance is good. Keep it consistent.");

    // CGPA tips
    if (cgpa < 6.5) tips.push("⚠ CGPA is low. Focus on basics, revise weekly, and solve previous year questions.");
    else if (cgpa < 8) tips.push("CGPA is average. Improve with test practice + solving problems regularly.");
    else tips.push("✅ CGPA is strong. Maintain with consistent revision.");

    // Internal marks
    if (internal < 60) tips.push("Internal marks are low. Submit assignments early and prepare before internal tests.");
    else tips.push("✅ Internal marks are fine. Keep tracking weak units before tests.");

    // Backlogs
    if (backlogs > 0) tips.push("⚠ Backlogs present. Make a daily plan (1–2 hours) until cleared.");
    else tips.push("✅ No backlogs. Great! Continue consistent study.");

    // Grade-based suggestions (A/B/C)
    var info = getClusterInfoFromGrade(gradeLetter);
    if (!info) {
      tips.push("Performance group not available yet.");
      tips.push("A = HIGH, B = MEDIUM / AVERAGE, C = LOW.");
      return tips;
    }

    tips.push("Your performance group: " + info.grade + " — " + info.meaning + " (A=HIGH, B=MEDIUM, C=LOW).");

    if (info.grade === "A") {
      tips.push("Maintain performance and aim for top grades.");
      tips.push("Add skill-building: mini projects, internships, peer mentoring.");
    } else if (info.grade === "B") {
      tips.push("Identify weak subjects and improve to move to HIGH group.");
      tips.push("Weekly plan: revise 2 units + solve 20 questions + take 1 mock test.");
    } else if (info.grade === "C") {
      tips.push("Immediate improvement plan required.");
      tips.push("Daily schedule: 2 hours study + clear backlogs + improve attendance + ask faculty help.");
    }

    // Extra pattern-based tips
    if (att < 70 && cgpa >= 7.5) tips.push("You score well but attendance is low—improve attendance to stay eligible.");
    if (att >= 80 && cgpa < 6.5) tips.push("Attendance is good but marks are low—focus on concept clarity + practice.");
    if (cgpa >= 8 && backlogs === 0) tips.push("Strong performance—try mentoring peers or taking advanced electives.");

    return tips;
  }

  var suggestions = useMemo(function () {
    return buildSuggestions(record, grade);
  }, [record, grade]);

  var load = async function () {
    setLoading(true);
    setErr("");
    setRecord(null);
    setGrade(null);

    try {
      var token = getToken();
      if (!token) throw new Error("Please login again.");

      // ✅ Only load my record
      var recUrl = "/api/records/my?term=" + encodeURIComponent(term);
      var recRes = await fetch(recUrl, { headers: { Authorization: "Bearer " + token } });

      var recJson = await recRes.json().catch(function () {
        return {};
      });

      if (!recRes.ok) throw new Error(recJson.message || "Failed to load record");

      var rec = recJson.record || null;
      setRecord(rec);

      // ✅ compute grade A/B/C
      setGrade(computeGradeFromRecord(rec));
    } catch (e) {
      setErr(e.message || "Failed to load suggestions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(function () {
    load();
    // eslint-disable-next-line
  }, []);

  var info = getClusterInfoFromGrade(grade);

  return React.createElement(
    PageContainer,
    null,
    React.createElement("h4", { className: "fw-bold mb-2" }, "Suggestions"),
    React.createElement(
      "p",
      { className: "text-muted" },
      "Personalized improvement tips based on your academic record + performance group (A/B/C)."
    ),

    err ? React.createElement(AlertMessage, { type: "danger", text: err }) : null,

    React.createElement(
      "div",
      { className: "card shadow-sm mb-3" },
      React.createElement(
        "div",
        { className: "card-body" },
        React.createElement(
          "div",
          { className: "row g-2" },
          React.createElement(
            "div",
            { className: "col-md-4" },
            React.createElement("label", { className: "form-label" }, "Term"),
            React.createElement("input", {
              className: "form-control",
              value: term,
              onChange: function (e) {
                setTerm(e.target.value);
              }
            })
          ),
          React.createElement(
            "div",
            { className: "col-md-4" },
            React.createElement("label", { className: "form-label" }, "Department"),
            React.createElement("input", {
              className: "form-control",
              value: department,
              onChange: function (e) {
                setDepartment(e.target.value);
              }
            })
          ),
          React.createElement(
            "div",
            { className: "col-md-4 d-flex align-items-end" },
            React.createElement(
              "button",
              { className: "btn btn-dark w-100", onClick: load, disabled: loading },
              loading ? "Loading..." : "Refresh Suggestions"
            )
          )
        )
      )
    ),

    loading ? React.createElement(Loader) : null,

    React.createElement(
      "div",
      { className: "row g-3 mb-3" },

      React.createElement(
        "div",
        { className: "col-lg-4" },
        React.createElement(
          "div",
          { className: "card shadow-sm h-100" },
          React.createElement(
            "div",
            { className: "card-body" },
            React.createElement("h6", { className: "fw-bold" }, "Performance Group"),
            record
              ? info
                ? React.createElement(
                    "div",
                    null,
                    React.createElement(
                      "span",
                      { className: "badge bg-" + info.badge + " fs-6" },
                      info.grade + " - " + info.meaning
                    ),
                    React.createElement(
                      "div",
                      { className: "text-muted small mt-2" },
                      "A = HIGH, B = MEDIUM / AVERAGE, C = LOW"
                    )
                  )
                : React.createElement(AlertMessage, { type: "info", text: "Performance group not available yet." })
              : React.createElement(AlertMessage, { type: "warning", text: "No record found for this term." })
          )
        )
      ),

      React.createElement(
        "div",
        { className: "col-lg-8" },
        React.createElement(
          "div",
          { className: "card shadow-sm h-100" },
          React.createElement(
            "div",
            { className: "card-body" },
            React.createElement("h6", { className: "fw-bold" }, "Your Suggestions"),
            React.createElement(
              "ul",
              { className: "mb-0" },
              suggestions.map(function (t, idx) {
                return React.createElement("li", { key: idx, className: "mb-1" }, t);
              })
            )
          )
        )
      )
    )
  );
}

export default Suggestions;