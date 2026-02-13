import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

function Logout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(function () {
    dispatch(logout());
    navigate("/login");
  }, [dispatch, navigate]);

  return React.createElement("div", { className: "text-center mt-5" }, "Logging out...");
}

export default Logout;
