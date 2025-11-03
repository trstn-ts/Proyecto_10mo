import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Layout from "./components/fijos/Layout";
import Login from "./components/fijos/Login";

import Inicio from "./components/modulos/inicio/Inicio";
import Tickets from "./components/modulos/tickets/Tickets";
import TicketsSinAsignar from "./components/modulos/tickets/TicketsSinAsignar";
import Usuarios from "./components/modulos/usuarios/Usuarios";
import Roles from "./components/modulos/roles/Roles";
import Areas from "./components/modulos/areas/Areas";
import UsuariosInactivos from "./components/modulos/usuarios/UsuariosInactivos";

function App() {  
  const [autenticado, setAutenticado] = useState(() => {
    return localStorage.getItem("autenticado") === "true";
  });

  return (
    <Router>
      <Routes>
        {/* Ruta de login */}
        <Route path="/login" element={<Login setAutenticado={setAutenticado} />} />

        {/* Rutas protegidas */}
        <Route
          path="/"
          element={autenticado ? <Layout setAutenticado={setAutenticado} /> : <Navigate to="/login" />}
        >
          <Route path="inicio" element={<Inicio />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="usuarios-inactivos" element={<UsuariosInactivos />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="tickets-sin-asignar" element={<TicketsSinAsignar />} />
          <Route path="roles" element={<Roles />} />
          <Route path="areas" element={<Areas />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
