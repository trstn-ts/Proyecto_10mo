import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../usuarios/Usuarios.css"; 

function TicketsCerrados() {  
  const [ticketsCerrado, setTicketsCerrado] = useState([]);  
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    return new Intl.DateTimeFormat("es-MX", {
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(fecha));
  };

  useEffect(() => {
    const obtener = async (url, setter) => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Error al obtener tickets");
        const data = await response.json();
        setter(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };
    obtener("http://localhost:3001/web/ticketsCerrado", setTicketsCerrado);
  }, []);

  if (cargando) return <p className="text-center mt-5">Cargando tickets...</p>;
  if (error) return <p className="text-danger text-center mt-5">{error}</p>;

  return (
    <div className="container mt-4 usuarios-container">

      {/* TICKETS CERRADOS */}
      <h2 className="text-dark mb-3">Tickets Cerrados</h2>
      <div className="table-responsive shadow-sm rounded mb-4">
        <table className="table table-hover align-middle">
          <thead className="table-danger">
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Prioridad</th>
              <th>Usuario</th>
              <th>Técnico</th>
              <th>Fecha cierre</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ticketsCerrado.map((t) => (
              <tr key={t.id_ticket}>
                <td>{t.id_ticket}</td>
                <td>{t.titulo}</td>
                 <td>
                  <span
                    className={
                      t.prioridad === "Alta"
                        ? "badge bg-danger"
                        : t.prioridad === "Media"
                        ? "badge bg-warning text-dark"
                        : "badge bg-success"
                    }
                  >
                    {t.prioridad}
                  </span>
                </td>
                <td>{t.nombre_usuario}</td>
                <td>{t.nombre_tecnico}</td>
                <td>{formatearFecha(t.fecha_cierre)}</td>
                <td>
                  <button className="btn btn-outline-primary btn-sm">
                    <i className="bi bi-eye"></i> Detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TicketsCerrados;

