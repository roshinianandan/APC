import React, { useEffect, useMemo, useState } from "react";
import PageContainer from "../../components/PageContainer";
import Loader from "../../components/Loader";
import AlertMessage from "../../components/AlertMessage";

function toClusterLetter(label) {
  if (label === null || label === undefined) return "—";
  var n = Number(label);
  if (!isFinite(n) || n < 0) return "—";
  return String.fromCharCode(65 + n); // 0->A, 1->B...
}

function percent(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function FacultyDashboard() {
  var storedUser = useMemo(function () {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch (e) {
      return null;
    }
  }, []);

  var [department, setDepartment] = useState((storedUser && storedUser.department) || "CSE");
  var [term, setTerm] = useState("2025-SEM5");

  var [loading, setLoading] = useState(false);
  var [err, setErr] = useState("");

  var [records, setRecords] = useState([]);
  var [latestRun, setLatestRun] = useState(null);

  function getToken() {
    return localStorage.getItem("accessToken") || "";
  }

  function loadDashboard() {
    return (async function () {
      setLoading(true);
      setErr("");
      setRecords([]);
      setLatestRun(null);

      try {
        var token = getToken();
        if (!token) throw new Error("Not logged in");

        // 1) Records list
        var recUrl =
          "/api/records?department=" +
          encodeURIComponent(department) +
          "&term=" +
          encodeURIComponent(term);

        var recRes = await fetch(recUrl, {
          headers: { Authorization: "Bearer " + token }
        });

        var recJson = await recRes.json().catch(function () {
          return {};
        });

        if (!recRes.ok) throw new Error(recJson.message || "Failed to load records");

        var list = Array.isArray(recJson.records) ? recJson.records : [];
        setRecords(list);

        // 2) Latest clustering run
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

        if (runRes.ok && runJson && runJson.success) setLatestRun(runJson.run || null);
        else setLatestRun(null);
      } catch (e) {
        setErr(e.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }

  useEffect(function () {
    loadDashboard();
    // eslint-disable-next-line
  }, []);

  // ---------- Build “chart data” from records ----------
  var total = records.length;

  var lowAttendance = 0;
  var lowCgpa = 0;
  var backlogStudents = 0;

  for (var i = 0; i < records.length; i++) {
    var r = records[i] || {};
    var att = Number(r.attendancePct || 0);
    var cg = Number(r.cgpa || 0);
    var bl = Number(r.backlogs || 0);

    if (att < 75) lowAttendance++;
    if (cg < 6.5) lowCgpa++;
    if (bl > 0) backlogStudents++;
  }

  // Cluster distribution + averages
  var clusterMap = {}; // key: label -> {count, attSum, cgSum, intSum, blSum}
  for (var j = 0; j < records.length; j++) {
    var rr = records[j] || {};
    var label = rr.clusterLabel;

    // treat 0 as valid label
    var hasLabel = label === 0 || !!label;
    if (!hasLabel) continue;

    var key = String(label);
    if (!clusterMap[key]) {
      clusterMap[key] = { label: Number(label), count: 0, attSum: 0, cgSum: 0, intSum: 0, blSum: 0 };
    }

    clusterMap[key].count += 1;
    clusterMap[key].attSum += Number(rr.attendancePct || 0);
    clusterMap[key].cgSum += Number(rr.cgpa || 0);
    clusterMap[key].intSum += Number(rr.avgInternal || 0);
    clusterMap[key].blSum += Number(rr.backlogs || 0);
  }

  var clusters = Object.keys(clusterMap)
    .map(function (k) {
      var c = clusterMap[k];
      var count = c.count || 1;
      return {
        label: c.label,
        letter: toClusterLetter(c.label),
        count: c.count,
        pct: percent(c.count, total),
        avgAttendance: Number((c.attSum / count).toFixed(2)),
        avgCgpa: Number((c.cgSum / count).toFixed(2)),
        avgInternal: Number((c.intSum / count).toFixed(2)),
        avgBacklogs: Number((c.blSum / count).toFixed(2))
      };
    })
    .sort(function (a, b) {
      return a.label - b.label;
    });

  // ---------- UI helpers ----------
  function KpiCard(title, value, subtitle, badgeClass) {
    return React.createElement(
      "div",
      { className: "col-lg-3 col-md-6" },
      React.createElement(
        "div",
        { className: "card shadow-sm h-100" },
        React.createElement(
          "div",
          { className: "card-body" },
          React.createElement(
            "div",
            { className: "d-flex justify-content-between align-items-start" },
            React.createElement("h6", { className: "mb-0" }, title),
            React.createElement("span", { className: "badge " + badgeClass }, String(value))
          ),
          React.createElement("div", { className: "text-muted small mt-2" }, subtitle)
        )
      )
    );
  }

  function ProgressRow(label, p, cls) {
    return React.createElement(
      "div",
      { className: "mb-3" },
      React.createElement(
        "div",
        { className: "d-flex justify-content-between mb-1" },
        React.createElement("span", { className: "small text-muted" }, label),
        React.createElement("span", { className: "small fw-semibold" }, String(p) + "%")
      ),
      React.createElement(
        "div",
        { className: "progress", style: { height: "10px" } },
        React.createElement("div", { className: "progress-bar " + cls, style: { width: String(p) + "%" } })
      )
    );
  }

  var header = React.createElement(
    "div",
    { className: "d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3" },
    React.createElement(
      "div",
      null,
      React.createElement("h3", { className: "fw-bold mb-1" }, "Faculty Dashboard"),
      React.createElement("div", { className: "text-muted" }, "Analytics overview (Records + Cluster insights).")
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
        { className: "btn btn-outline-dark", onClick: function () { window.location.href = "/faculty/records"; } },
        "Manage Records"
      ),
      React.createElement(
        "button",
        { className: "btn btn-outline-dark", onClick: function () { window.location.href = "/faculty/run"; } },
        "Run Clustering"
      ),
      React.createElement(
        "button",
        { className: "btn btn-outline-dark", onClick: function () { window.location.href = "/faculty/results"; } },
        "Results"
      )
    )
  );

  var filters = React.createElement(
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
            onChange: function (e) { setDepartment(e.target.value); }
          })
        ),
        React.createElement(
          "div",
          { className: "col-md-4" },
          React.createElement("label", { className: "form-label" }, "Term"),
          React.createElement("input", {
            className: "form-control",
            value: term,
            onChange: function (e) { setTerm(e.target.value); }
          })
        ),
        React.createElement(
          "div",
          { className: "col-md-4 d-flex align-items-end" },
          React.createElement(
            "button",
            { className: "btn btn-dark w-100", onClick: loadDashboard, disabled: loading },
            loading ? "Loading..." : "Load"
          )
        )
      )
    )
  );

  var kpis = React.createElement(
    "div",
    { className: "row g-3 mb-3" },
    KpiCard("Total Records", total, "Department + term records", "text-bg-dark"),
    KpiCard("Attendance < 75%", lowAttendance, "Students needing attendance improvement", "text-bg-warning"),
    KpiCard("CGPA < 6.5", lowCgpa, "Students at academic risk", "text-bg-danger"),
    KpiCard("Backlogs > 0", backlogStudents, "Students with pending backlogs", "text-bg-secondary")
  );

  // “Charts” section (Bootstrap progress bars)
  var chartsCard = React.createElement(
    "div",
    { className: "card shadow-sm mb-3" },
    React.createElement(
      "div",
      { className: "card-body" },
      React.createElement("h5", { className: "fw-bold mb-3" }, "Quick Charts"),
      total === 0
        ? React.createElement(AlertMessage, { type: "info", text: "No records found. Add records to see analytics." })
        : React.createElement(
            "div",
            { className: "row g-3" },

            React.createElement(
              "div",
              { className: "col-lg-6" },
              React.createElement("h6", { className: "fw-semibold" }, "Risk Distribution"),
              ProgressRow("Attendance below 75%", percent(lowAttendance, total), "bg-warning"),
              ProgressRow("CGPA below 6.5", percent(lowCgpa, total), "bg-danger"),
              ProgressRow("Backlogs present", percent(backlogStudents, total), "bg-secondary"),
              React.createElement("div", { className: "text-muted small" }, "These are calculated from the uploaded academic records.")
            ),

            React.createElement(
              "div",
              { className: "col-lg-6" },
              React.createElement("h6", { className: "fw-semibold" }, "Cluster Distribution (A/B/C...)"),
              clusters.length === 0
                ? React.createElement(AlertMessage, { type: "warning", text: "Clusters not assigned yet. Run clustering first." })
                : React.createElement(
                    "div",
                    null,
                    clusters.map(function (c) {
                      return React.createElement(
                        "div",
                        { key: "cl-" + c.label, className: "mb-3" },
                        React.createElement(
                          "div",
                          { className: "d-flex justify-content-between mb-1" },
                          React.createElement("span", { className: "small text-muted" }, "Cluster " + c.letter + " (" + c.count + " students)"),
                          React.createElement("span", { className: "small fw-semibold" }, String(c.pct) + "%")
                        ),
                        React.createElement(
                          "div",
                          { className: "progress", style: { height: "10px" } },
                          React.createElement("div", { className: "progress-bar bg-success", style: { width: String(c.pct) + "%" } })
                        )
                      );
                    })
                  )
            )
          )
    )
  );

  // Cluster averages table (Attendance/CGPA/Internal/Backlogs)
  var clusterAveragesCard = React.createElement(
    "div",
    { className: "card shadow-sm" },
    React.createElement(
      "div",
      { className: "card-body" },
      React.createElement(
        "div",
        { className: "d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2" },
        React.createElement("h5", { className: "fw-bold mb-0" }, "Cluster Averages"),
        latestRun
          ? React.createElement("span", { className: "badge text-bg-success" }, "Latest run found")
          : React.createElement("span", { className: "badge text-bg-secondary" }, "No run")
      ),
      clusters.length === 0
        ? React.createElement(AlertMessage, { type: "info", text: "After you run clustering, averages per cluster will appear here." })
        : React.createElement(
            "div",
            { className: "table-responsive" },
            React.createElement(
              "table",
              { className: "table table-sm table-striped mb-0" },
              React.createElement(
                "thead",
                null,
                React.createElement(
                  "tr",
                  null,
                  React.createElement("th", null, "Cluster"),
                  React.createElement("th", null, "Students"),
                  React.createElement("th", null, "Avg Attendance"),
                  React.createElement("th", null, "Avg CGPA"),
                  React.createElement("th", null, "Avg Internal"),
                  React.createElement("th", null, "Avg Backlogs")
                )
              ),
              React.createElement(
                "tbody",
                null,
                clusters.map(function (c) {
                  return React.createElement(
                    "tr",
                    { key: "row-" + c.label },
                    React.createElement("td", null, React.createElement("span", { className: "badge bg-success-subtle text-success border border-success-subtle" }, c.letter)),
                    React.createElement("td", null, String(c.count)),
                    React.createElement("td", null, String(c.avgAttendance) + "%"),
                    React.createElement("td", null, String(c.avgCgpa)),
                    React.createElement("td", null, String(c.avgInternal)),
                    React.createElement("td", null, String(c.avgBacklogs))
                  );
                })
              )
            )
          )
    )
  );

  return React.createElement(
    PageContainer,
    null,
    header,
    err ? React.createElement(AlertMessage, { type: "danger", text: err }) : null,
    filters,
    loading ? React.createElement(Loader) : null,
    !loading ? React.createElement(React.Fragment, null, kpis, chartsCard, clusterAveragesCard) : null
  );
}

export default FacultyDashboard;
