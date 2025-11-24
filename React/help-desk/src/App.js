import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Layout from "./components/fijos/Layout";
import Login from "./components/fijos/Login";
import Inicio from "./components/modulos/inicio/Inicio";
import Tickets from "./components/modulos/tickets/Tickets";
import TicketsCerrados from "./components/modulos/tickets/TicketsCerrados";
import TicketsSinAsignar from "./components/modulos/tickets/TicketsSinAsignar";
import Usuarios from "./components/modulos/usuarios/Usuarios";
import Roles from "./components/modulos/roles/Roles";
import Areas from "./components/modulos/areas/Areas";
import UsuariosInactivos from "./components/modulos/usuarios/UsuariosInactivos";

import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

function App() {  
  const [autenticado, setAutenticado] = useState(() => {
    return localStorage.getItem("autenticado") === "true";
  });

  return (
    <Router>
      <Routes>

        {/* Login */}
        <Route
          path="/login"
          element={<Login setAutenticado={setAutenticado} />}
        />

        {/* Rutas protegidas */}
        <Route
          path="/"
          element={
            autenticado
              ? <Layout setAutenticado={setAutenticado} />
              : <Navigate to="/login" replace />
          }
        >
          <Route path="inicio" element={<Inicio />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="usuarios-inactivos" element={<UsuariosInactivos />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="tickets-cerrados" element={<TicketsCerrados />} />
          <Route path="tickets-sin-asignar" element={<TicketsSinAsignar />} />
          <Route path="roles" element={<Roles />} />
          <Route path="areas" element={<Areas />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
