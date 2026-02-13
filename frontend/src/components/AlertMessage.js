import React from "react";

function AlertMessage(props) {
  const type = props.type || "danger";
  const text = props.text || "Something went wrong";
  return React.createElement("div", { className: "alert alert-" + type }, text);
}

export default AlertMessage;
