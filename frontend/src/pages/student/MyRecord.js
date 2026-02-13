import React, { useEffect, useMemo, useState } from "react";
import PageContainer from "../../components/PageContainer";
import Loader from "../../components/Loader";
import AlertMessage from "../../components/AlertMessage";

function kpiColor(type, value) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return "text-muted";
  const v = Number(value);

  if (type === "attendance") return v >= 75 ? "text-success" : v >= 65 ? "text-warning" : "text-danger";
  if (type === "cgpa") return v >= 8 ? "text-success" : v >= 6.5 ? "text-warning" : "text-danger";
  if (type === "internal") return v >= 60 ? "text-success" : "text-danger";
  if (type === "backlogs") return v === 0 ? "text-success" : "text-danger";
  return "text-muted";
}

function toClusterLetter(label) {
  if (label === null || label === undefined) return "—";
  const n = Number(label);
  if (!Number.isFinite(n) || n < 0) return "—";
  return String.fromCharCode(65 + n);
}

function MyRecord() {
  const storedUser = useMemo(function () {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch (e) {
      return null;
    }
  }, []);

  const [term, setTerm] = useState("2025-SEM5");
  const [department, setDepartment] = useState((storedUser && storedUser.department) || "CSE");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [record, setRecord] = useState(null);

  const load = async function () {
    setLoading(true);
    setErr("");
    setRecord(null);

    try {
      const token = localStorage.getItem("accessToken") || "";

      const url = "/api/records/my?term=" + encodeURIComponent(term);

      const res = await fetch(url, {
        headers: { Authorization: "Bearer " + token }
      });

      const json = await res.json().catch(function () {
        return {};
      });

      if (!res.ok) throw new Error(json.message || "Failed to load record");

      setRecord(json.record || null);
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

  const attendance = record ? Number(record.attendancePct || 0) : null;
  const cgpa = record ? Number(record.cgpa || 0) : null;
  const internal = record ? Number(record.avgInternal || 0) : null;
  const backlogs = record ? Number(record.backlogs || 0) : null;

  const clusterLetter = record ? toClusterLetter(record.clusterLabel) : "—";

  const header = React.createElement(
    "div",
    { className: "d-flex align-items-start align-items-md-center justify-content-between flex-column flex-md-row gap-2 mb-3" },
    React.createElement(
      "div",
      null,
      React.createElement("h3", { className: "mb-0 fw-bold" }, "My Record"),
      React.createElement(
        "div",
        { className: "text-muted" },
        "View your academic record and performance indicators."
      )
    ),
    React.createElement(
      "div",
      { className: "d-flex gap-2 flex-wrap" },
      React.createElement(
        "button",
        { className: "btn btn-dark", onClick: load, disabled: loading },
        loading ? "Loading..." : "Refresh"
      ),
      React.createElement(
        "button",
        { className: "btn btn-outline-dark", onClick: function () { window.location.href = "/student/cluster"; } },
        "My Cluster"
      ),
      React.createElement(
        "button",
        { className: "btn btn-outline-dark", onClick: function () { window.location.href = "/student/suggestions"; } },
        "Suggestions"
      )
    )
  );

  const filters = React.createElement(
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
        ),
        React.createElement(
          "div",
          { className: "col-12 mt-2" },
          React.createElement(
            "button",
            { className: "btn btn-outline-dark w-100", onClick: load, disabled: loading },
            loading ? "Loading..." : "Load Record"
          )
        )
      )
    )
  );

  const kpis = React.createElement(
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
          React.createElement("div", { className: "fs-3 fw-bold " + kpiColor("attendance", attendance) }, record ? String(attendance) + "%" : "—"),
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
          React.createElement("div", { className: "fs-3 fw-bold " + kpiColor("cgpa", cgpa) }, record ? String(cgpa) : "—"),
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
          React.createElement("div", { className: "fs-3 fw-bold " + kpiColor("internal", internal) }, record ? String(internal) : "—"),
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
          React.createElement("div", { className: "fs-3 fw-bold " + kpiColor("backlogs", backlogs) }, record ? String(backlogs) : "—"),
          React.createElement("div", { className: "text-muted small" }, "Goal: 0")
        )
      )
    )
  );

  const recordDetails = record
    ? React.createElement(
        "div",
        { className: "card" },
        React.createElement(
          "div",
          { className: "card-body" },
          React.createElement(
            "div",
            { className: "d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2" },
            React.createElement("h5", { className: "fw-bold mb-0" }, "Record Details"),
            React.createElement(
              "span",
              {
                className:
                  "badge " +
                  (record.clusterLabel === null || record.clusterLabel === undefined
                    ? "bg-secondary-subtle text-secondary border border-secondary-subtle"
                    : "bg-success-subtle text-success border border-success-subtle")
              },
              "Cluster: " + clusterLetter
            )
          ),

          React.createElement("div", { className: "text-muted small mb-3" }, "Term: ", term, " | Department: ", department),

          React.createElement(
            "div",
            { className: "table-responsive" },
            React.createElement(
              "table",
              { className: "table table-sm table-striped mb-0" },
              React.createElement(
                "tbody",
                null,
                React.createElement(
                  "tr",
                  null,
                  React.createElement("th", { style: { width: "45%" } }, "Attendance %"),
                  React.createElement("td", null, String(record.attendancePct))
                ),
                React.createElement(
                  "tr",
                  null,
                  React.createElement("th", null, "CGPA"),
                  React.createElement("td", null, String(record.cgpa))
                ),
                React.createElement(
                  "tr",
                  null,
                  React.createElement("th", null, "Avg Internal"),
                  React.createElement("td", null, String(record.avgInternal))
                ),
                React.createElement(
                  "tr",
                  null,
                  React.createElement("th", null, "Backlogs"),
                  React.createElement("td", null, String(record.backlogs))
                ),
                React.createElement(
                  "tr",
                  null,
                  React.createElement("th", null, "Last Updated"),
                  React.createElement("td", null, record.updatedAt ? String(record.updatedAt) : "—")
                )
              )
            )
          )
        )
      )
    : React.createElement(AlertMessage, {
        type: "warning",
        text: "No record found for this term. Ask your faculty to add your academic record."
      });

  return React.createElement(
    PageContainer,
    null,
    header,
    err ? React.createElement(AlertMessage, { type: "danger", text: err }) : null,
    filters,
    loading ? React.createElement(Loader) : null,
    kpis,
    recordDetails
  );
}

export default MyRecord;
