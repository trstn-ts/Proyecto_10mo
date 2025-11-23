import React from "react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, NavLink, Outlet } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Layout.css";

function Layout({ setAutenticado }) {
  const navigate = useNavigate();
  const location = useLocation();

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const roles = {
    1: "Administrador",
    2: "Técnico",
    3: "Usuario",
  };

  const [notiCount, setNotiCount] = useState(0);

  const handleLogout = () => {
    localStorage.clear();
    setAutenticado(false);
    navigate("/login");
  };

  useEffect(() => {
    const obtenerNotificaciones = async () => {
      try {
        const res = await fetch("http://localhost:3001/web/ticketsSinAsignar");
        const data = await res.json();
        setNotiCount(data.length);
      } catch (err) {
        console.error("Error obteniendo tickets no asignados:", err);
      }
    };

    obtenerNotificaciones();
  }, [location.pathname]);

  return (
    <div className="layout">      
      <header className="header d-flex justify-content-between align-items-center">
        <h1 className="logo-text">HelpDesk</h1>

        <div className="d-flex align-items-center gap-4">
                    
          <div
            className="noti-icon position-relative"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/tickets-sin-asignar")}
          >
            <i className="bi bi-bell fs-4"></i>

            {notiCount > 0 && (
              <span className="noti-badge">
                {notiCount}
              </span>
            )}
          </div>
          
          <div className="user-info text-end">
            <div className="fw-bold">{usuario?.nombre} {usuario?.apellido}</div>
            <div className="user-role">{roles[usuario?.id_rol]}</div>
          </div>
          
          <button
            onClick={handleLogout}
            className="btn btn-danger logout-btn d-flex align-items-center gap-2"
          >
            <i className="bi bi-box-arrow-right"></i> Salir
          </button>
        </div>
      </header>
      
      <aside className="sidebar">
        <nav>
          <ul>

            <li className="sidebar-title">General</li>
            <li>
              <NavLink to="/inicio" className={({ isActive }) => isActive ? "activo" : ""}>
                <i className="bi bi-house-door me-2"></i> Inicio
              </NavLink>
            </li>

            {usuario?.id_rol === 1 && (
              <>
                <li className="sidebar-title">Administración</li>
                <li>
                  <NavLink to="/usuarios" className={({ isActive }) => isActive ? "activo" : ""}>
                    <i className="bi bi-people me-2"></i> Usuarios
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/usuarios-inactivos" className={({ isActive }) => isActive ? "activo" : ""}>
                    <i className="bi bi-person-x me-2"></i> Usuarios Inactivos
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/roles" className={({ isActive }) => isActive ? "activo" : ""}>
                    <i className="bi bi-shield-lock me-2"></i> Roles
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/areas" className={({ isActive }) => isActive ? "activo" : ""}>
                    <i className="bi bi-building me-2"></i> Áreas
                  </NavLink>
                </li>
              </>
            )}
            
            <li className="sidebar-title">Tickets</li>
            <li>
              <NavLink to="/tickets" className={({ isActive }) => isActive ? "activo" : ""}>
                <i className="bi bi-ticket-detailed me-2"></i> Tickets
              </NavLink>
            </li>
            <li>
                <NavLink to="/tickets-sin-asignar" className={({ isActive }) => isActive ? "activo" : ""}>
                  <i className="bi bi-hourglass-split me-2"></i> Sin asignar
                </NavLink>
              </li>
            <li>
              <NavLink to="/tickets-cerrados" className={({ isActive }) => isActive ? "activo" : ""}>
                <i className="bi bi-check2-circle me-2"></i> Cerrados
              </NavLink>
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
