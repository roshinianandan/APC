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

  // A = HIGH
  if (backlogs === 0 && cgpa >= 8 && att >= 75 && internal >= 70) return "A";

  // B = MEDIUM / AVERAGE
  if (backlogs <= 1 && cgpa >= 6.5 && att >= 65) return "B";

  // C = LOW
  return "C";
}

function MyCluster() {
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

  // we keep record only (no cluster endpoint)
  var [record, setRecord] = useState(null);
  var [grade, setGrade] = useState(null);

  var load = async function () {
    setLoading(true);
    setErr("");
    setRecord(null);
    setGrade(null);

    try {
      var token = localStorage.getItem("accessToken") || "";
      if (!token) throw new Error("Please login again.");

      // ✅ Only read my record
      var url = "/api/records/my?term=" + encodeURIComponent(term);

      var res = await fetch(url, {
        headers: { Authorization: "Bearer " + token }
      });

      var json = await res.json().catch(function () {
        return {};
      });

      if (!res.ok) throw new Error(json.message || "Failed to load record");

      var rec = json.record || null;
      setRecord(rec);

      // ✅ compute A/B/C from record values
      setGrade(computeGradeFromRecord(rec));
    } catch (e) {
      setErr(e.message || "Failed to load record");
    } finally {
      setLoading(false);
    }
  };

  useEffect(function () {
    load();
    // eslint-disable-next-line
  }, []);

  var info = getClusterInfoFromGrade(grade);

  var body = null;

  if (loading) body = React.createElement(Loader);
  else if (err) body = React.createElement(AlertMessage, { type: "danger", text: err });
  else {
    body = React.createElement(
      "div",
      { className: "row g-3" },

      // Performance Group Card
      React.createElement(
        "div",
        { className: "col-lg-5" },
        React.createElement(
          "div",
          { className: "card shadow-sm h-100" },
          React.createElement(
            "div",
            { className: "card-body" },
            React.createElement("h5", { className: "fw-bold mb-2" }, "My Performance Group"),

            React.createElement(
              "p",
              { className: "text-muted mb-2" },
              React.createElement("b", null, "Term: "),
              String(term),
              " | ",
              React.createElement("b", null, "Department: "),
              String(department)
            ),

            record
              ? React.createElement(
                  "div",
                  { className: "mb-3" },
                  React.createElement(
                    "span",
                    { className: "badge bg-" + (info ? info.badge : "secondary") + " fs-6" },
                    info ? info.grade + " - " + info.meaning : "Not assigned"
                  ),
                  React.createElement(
                    "div",
                    { className: "text-muted small mt-2" },
                    "A = HIGH, B = MEDIUM / AVERAGE, C = LOW"
                  )
                )
              : React.createElement(AlertMessage, {
                  type: "info",
                  text: "No academic record found for this term. Ask faculty to add your record."
                }),

            React.createElement(
              "div",
              { className: "border rounded p-3 bg-light" },
              React.createElement("div", { className: "fw-semibold mb-1" }, "What this means"),
              !record
                ? React.createElement("div", { className: "small" }, "Your performance group will appear once your record is added.")
                : info && info.grade === "A"
                ? React.createElement("div", { className: "small" }, "You are performing strongly. Maintain consistency and aim for top grades & skills.")
                : info && info.grade === "B"
                ? React.createElement("div", { className: "small" }, "You are average. Improve weak units + consistent practice to move to HIGH.")
                : info && info.grade === "C"
                ? React.createElement("div", { className: "small" }, "You need improvement. Follow a structured study plan and seek faculty guidance.")
                : React.createElement("div", { className: "small" }, "Performance group is based on your record values.")
            )
          )
        )
      ),

      // Record Card
      React.createElement(
        "div",
        { className: "col-lg-7" },
        React.createElement(
          "div",
          { className: "card shadow-sm h-100" },
          React.createElement(
            "div",
            { className: "card-body" },
            React.createElement("h5", { className: "fw-bold mb-2" }, "Record Summary"),

            record
              ? React.createElement(
                  "div",
                  { className: "row g-2" },
                  React.createElement(
                    "div",
                    { className: "col-md-6" },
                    React.createElement(
                      "div",
                      { className: "border rounded p-3" },
                      React.createElement("div", { className: "text-muted small" }, "Attendance"),
                      React.createElement("div", { className: "fs-4 fw-bold" }, String(record.attendancePct) + "%")
                    )
                  ),
                  React.createElement(
                    "div",
                    { className: "col-md-6" },
                    React.createElement(
                      "div",
                      { className: "border rounded p-3" },
                      React.createElement("div", { className: "text-muted small" }, "CGPA"),
                      React.createElement("div", { className: "fs-4 fw-bold" }, String(record.cgpa))
                    )
                  ),
                  React.createElement(
                    "div",
                    { className: "col-md-6" },
                    React.createElement(
                      "div",
                      { className: "border rounded p-3" },
                      React.createElement("div", { className: "text-muted small" }, "Internal"),
                      React.createElement("div", { className: "fs-4 fw-bold" }, String(record.avgInternal))
                    )
                  ),
                  React.createElement(
                    "div",
                    { className: "col-md-6" },
                    React.createElement(
                      "div",
                      { className: "border rounded p-3" },
                      React.createElement("div", { className: "text-muted small" }, "Backlogs"),
                      React.createElement("div", { className: "fs-4 fw-bold" }, String(record.backlogs))
                    )
                  )
                )
              : React.createElement(AlertMessage, { type: "warning", text: "No record data found for this term." }),

            React.createElement(
              "div",
              { className: "mt-3 d-flex gap-2 flex-wrap" },
              React.createElement(
                "button",
                { className: "btn btn-dark", onClick: load, disabled: loading },
                loading ? "Loading..." : "Refresh"
              ),
              React.createElement(
                "button",
                {
                  className: "btn btn-outline-dark",
                  onClick: function () {
                    window.location.href = "/student/suggestions";
                  }
                },
                "View Suggestions"
              )
            )
          )
        )
      )
    );
  }

  return React.createElement(
    PageContainer,
    null,
    React.createElement("h4", { className: "fw-bold mb-3" }, "My Performance Group"),

    React.createElement(
      "div",
      { className: "card mb-3 shadow-sm" },
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
              loading ? "Loading..." : "Load"
            )
          )
        )
      )
    ),

    body
  );
}

export default MyCluster;
