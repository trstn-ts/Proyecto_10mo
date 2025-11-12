import React from "react";
import { useNavigate, NavLink, Outlet } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
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
      <header className="header d-flex justify-content-between align-items-center">
        <h1 className="logo-text">HelpDesk</h1>

        <button
          onClick={handleLogout}
          className="btn btn-danger logout-btn d-flex align-items-center gap-2"
        >
          <i className="bi bi-box-arrow-right"></i> Cerrar sesión
        </button>
      </header>

      {/* --- Menú lateral --- */}
      <aside className="sidebar">
        <nav>
          <ul>
            <li>
              <NavLink to="/inicio" activeclassname="activo">Inicio</NavLink>
            </li>
            <li>
              <NavLink to="/usuarios" activeclassname="activo">Usuarios</NavLink>
              <NavLink to="/usuarios-inactivos" activeclassname="activo">
                Usuarios Inactivos
              </NavLink>
            </li>
            <li>
              <NavLink to="/tickets" activeclassname="activo">Tickets</NavLink>
              <NavLink to="/tickets-sin-asignar" activeclassname="activo">
                Tickets Sin Asignar
              </NavLink>
            </li>
            <li>
              <NavLink to="/roles" activeclassname="activo">Roles</NavLink>
            </li>
            <li>
              <NavLink to="/areas" activeclassname="activo">Áreas</NavLink>
            </li>
          </ul>
        </nav>
      </aside>

      {/* --- Contenido principal --- */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;

