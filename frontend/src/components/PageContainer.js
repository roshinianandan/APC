import React from "react";

function PageContainer(props) {
  return React.createElement(
    "div",
    { className: "container py-4" },

    props.title
      ? React.createElement(
          "div",
          { className: "page-header shadow-sm" },
          React.createElement("h4", { className: "mb-1 fw-bold" }, props.title),
          props.subtitle
            ? React.createElement("p", { className: "mb-0 opacity-75" }, props.subtitle)
            : null
        )
      : null,

    React.createElement(
      "div",
      { className: "bg-white p-4 rounded shadow-sm" },
      props.children
    )
  );
}

export default PageContainer;
