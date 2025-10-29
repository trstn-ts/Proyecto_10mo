import React from "react";
import { Link, Outlet } from "react-router-dom";
import "./Layout.css";

function Layout() {
  return (
    <div className="layout">
      {/* --- Encabezado --- */}
      <header className="header">
        <h1>HelpDesk</h1>
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
            </li>
            <li>
              <Link to="/tickets">Tickets</Link>
            </li>   
            <li>
              <Link to="/tickets-sin-asignar">Tickets Sin Asignar</Link>
            </li>   
            <li>
              <Link to="/roles">Roles</Link>
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
