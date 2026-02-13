import React, { useState } from "react";
import PageContainer from "../../components/PageContainer";
import Loader from "../../components/Loader";
import AlertMessage from "../../components/AlertMessage";
import { useUpsertRecordMutation, useListRecordsQuery } from "../../features/records/recordsApi";

function ManageRecords() {
  const [department, setDepartment] = useState("CSE");
  const [term, setTerm] = useState("2025-SEM5");

  const [studentId, setStudentId] = useState("");
  const [attendancePct, setAttendancePct] = useState("75");
  const [cgpa, setCgpa] = useState("7.5");
  const [avgInternal, setAvgInternal] = useState("65");
  const [backlogs, setBacklogs] = useState("0");

  const listState = useListRecordsQuery({ department: department, term: term });
  const [upsertRecord, upsertState] = useUpsertRecordMutation();

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const clearForm = function () {
    setStudentId("");
    setAttendancePct("75");
    setCgpa("7.5");
    setAvgInternal("65");
    setBacklogs("0");
  };

  // ✅ Prefill form for update
  const onEdit = function (r) {
    const sid =
      r.studentId && typeof r.studentId === "object" ? r.studentId._id : r.studentId;

    setStudentId(String(sid || ""));
    setDepartment(String(r.department || department));
    setTerm(String(r.term || term));

    setAttendancePct(String(r.attendancePct ?? ""));
    setCgpa(String(r.cgpa ?? ""));
    setAvgInternal(String(r.avgInternal ?? ""));
    setBacklogs(String(r.backlogs ?? ""));

    setMsg("Loaded record into form. Edit and click Save Record.");
    setErr("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSave = async function () {
    setMsg("");
    setErr("");

    if (!studentId) {
      setErr("Student ID is required");
      return;
    }

    try {
      const payload = {
        studentId: studentId,
        department: department,
        term: term,
        attendancePct: Number(attendancePct),
        cgpa: Number(cgpa),
        avgInternal: Number(avgInternal),
        backlogs: Number(backlogs)
      };

      await upsertRecord(payload).unwrap();
      setMsg("Record saved successfully");
      listState.refetch();
      // optional: clear after save
      // clearForm();
    } catch (ex) {
      setErr(ex && ex.data && ex.data.message ? ex.data.message : "Save failed");
    }
  };

  // ✅ DELETE RECORD
  const deleteOne = async function (recordId) {
    setMsg("");
    setErr("");

    try {
      const token = localStorage.getItem("accessToken");

      const res = await fetch("/api/records/" + recordId, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token }
      });

      const data = await res.json().catch(function () {
        return {};
      });

      if (!res.ok) throw new Error(data && data.message ? data.message : "Delete failed");

      setMsg("Record deleted successfully");
      listState.refetch();

      // if the deleted record was in the form, clear it
      // (safe check)
      if (studentId && String(studentId) === String(recordId)) {
        clearForm();
      }
    } catch (e) {
      setErr(e && e.message ? e.message : "Delete failed");
    }
  };

  let table = null;

  if (listState.isLoading) table = React.createElement(Loader);
  else if (listState.error)
    table = React.createElement(AlertMessage, { type: "danger", text: "Failed to load records" });
  else if (listState.data && listState.data.records) {
    table = React.createElement(
      "div",
      { className: "table-responsive mt-3" },
      React.createElement(
        "table",
        { className: "table table-striped table-sm align-middle" },
        React.createElement(
          "thead",
          null,
          React.createElement(
            "tr",
            null,
            React.createElement("th", null, "Student"),
            React.createElement("th", null, "Attendance"),
            React.createElement("th", null, "CGPA"),
            React.createElement("th", null, "Internal"),
            React.createElement("th", null, "Backlogs"),
            React.createElement("th", { style: { width: 170 } }, "Actions")
          )
        ),
        React.createElement(
          "tbody",
          null,
          listState.data.records.map(function (r) {
            const s = r.studentId || {};
            return React.createElement(
              "tr",
              { key: r._id },
              React.createElement("td", null, (s.name || "Student") + " (" + (s.email || "") + ")"),
              React.createElement("td", null, String(r.attendancePct)),
              React.createElement("td", null, String(r.cgpa)),
              React.createElement("td", null, String(r.avgInternal)),
              React.createElement("td", null, String(r.backlogs)),

              // ✅ NEW: Update + Delete buttons
              React.createElement(
                "td",
                null,
                React.createElement(
                  "div",
                  { className: "d-flex gap-2" },
                  React.createElement(
                    "button",
                    {
                      className: "btn btn-sm btn-outline-dark",
                      onClick: function () {
                        onEdit(r);
                      }
                    },
                    "Update"
                  ),
                  React.createElement(
                    "button",
                    {
                      className: "btn btn-sm btn-danger",
                      onClick: function () {
                        if (window.confirm("Delete this record?")) deleteOne(r._id);
                      }
                    },
                    "Delete"
                  )
                )
              )
            );
          })
        )
      )
    );
  }

  return React.createElement(
    PageContainer,
    null,
    React.createElement("h4", { className: "fw-bold mb-2" }, "Manage Academic Records"),
    React.createElement("p", { className: "text-muted mb-3" }, "Add new records or update existing records using Upsert."),

    msg ? React.createElement(AlertMessage, { type: "success", text: msg }) : null,
    err ? React.createElement(AlertMessage, { type: "danger", text: err }) : null,

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
              {
                className: "btn btn-outline-dark w-100",
                onClick: function () {
                  listState.refetch();
                }
              },
              "Refresh List"
            )
          )
        )
      )
    ),

    React.createElement(
      "div",
      { className: "card mb-3" },
      React.createElement(
        "div",
        { className: "card-body" },
        React.createElement("h6", { className: "fw-bold mb-3" }, "Add / Update (Upsert)"),

        React.createElement(
          "div",
          { className: "row g-2" },
          React.createElement(
            "div",
            { className: "col-md-6" },
            React.createElement("label", { className: "form-label" }, "Student ID (Mongo User _id)"),
            React.createElement("input", {
              className: "form-control",
              value: studentId,
              onChange: function (e) {
                setStudentId(e.target.value);
              }
            })
          ),
          React.createElement(
            "div",
            { className: "col-md-3" },
            React.createElement("label", { className: "form-label" }, "Attendance %"),
            React.createElement("input", {
              className: "form-control",
              value: attendancePct,
              onChange: function (e) {
                setAttendancePct(e.target.value);
              }
            })
          ),
          React.createElement(
            "div",
            { className: "col-md-3" },
            React.createElement("label", { className: "form-label" }, "CGPA"),
            React.createElement("input", {
              className: "form-control",
              value: cgpa,
              onChange: function (e) {
                setCgpa(e.target.value);
              }
            })
          ),
          React.createElement(
            "div",
            { className: "col-md-4" },
            React.createElement("label", { className: "form-label" }, "Avg Internal"),
            React.createElement("input", {
              className: "form-control",
              value: avgInternal,
              onChange: function (e) {
                setAvgInternal(e.target.value);
              }
            })
          ),
          React.createElement(
            "div",
            { className: "col-md-4" },
            React.createElement("label", { className: "form-label" }, "Backlogs"),
            React.createElement("input", {
              className: "form-control",
              value: backlogs,
              onChange: function (e) {
                setBacklogs(e.target.value);
              }
            })
          ),
          React.createElement(
            "div",
            { className: "col-md-4 d-flex align-items-end" },
            React.createElement(
              "button",
              { className: "btn btn-dark w-100", onClick: onSave, disabled: upsertState.isLoading },
              upsertState.isLoading ? "Saving..." : "Save Record"
            )
          )
        ),

        React.createElement(
          "div",
          { className: "mt-3 d-flex gap-2 flex-wrap" },
          React.createElement(
            "button",
            { className: "btn btn-outline-dark btn-sm", onClick: clearForm },
            "Clear Form"
          )
        )
      )
    ),

    React.createElement("h6", { className: "fw-bold" }, "Records List"),
    table
  );
}

export default ManageRecords;
