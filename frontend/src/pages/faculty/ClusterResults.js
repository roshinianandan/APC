import React, { useEffect, useMemo, useState } from "react";
import PageContainer from "../../components/PageContainer";
import Loader from "../../components/Loader";
import AlertMessage from "../../components/AlertMessage";

function getClusterInfo(label) {
  if (label === null || label === undefined) return null;
  var n = Number(label);
  if (!isFinite(n) || n < 0) return null;

  if (n === 0) return { grade: "A", meaning: "HIGH", badge: "success" };
  if (n === 1) return { grade: "B", meaning: "MEDIUM", badge: "warning" };
  if (n === 2) return { grade: "C", meaning: "LOW", badge: "danger" };

  return { grade: String.fromCharCode(65 + n), meaning: "GROUP", badge: "secondary" };
}

function clusterText(label) {
  var info = getClusterInfo(label);
  if (!info) return "Not assigned";
  return info.grade + " - " + info.meaning;
}

function ClusterBadge(props) {
  var info = getClusterInfo(props.label);
  if (!info) {
    return React.createElement("span", { className: "badge bg-secondary" }, "Not assigned");
  }
  return React.createElement("span", { className: "badge bg-" + info.badge }, info.grade + " - " + info.meaning);
}

function safeNum(v) {
  var n = Number(v);
  if (!isFinite(n)) return 0;
  return n;
}

function ClusterResults() {
  var [department, setDepartment] = useState("CSE");
  var [term, setTerm] = useState("2025-SEM5");

  var [loading, setLoading] = useState(false);
  var [err, setErr] = useState("");
  var [run, setRun] = useState(null);

  var load = async function () {
    setLoading(true);
    setErr("");
    setRun(null);

    try {
      var token = localStorage.getItem("accessToken") || "";

      var url =
        "/api/clustering/latest?department=" +
        encodeURIComponent(department) +
        "&term=" +
        encodeURIComponent(term);

      var res = await fetch(url, {
        headers: { Authorization: "Bearer " + token }
      });

      var json = await res.json().catch(function () {
        return {};
      });

      if (!res.ok) throw new Error(json.message || "Failed to load results");

      setRun(json.run || null);
    } catch (e) {
      setErr(e.message || "Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(function () {
    load();
    // eslint-disable-next-line
  }, []);

  // ---------- Summary counts ----------
  var summary = useMemo(function () {
    var out = { total: 0, A: 0, B: 0, C: 0 };
    if (!run || !run.assignments) return out;

    out.total = run.assignments.length;

    run.assignments.forEach(function (a) {
      var info = getClusterInfo(a.clusterLabel);
      if (!info) return;
      if (info.grade === "A") out.A += 1;
      else if (info.grade === "B") out.B += 1;
      else if (info.grade === "C") out.C += 1;
    });

    return out;
  }, [run]);

  var body = null;

  if (loading) body = React.createElement(Loader);
  else if (err) body = React.createElement(AlertMessage, { type: "danger", text: err });
  else if (!run) body = React.createElement(AlertMessage, { type: "warning", text: "No clustering run found for this department & term." });
  else {
    // Summary cards
    var summaryCards = React.createElement(
      "div",
      { className: "row g-3 mb-3" },
      React.createElement(
        "div",
        { className: "col-md-3" },
        React.createElement(
          "div",
          { className: "card shadow-sm h-100" },
          React.createElement(
            "div",
            { className: "card-body" },
            React.createElement("div", { className: "text-muted small" }, "Total Students"),
            React.createElement("div", { className: "fs-3 fw-bold" }, String(summary.total))
          )
        )
      ),
      React.createElement(
        "div",
        { className: "col-md-3" },
        React.createElement(
          "div",
          { className: "card shadow-sm h-100" },
          React.createElement(
            "div",
            { className: "card-body" },
            React.createElement("div", { className: "text-muted small" }, "A - HIGH"),
            React.createElement("div", { className: "fs-3 fw-bold text-success" }, String(summary.A))
          )
        )
      ),
      React.createElement(
        "div",
        { className: "col-md-3" },
        React.createElement(
          "div",
          { className: "card shadow-sm h-100" },
          React.createElement(
            "div",
            { className: "card-body" },
            React.createElement("div", { className: "text-muted small" }, "B - MEDIUM"),
            React.createElement("div", { className: "fs-3 fw-bold text-warning" }, String(summary.B))
          )
        )
      ),
      React.createElement(
        "div",
        { className: "col-md-3" },
        React.createElement(
          "div",
          { className: "card shadow-sm h-100" },
          React.createElement(
            "div",
            { className: "card-body" },
            React.createElement("div", { className: "text-muted small" }, "C - LOW"),
            React.createElement("div", { className: "fs-3 fw-bold text-danger" }, String(summary.C))
          )
        )
      )
    );

    // Stats table
    var statsTable = null;
    if (run.stats && run.stats.clusters && run.stats.clusters.length) {
      statsTable = React.createElement(
        "div",
        { className: "table-responsive mt-2" },
        React.createElement(
          "table",
          { className: "table table-sm table-striped align-middle" },
          React.createElement(
            "thead",
            null,
            React.createElement(
              "tr",
              null,
              React.createElement("th", null, "Cluster"),
              React.createElement("th", null, "Meaning"),
              React.createElement("th", null, "Count"),
              React.createElement("th", null, "Avg Attendance"),
              React.createElement("th", null, "Avg CGPA"),
              React.createElement("th", null, "Avg Internal"),
              React.createElement("th", null, "Avg Backlogs")
            )
          ),
          React.createElement(
            "tbody",
            null,
            run.stats.clusters.map(function (c, idx) {
              var info = getClusterInfo(idx);
              return React.createElement(
                "tr",
                { key: idx },
                React.createElement(
                  "td",
                  null,
                  React.createElement(ClusterBadge, { label: idx })
                ),
                React.createElement("td", null, info ? info.meaning : "—"),
                React.createElement("td", null, String(c.count || 0)),
                React.createElement("td", null, String(safeNum(c.avgAttendance).toFixed ? c.avgAttendance : safeNum(c.avgAttendance))),
                React.createElement("td", null, String(c.avgCgpa || 0)),
                React.createElement("td", null, String(c.avgInternal || 0)),
                React.createElement("td", null, String(c.avgBacklogs || 0))
              );
            })
          )
        )
      );
    }

    // Assignments table (first 50)
    var assignmentsTable = null;
    if (run.assignments && run.assignments.length) {
      var first = run.assignments.slice(0, 50);

      assignmentsTable = React.createElement(
        "div",
        { className: "table-responsive mt-2" },
        React.createElement(
          "table",
          { className: "table table-sm table-striped align-middle" },
          React.createElement(
            "thead",
            null,
            React.createElement(
              "tr",
              null,
              React.createElement("th", null, "Student"),
              React.createElement("th", null, "Email"),
              React.createElement("th", null, "Cluster")
            )
          ),
          React.createElement(
            "tbody",
            null,
            first.map(function (a, idx) {
              var s = a.studentId && typeof a.studentId === "object" ? a.studentId : null;
              return React.createElement(
                "tr",
                { key: a._id || idx },
                React.createElement("td", null, s ? (s.name || "Student") : "Student"),
                React.createElement("td", null, s ? (s.email || "") : ""),
                React.createElement("td", null, React.createElement(ClusterBadge, { label: a.clusterLabel }))
              );
            })
          )
        )
      );
    }

    body = React.createElement(
      "div",
      null,

      React.createElement(
        "div",
        { className: "mb-2 text-muted small" },
        "Legend: ",
        React.createElement("span", { className: "badge bg-success me-1" }, "A - HIGH"),
        React.createElement("span", { className: "badge bg-warning text-dark me-1" }, "B - MEDIUM"),
        React.createElement("span", { className: "badge bg-danger me-1" }, "C - LOW")
      ),

      summaryCards,

      React.createElement(
        "div",
        { className: "card shadow-sm mb-3" },
        React.createElement(
          "div",
          { className: "card-body" },
          React.createElement("div", { className: "d-flex flex-wrap gap-3 small text-muted" },
            React.createElement("div", null, React.createElement("b", null, "Run ID: "), String(run._id)),
            React.createElement("div", null, React.createElement("b", null, "Department: "), String(run.department)),
            React.createElement("div", null, React.createElement("b", null, "Term: "), String(run.term)),
            React.createElement("div", null, React.createElement("b", null, "K: "), String(run.k))
          )
        )
      ),

      React.createElement("h6", { className: "fw-bold" }, "Cluster Stats"),
      statsTable ? statsTable : React.createElement(AlertMessage, { type: "warning", text: "No stats available." }),

      React.createElement("hr", null),

      React.createElement("h6", { className: "fw-bold" }, "Assignments (first 50)"),
      assignmentsTable ? assignmentsTable : React.createElement(AlertMessage, { type: "warning", text: "No assignments available." })
    );
  }

  return React.createElement(
    PageContainer,
    null,
    React.createElement("h4", { className: "fw-bold mb-3" }, "Cluster Results"),

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
            { className: "col-md-4 d-flex align-items-end" },
            React.createElement(
              "button",
              { className: "btn btn-dark w-100", onClick: load, disabled: loading },
              loading ? "Loading..." : "Refresh Results"
            )
          )
        )
      )
    ),

    body
  );
}

export default ClusterResults;
