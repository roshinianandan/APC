import React, { useEffect, useMemo, useState } from "react";
import PageContainer from "../../components/PageContainer";
import Loader from "../../components/Loader";
import AlertMessage from "../../components/AlertMessage";

function getClusterInfo(label) {
  if (label === null || label === undefined) return null;

  var n = Number(label);
  if (!Number.isFinite(n) || n < 0) return null;

  if (n === 0) return { grade: "A", meaning: "HIGH Performer", badge: "success" };
  if (n === 1) return { grade: "B", meaning: "MEDIUM / AVERAGE Performer", badge: "warning" };
  if (n === 2) return { grade: "C", meaning: "LOW Performer", badge: "danger" };

  return { grade: String.fromCharCode(65 + n), meaning: "Performance Group", badge: "secondary" };
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
  var [clusterLabel, setClusterLabel] = useState(null);

  function getToken() {
    return localStorage.getItem("accessToken") || "";
  }

  function buildSuggestions(rec, label) {
    var tips = [];

    if (!rec) {
      tips.push("No academic record found for this term.");
      tips.push("Ask your faculty to add your attendance/CGPA/internal/backlog data.");
      tips.push("After records exist, clustering can be run and you’ll get personalized insights.");
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

    // Cluster based suggestions
    var info = getClusterInfo(label);
    if (!info) {
      tips.push("Cluster is not assigned yet. Ask faculty/admin to run clustering for this term.");
      tips.push("Cluster meaning: A=HIGH, B=MEDIUM/AVERAGE, C=LOW.");
      return tips;
    }

    tips.push("Your cluster group: " + info.grade + " — " + info.meaning + " (A=HIGH, B=MEDIUM, C=LOW).");

    if (info.grade === "A") {
      tips.push("You are in HIGH group. Maintain performance and aim for top grades.");
      tips.push("Add skill-building: mini projects, internships, peer mentoring.");
    } else if (info.grade === "B") {
      tips.push("You are in MEDIUM group. Identify weak subjects and improve to move to HIGH group.");
      tips.push("Weekly plan: revise 2 units + solve 20 questions + take 1 mock test.");
    } else if (info.grade === "C") {
      tips.push("You are in LOW group. Immediate improvement plan required.");
      tips.push("Daily schedule: 2 hours study + clear backlogs + improve attendance + ask faculty help.");
    }

    // extra pattern-based tips
    if (att < 70 && cgpa >= 7.5) tips.push("You score well but attendance is low—improve attendance to stay eligible.");
    if (att >= 80 && cgpa < 6.5) tips.push("Attendance is good but marks are low—focus on concept clarity + practice.");
    if (cgpa >= 8 && backlogs === 0) tips.push("Strong performance—try mentoring peers or taking advanced electives.");

    return tips;
  }

  var suggestions = useMemo(function () {
    return buildSuggestions(record, clusterLabel);
  }, [record, clusterLabel]);

  var load = async function () {
    setLoading(true);
    setErr("");
    setRecord(null);
    setClusterLabel(null);

    try {
      var token = getToken();
      if (!token) throw new Error("Please login again.");

      // 1) Load my record
      var recUrl = "/api/records/my?term=" + encodeURIComponent(term);
      var recRes = await fetch(recUrl, { headers: { Authorization: "Bearer " + token } });

      var recJson = await recRes.json().catch(function () {
        return {};
      });

      if (!recRes.ok) throw new Error(recJson.message || "Failed to load record");
      setRecord(recJson.record || null);

      // 2) Load my cluster (best reliable source)
      var clUrl =
        "/api/records/my-cluster?term=" +
        encodeURIComponent(term) +
        "&department=" +
        encodeURIComponent(department);

      var clRes = await fetch(clUrl, { headers: { Authorization: "Bearer " + token } });

      var clJson = await clRes.json().catch(function () {
        return {};
      });

      if (clRes.ok && clJson && clJson.success) {
        setClusterLabel(clJson.clusterLabel);
      } else {
        // fallback: if record has clusterLabel
        if (recJson.record && (recJson.record.clusterLabel === 0 || recJson.record.clusterLabel === 1 || recJson.record.clusterLabel === 2)) {
          setClusterLabel(recJson.record.clusterLabel);
        }
      }
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

  var info = getClusterInfo(clusterLabel);

  return React.createElement(
    PageContainer,
    null,
    React.createElement("h4", { className: "fw-bold mb-2" }, "Suggestions"),
    React.createElement("p", { className: "text-muted" }, "Personalized improvement tips based on your academic record + cluster group."),

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
            React.createElement("h6", { className: "fw-bold" }, "Cluster Group"),
            info
              ? React.createElement(
                  "div",
                  null,
                  React.createElement("span", { className: "badge bg-" + info.badge + " fs-6" }, info.grade + " - " + info.meaning),
                  React.createElement("div", { className: "text-muted small mt-2" }, "A = HIGH, B = MEDIUM / AVERAGE, C = LOW")
                )
              : React.createElement(AlertMessage, { type: "info", text: "Cluster not assigned yet." })
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
