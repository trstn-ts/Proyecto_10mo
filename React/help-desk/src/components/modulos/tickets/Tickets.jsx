import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../usuarios/Usuarios.css"; 

function Tickets() {
  const [ticketsProceso, setTicketsProceso] = useState([]);
  const [ticketsCerrado, setTicketsCerrado] = useState([]);
  const [ticketsCancelado, setTicketsCancelado] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

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

    obtener("http://localhost:3001/api/ticketsEnProceso", setTicketsProceso);
    obtener("http://localhost:3001/api/ticketsCerrado", setTicketsCerrado);
    obtener("http://localhost:3001/api/ticketsCancelado", setTicketsCancelado);
  }, []);

  if (cargando) return <p className="text-center mt-5">Cargando tickets...</p>;
  if (error) return <p className="text-danger text-center mt-5">{error}</p>;

  return (
    <div className="container mt-4 usuarios-container">

      {/* TICKETS EN PROCESO */}
      <h2 className="text-dark mb-3">Tickets en Proceso</h2>
      <div className="table-responsive shadow-sm rounded mb-4">
        <table className="table table-hover align-middle">
          <thead className="table-danger">
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Prioridad</th>
              <th>Usuario</th>
              <th>Técnico</th>
              <th>Fecha creación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ticketsProceso.map((t) => (
              <tr key={t.id_ticket}>
                <td>{t.id_ticket}</td>
                <td>{t.titulo}</td>
                <td>{t.prioridad}</td>
                <td>{t.nombre_usuario}</td>
                <td>{t.nombre_tecnico}</td>
                <td>{t.fecha_creacion}</td>
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
                <td>{t.prioridad}</td>
                <td>{t.nombre_usuario}</td>
                <td>{t.nombre_tecnico}</td>
                <td>{t.fecha_cierre}</td>
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

      {/* TICKETS CANCELADOS */}
      <h2 className="text-dark mb-3">Tickets Cancelados</h2>
      <div className="table-responsive shadow-sm rounded mb-4">
        <table className="table table-hover align-middle">
          <thead className="table-danger">
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Usuario</th>
              <th>Fecha creación</th>
              <th>Fecha cancelación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ticketsCancelado.map((t) => (
              <tr key={t.id_ticket}>
                <td>{t.id_ticket}</td>
                <td>{t.titulo}</td>
                <td>{t.nombre_usuario}</td>
                <td>{t.fecha_creacion}</td>
                <td>{t.fecha_cierre}</td>
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

export default Tickets;

