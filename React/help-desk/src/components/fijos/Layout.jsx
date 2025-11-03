import React from "react";
import { useNavigate, Link, Outlet } from "react-router-dom";
import "./Layout.css";

function Layout({ setAutenticado }) {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.clear();
    setAutenticado(false);
    navigate("/login");
  };

  return (
    <div className="layout">
      {/* --- Encabezado --- */}
      <header className="header">
        <h1>HelpDesk</h1>
        <button onClick={handleLogout}>Cerrar sesión</button>
      </header>

      {/* --- Barra de navegacion --- */}
      <aside className="sidebar">
        <nav>
          <ul>
            <li>
              <Link to="/inicio">Inicio</Link>
            </li>
            <li>
              <Link to="/usuarios">Usuarios</Link>
              <Link to="/usuarios-inactivos">Usuarios Inactivos</Link>
            </li>
            <li>
              <Link to="/tickets">Tickets</Link>
              <Link to="/tickets-sin-asignar">Tickets Sin Asignar</Link>
            </li>              
            <li>
              <Link to="/roles">Roles</Link>
            </li>                         
            <li>
              <Link to="/areas">Areas</Link>
            </li>
          </ul>
        </nav>
      </aside>    
      <main className="main-content">
        <Outlet /> 
      </main>
    </div>
  );
}

export default Layout;
