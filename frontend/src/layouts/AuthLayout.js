import React from "react";

function AuthLayout(props) {
  return React.createElement("div", { className: "container" }, props.children);
}

export default AuthLayout;
