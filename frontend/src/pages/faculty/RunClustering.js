import React, { useState } from "react";
import PageContainer from "../../components/PageContainer";
import AlertMessage from "../../components/AlertMessage";
import { useRunClusteringMutation } from "../../features/clustering/clusteringApi";

function RunClustering() {
  const [department, setDepartment] = useState("CSE");
  const [term, setTerm] = useState("2025-SEM5");
  const [k, setK] = useState("3");

  const [runClustering, runState] = useRunClusteringMutation();
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");

  const onRun = async function () {
    setErr("");
    setResult(null);
    try {
      const payload = {
        department: department,
        term: term,
        k: Number(k),
        featuresUsed: ["attendancePct", "cgpa", "avgInternal", "backlogs"],
        featureWeights: { attendancePct: 1, cgpa: 1.5, avgInternal: 1, backlogs: 2 }
      };
      const res = await runClustering(payload).unwrap();
      setResult(res);
    } catch (ex) {
      setErr(ex && ex.data && ex.data.message ? ex.data.message : "Clustering failed");
    }
  };

  return React.createElement(
    PageContainer,
    null,
    React.createElement("h4", null, "Run Clustering"),
    err ? React.createElement(AlertMessage, { type: "danger", text: err }) : null,
    result ? React.createElement(AlertMessage, { type: "success", text: "Clustering completed. Run ID: " + result.runId }) : null,

    React.createElement(
      "div",
      { className: "row g-2" },
      React.createElement(
        "div",
        { className: "col-md-4" },
        React.createElement("label", { className: "form-label" }, "Department"),
        React.createElement("input", { className: "form-control", value: department, onChange: function (e) { setDepartment(e.target.value); } })
      ),
      React.createElement(
        "div",
        { className: "col-md-4" },
        React.createElement("label", { className: "form-label" }, "Term"),
        React.createElement("input", { className: "form-control", value: term, onChange: function (e) { setTerm(e.target.value); } })
      ),
      React.createElement(
        "div",
        { className: "col-md-4" },
        React.createElement("label", { className: "form-label" }, "K (clusters)"),
        React.createElement("input", { className: "form-control", value: k, onChange: function (e) { setK(e.target.value); }, type: "number", min: 2, max: 10 })
      )
    ),

    React.createElement(
      "button",
      { className: "btn btn-dark mt-3", onClick: onRun, disabled: runState.isLoading },
      runState.isLoading ? "Running..." : "Run Clustering"
    ),

    result && result.stats
      ? React.createElement(
          "div",
          { className: "mt-3" },
          React.createElement("h6", null, "Cluster Sizes"),
          React.createElement("pre", { className: "bg-light p-2 rounded" }, JSON.stringify(result.stats, null, 2))
        )
      : null
  );
}

export default RunClustering;
