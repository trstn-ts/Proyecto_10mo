import React from "react";
import { Navigate } from "react-router-dom";

function Ruta({ autenticado, children }) {
  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default Ruta;
