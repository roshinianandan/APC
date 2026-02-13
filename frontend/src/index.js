import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootswatch/dist/lux/bootstrap.min.css"; 


import App from "./App";
import { store } from "./app/store";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  React.createElement(
    Provider,
    { store: store },
    React.createElement(
      BrowserRouter,
      null,
      React.createElement(App)
    )
  )
);
