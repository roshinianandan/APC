import React from "react";

function Loader() {
  return React.createElement(
    "div",
    { className: "d-flex align-items-center gap-2" },
    React.createElement("div", { className: "spinner-border", role: "status" }),
    React.createElement("span", null, "Loading...")
  );
}

export default Loader;
