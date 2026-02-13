import React from "react";
import PageContainer from "../../components/PageContainer";

function StudentList() {
  return React.createElement(
    PageContainer,
    null,
    React.createElement("h4", null, "Student List"),
    React.createElement("p", { className: "text-muted" }, "Optional module (can be extended later).")
  );
}

export default StudentList;
