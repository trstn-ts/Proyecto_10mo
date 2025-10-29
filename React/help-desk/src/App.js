import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/fijos/Layout";
import Login from "./components/fijos/Login";

import Inicio from "./components/modulos/inicio/Inicio";
import Tickets from "./components/modulos/tickets/Tickets";
import TicketsSinAsignar from "./components/modulos/tickets/TicketsSinAsignar";
import Usuarios from "./components/modulos/usuarios/Usuarios";
import Roles from "./components/modulos/roles/Roles";

function App() {
  const [autenticado, setAutenticado] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setAutenticado={setAutenticado} />} />
      
        <Route path="/" element={autenticado ? <Layout /> : <Navigate to="/login" />}>
          <Route path="inicio" element={<Inicio />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="tickets-sin-asignar" element={<TicketsSinAsignar />} />
          <Route path="roles" element={<Roles />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
