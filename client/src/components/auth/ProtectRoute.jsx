/* eslint-disable react/prop-types */

import { Navigate } from "react-router-dom";

const ProtectRoute = ({ children, user, redirect = "/login" }) => {
  if (!user) {
    return <Navigate to={redirect} />;
  }
  return children;
};

export default ProtectRoute;
