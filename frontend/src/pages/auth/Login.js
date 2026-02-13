import React, { useState } from "react";
import { useLoginMutation } from "../../features/auth/authApi";
import { useDispatch } from "react-redux";
import { setAuth } from "../../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import PageContainer from "../../components/PageContainer";
import AlertMessage from "../../components/AlertMessage";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, loginState] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [err, setErr] = useState("");

  const onSubmit = async function (e) {
    e.preventDefault();
    setErr("");
    try {
      const res = await login({ email: email, password: password }).unwrap();
      dispatch(setAuth(res));
      navigate("/");
    } catch (ex) {
      setErr(ex && ex.data && ex.data.message ? ex.data.message : "Login failed");
    }
  };

  return React.createElement(
    "div",
    { className: "row justify-content-center mt-5" },
    React.createElement(
      "div",
      { className: "col-md-5 col-lg-4" },
      React.createElement(
        PageContainer,
        null,
        React.createElement("h4", { className: "mb-3 text-center" }, "Login"),
        err ? React.createElement(AlertMessage, { type: "danger", text: err }) : null,
        React.createElement(
          "form",
          { onSubmit: onSubmit },
          React.createElement("input", {
            className: "form-control mb-3",
            placeholder: "Email",
            value: email,
            onChange: function (e) {
              setEmail(e.target.value);
            }
          }),
          React.createElement("input", {
            className: "form-control mb-3",
            type: "password",
            placeholder: "Password",
            value: password,
            onChange: function (e) {
              setPassword(e.target.value);
            }
          }),
          React.createElement(
            "button",
            { className: "btn btn-dark w-100", disabled: loginState.isLoading, type: "submit" },
            loginState.isLoading ? "Signing in..." : "Login"
          ),
          React.createElement(
            "div",
            { className: "text-muted small mt-3" },
            "Tip: use admin/faculty/student credentials created in backend."
          )
        )
      )
    )
  );
}

export default Login;
