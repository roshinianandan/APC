import React from "react";
import { Link } from "react-router-dom";
import PageContainer from "../../components/PageContainer";
import Loader from "../../components/Loader";
import AlertMessage from "../../components/AlertMessage";
import { useListUsersQuery, useSetUserActiveMutation } from "../../features/users/usersApi";
import { roleBadgeClass } from "../../features/users/usersHelpers";

function Users() {
  const { data, isLoading, error, refetch } = useListUsersQuery();
  const [setUserActive, setState] = useSetUserActiveMutation();

  const onToggle = async function (u) {
    await setUserActive({ id: u._id, isActive: !u.isActive }).unwrap();
  };

  let body = null;

  if (isLoading) body = React.createElement(Loader);
  else if (error) body = React.createElement(AlertMessage, { type: "danger", text: "Failed to load users" });
  else if (data && data.users) {
    body = React.createElement(
      "div",
      { className: "table-responsive" },
      React.createElement(
        "table",
        { className: "table table-striped table-sm" },
        React.createElement(
          "thead",
          null,
          React.createElement(
            "tr",
            null,
            React.createElement("th", null, "Name"),
            React.createElement("th", null, "Email"),
            React.createElement("th", null, "Role"),
            React.createElement("th", null, "Dept"),
            React.createElement("th", null, "Active"),
            React.createElement("th", null, "Action")
          )
        ),
        React.createElement(
          "tbody",
          null,
          data.users.map(function (u) {
            return React.createElement(
              "tr",
              { key: u._id },
              React.createElement("td", null, u.name),
              React.createElement("td", null, u.email),
              React.createElement("td", null, React.createElement("span", { className: "badge " + roleBadgeClass(u.role) }, u.role)),
              React.createElement("td", null, u.department || "-"),
              React.createElement("td", null, u.isActive ? "Yes" : "No"),
              React.createElement(
                "td",
                null,
                React.createElement(
                  "button",
                  { className: "btn btn-sm btn-outline-dark", onClick: function () { onToggle(u); }, disabled: setState.isLoading },
                  u.isActive ? "Disable" : "Enable"
                )
              )
            );
          })
        )
      )
    );
  }
  return React.createElement(
    PageContainer,
    null,
    React.createElement(
      "div",
      { className: "d-flex justify-content-between align-items-center mb-2" },
      React.createElement("h4", { className: "mb-0" }, "Users"),
      React.createElement(
        "div",
        { className: "d-flex gap-2" },
        React.createElement(Link, { className: "btn btn-dark btn-sm", to: "/admin/users/create" }, "Create User"),
        React.createElement("button", { className: "btn btn-outline-dark btn-sm", onClick: function () { refetch(); } }, "Refresh")
      )
    ),
    body
  );
}

export default Users;
