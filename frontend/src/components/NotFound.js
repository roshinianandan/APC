import React from "react";

function NotFound() {
  return React.createElement(
    "div",
    { className: "text-center py-5" },
    React.createElement("h2", null, "404"),
    React.createElement("p", null, "Page not found")
  );
}

export default NotFound;
