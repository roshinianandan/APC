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
  var [data, setData] = useState(null);

  var load = async function () {
    setLoading(true);
    setErr("");
    setData(null);

    try {
      var token = localStorage.getItem("accessToken") || "";
      if (!token) throw new Error("Please login again.");

      var url =
        "/api/records/my-cluster?term=" +
        encodeURIComponent(term) +
        "&department=" +
        encodeURIComponent(department);

      var res = await fetch(url, {
        headers: { Authorization: "Bearer " + token }
      });

      var json = await res.json().catch(function () {
        return {};
      });

      if (!res.ok) throw new Error(json.message || "Failed to load cluster");
      setData(json);
    } catch (e) {
      setErr(e.message || "Failed to load cluster");
    } finally {
      setLoading(false);
    }
  };

  useEffect(function () {
    load();
    // eslint-disable-next-line
  }, []);

  var body = null;

  if (loading) body = React.createElement(Loader);
  else if (err) body = React.createElement(AlertMessage, { type: "danger", text: err });
  else if (data && data.success) {
    var info = getClusterInfo(data.clusterLabel);

    body = React.createElement(
      "div",
      { className: "row g-3" },

      // Cluster Card
      React.createElement(
        "div",
        { className: "col-lg-5" },
        React.createElement(
          "div",
          { className: "card shadow-sm h-100" },
          React.createElement(
            "div",
            { className: "card-body" },
            React.createElement("h5", { className: "fw-bold mb-2" }, "My Cluster Result"),

            React.createElement(
              "p",
              { className: "text-muted mb-2" },
              React.createElement("b", null, "Term: "),
              String(data.term || term),
              " | ",
              React.createElement("b", null, "Department: "),
              String(data.department || department)
            ),

            info
              ? React.createElement(
                  "div",
                  { className: "mb-3" },
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
              : React.createElement(AlertMessage, {
                  type: "info",
                  text: "Cluster not assigned yet. Ask faculty/admin to run clustering for this term."
                }),

            React.createElement(
              "div",
              { className: "border rounded p-3 bg-light" },
              React.createElement("div", { className: "fw-semibold mb-1" }, "What this means"),
              info && info.grade === "A"
                ? React.createElement("div", { className: "small" }, "You are performing strongly. Maintain consistency and aim for top grades & skills.")
                : info && info.grade === "B"
                ? React.createElement("div", { className: "small" }, "You are average. Improve weak units + consistent practice to move to HIGH.")
                : info && info.grade === "C"
                ? React.createElement("div", { className: "small" }, "You need improvement. Follow a structured study plan and seek faculty guidance.")
                : React.createElement("div", { className: "small" }, "Clustering groups students with similar academic patterns.")
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
            React.createElement("h5", { className: "fw-bold mb-2" }, "Record Used for Clustering"),

            data.record
              ? React.createElement(
                  "div",
                  { className: "row g-2" },
                  React.createElement(
                    "div",
                    { className: "col-md-6" },
                    React.createElement("div", { className: "border rounded p-3" },
                      React.createElement("div", { className: "text-muted small" }, "Attendance"),
                      React.createElement("div", { className: "fs-4 fw-bold" }, String(data.record.attendancePct) + "%")
                    )
                  ),
                  React.createElement(
                    "div",
                    { className: "col-md-6" },
                    React.createElement("div", { className: "border rounded p-3" },
                      React.createElement("div", { className: "text-muted small" }, "CGPA"),
                      React.createElement("div", { className: "fs-4 fw-bold" }, String(data.record.cgpa))
                    )
                  ),
                  React.createElement(
                    "div",
                    { className: "col-md-6" },
                    React.createElement("div", { className: "border rounded p-3" },
                      React.createElement("div", { className: "text-muted small" }, "Internal"),
                      React.createElement("div", { className: "fs-4 fw-bold" }, String(data.record.avgInternal))
                    )
                  ),
                  React.createElement(
                    "div",
                    { className: "col-md-6" },
                    React.createElement("div", { className: "border rounded p-3" },
                      React.createElement("div", { className: "text-muted small" }, "Backlogs"),
                      React.createElement("div", { className: "fs-4 fw-bold" }, String(data.record.backlogs))
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
  } else {
    body = React.createElement("p", null, "No cluster found for this term.");
  }

  return React.createElement(
    PageContainer,
    null,
    React.createElement("h4", { className: "fw-bold mb-3" }, "My Cluster"),

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
              loading ? "Loading..." : "Load Cluster"
            )
          )
        )
      )
    ),

    body
  );
}

export default MyCluster;
