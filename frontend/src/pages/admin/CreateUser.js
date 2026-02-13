import React, { useState } from "react";
import PageContainer from "../../components/PageContainer";
import AlertMessage from "../../components/AlertMessage";
import { useCreateUserMutation } from "../../features/users/usersApi";

function CreateUser() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("Admin@123");
  const [role, setRole] = useState("student");
  const [department, setDepartment] = useState("CSE");

  const [createUser, state] = useCreateUserMutation();
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const onCreate = async function (e) {
    e.preventDefault();
    setMsg("");
    setErr("");
    try {
      await createUser({ name: name, email: email, password: password, role: role, department: department }).unwrap();
      setMsg("User created successfully");
      setName("");
      setEmail("");
    } catch (ex) {
      setErr(ex && ex.data && ex.data.message ? ex.data.message : "Create failed");
    }
  };

  return React.createElement(
    PageContainer,
    null,
    React.createElement("h4", null, "Create User"),
    msg ? React.createElement(AlertMessage, { type: "success", text: msg }) : null,
    err ? React.createElement(AlertMessage, { type: "danger", text: err }) : null,

    React.createElement(
      "form",
      { onSubmit: onCreate },
      React.createElement("label", { className: "form-label" }, "Name"),
      React.createElement("input", { className: "form-control mb-2", value: name, onChange: function (e) { setName(e.target.value); }, required: true }),

      React.createElement("label", { className: "form-label" }, "Email"),
      React.createElement("input", { className: "form-control mb-2", value: email, onChange: function (e) { setEmail(e.target.value); }, required: true }),

      React.createElement("label", { className: "form-label" }, "Password"),
      React.createElement("input", { className: "form-control mb-2", value: password, onChange: function (e) { setPassword(e.target.value); }, required: true }),

      React.createElement("label", { className: "form-label" }, "Role"),
      React.createElement(
        "select",
        { className: "form-select mb-2", value: role, onChange: function (e) { setRole(e.target.value); } },
        React.createElement("option", { value: "student" }, "student"),
        React.createElement("option", { value: "faculty" }, "faculty"),
        React.createElement("option", { value: "admin" }, "admin")
      ),

      React.createElement("label", { className: "form-label" }, "Department"),
      React.createElement("input", { className: "form-control mb-3", value: department, onChange: function (e) { setDepartment(e.target.value); } }),

      React.createElement("button", { className: "btn btn-dark", disabled: state.isLoading, type: "submit" }, state.isLoading ? "Creating..." : "Create")
    )
  );
}

export default CreateUser;
