import React, { useState } from "react";
import PageContainer from "../../components/PageContainer";
import AlertMessage from "../../components/AlertMessage";
import { useRegisterMutation } from "../../features/auth/authApi";
import { useDispatch } from "react-redux";
import { setAuth } from "../../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [role, setRole] = useState("student");
  const [department, setDepartment] = useState("CSE");

  // Student fields
  const [registerNo, setRegisterNo] = useState("");
  const [year, setYear] = useState("3");
  const [section, setSection] = useState("A");

  // Admin code
  const [adminRegisterCode, setAdminRegisterCode] = useState("");

  const [registerUser, state] = useRegisterMutation();
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async function (e) {
    e.preventDefault();
    setErr("");
    setMsg("");

    try {
      var payload = {
        name: name,
        email: email,
        password: password,
        role: role,
        department: department
      };

      if (role === "student") {
        payload.registerNo = registerNo;
        payload.year = Number(year);
        payload.section = section;
      }

      if (role === "admin") {
        payload.adminRegisterCode = adminRegisterCode;
      }

      var res = await registerUser(payload).unwrap();
      dispatch(setAuth(res));
      setMsg("Registered successfully!");
      navigate("/");
    } catch (ex) {
      console.log("REGISTER ERROR =>", ex);

      var message = "Registration failed";

      if (ex && ex.data && ex.data.message) message = ex.data.message;
      else if (ex && ex.data && ex.data.error) message = ex.data.error;
      else if (ex && ex.error) message = ex.error;

      setErr(message);
    }
  };

  var studentFields =
    role === "student"
      ? React.createElement(
          "div",
          null,
          React.createElement("hr", null),
          React.createElement("h6", null, "Student Details"),

          React.createElement("label", { className: "form-label" }, "Register Number"),
          React.createElement("input", {
            className: "form-control mb-2",
            value: registerNo,
            onChange: function (e) {
              setRegisterNo(e.target.value);
            },
            required: true
          }),

          React.createElement("label", { className: "form-label" }, "Year"),
          React.createElement("input", {
            className: "form-control mb-2",
            type: "number",
            min: 1,
            max: 5,
            value: year,
            onChange: function (e) {
              setYear(e.target.value);
            },
            required: true
          }),

          React.createElement("label", { className: "form-label" }, "Section"),
          React.createElement("input", {
            className: "form-control mb-2",
            value: section,
            onChange: function (e) {
              setSection(e.target.value);
            },
            required: true
          })
        )
      : null;

  var adminFields =
    role === "admin"
      ? React.createElement(
          "div",
          null,
          React.createElement("hr", null),
          React.createElement("h6", null, "Admin Verification"),
          React.createElement("label", { className: "form-label" }, "Admin Register Code"),
          React.createElement("input", {
            className: "form-control mb-2",
            value: adminRegisterCode,
            onChange: function (e) {
              setAdminRegisterCode(e.target.value);
            },
            required: true
          })
        )
      : null;

  return React.createElement(
    "div",
    { className: "row justify-content-center mt-4" },
    React.createElement(
      "div",
      { className: "col-md-7 col-lg-6" },
      React.createElement(
        PageContainer,
        null,
        React.createElement("h4", { className: "mb-3 text-center" }, "Register"),

        err ? React.createElement(AlertMessage, { type: "danger", text: err }) : null,
        msg ? React.createElement(AlertMessage, { type: "success", text: msg }) : null,

        React.createElement(
          "form",
          { onSubmit: onSubmit },

          React.createElement("label", { className: "form-label" }, "Full Name"),
          React.createElement("input", {
            className: "form-control mb-2",
            value: name,
            onChange: function (e) {
              setName(e.target.value);
            },
            required: true
          }),

          React.createElement("label", { className: "form-label" }, "Email"),
          React.createElement("input", {
            className: "form-control mb-2",
            value: email,
            onChange: function (e) {
              setEmail(e.target.value);
            },
            required: true
          }),

          React.createElement("label", { className: "form-label" }, "Password"),
          React.createElement("input", {
            className: "form-control mb-2",
            type: "password",
            value: password,
            onChange: function (e) {
              setPassword(e.target.value);
            },
            required: true
          }),

          React.createElement("label", { className: "form-label" }, "Role"),
          React.createElement(
            "select",
            {
              className: "form-select mb-2",
              value: role,
              onChange: function (e) {
                setRole(e.target.value);
              }
            },
            React.createElement("option", { value: "student" }, "student"),
            React.createElement("option", { value: "faculty" }, "faculty"),
            React.createElement("option", { value: "admin" }, "admin")
          ),

          React.createElement("label", { className: "form-label" }, "Department"),
          React.createElement("input", {
            className: "form-control mb-2",
            value: department,
            onChange: function (e) {
              setDepartment(e.target.value);
            },
            required: true
          }),

          studentFields,
          adminFields,

          React.createElement(
            "button",
            {
              className: "btn btn-dark w-100 mt-3",
              type: "submit",
              disabled: state.isLoading
            },
            state.isLoading ? "Creating..." : "Register"
          )
        )
      )
    )
  );
}

export default Register;
