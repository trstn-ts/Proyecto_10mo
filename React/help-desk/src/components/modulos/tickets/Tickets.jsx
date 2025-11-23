import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../usuarios/Usuarios.css";

function Tickets() {

  const [ticketsProceso, setTicketsProceso] = useState([]);
  const [ticketsCancelado, setTicketsCancelado] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [mostrandoModal, setMostrandoModal] = useState(false);
  const [ticketSeleccionado, setTicketSeleccionado] = useState(null);

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

    obtener("http://localhost:3001/web/ticketsEnProceso", setTicketsProceso);
    obtener("http://localhost:3001/web/ticketsCancelado", setTicketsCancelado);
  }, []);
  const abrirModal = (ticket) => {
    setTicketSeleccionado(ticket);
    setMostrandoModal(true);
  };

  const cerrarModal = () => {
    setMostrandoModal(false);
    setTicketSeleccionado(null);
  };

  if (cargando) return <p className="text-center mt-5">Cargando tickets...</p>;
  if (error) return <p className="text-danger text-center mt-5">{error}</p>;

  return (
    <div className="container mt-4 usuarios-container">

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
                <td>{formatearFecha(t.fecha_creacion)}</td>
                <td>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => abrirModal(t)}
                  >
                    <i className="bi bi-eye"></i> Detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
                <td>{formatearFecha(t.fecha_creacion)}</td>
                <td>{formatearFecha(t.fecha_cierre)}</td>
                <td>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => abrirModal(t)}
                  >
                    <i className="bi bi-eye"></i> Detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {mostrandoModal && ticketSeleccionado && (
        <div className="custom-modal">
          <div className="custom-modal-content shadow-lg">

            <h3 className="mb-3 text-dark">
              <i className="bi bi-ticket-detailed"></i> Detalles del Ticket
            </h3>

            <p><strong>ID:</strong> {ticketSeleccionado.id_ticket}</p>
            <p><strong>Título:</strong> {ticketSeleccionado.titulo}</p>

            {ticketSeleccionado.descripcion_problema && (
              <p>
                <strong>Descripción:</strong> {ticketSeleccionado.descripcion_problema}
              </p>
            )}

            <p>
              <strong>Prioridad:</strong>{" "}
              <span
                className={
                  ticketSeleccionado.prioridad === "Alta"
                    ? "badge bg-danger"
                    : ticketSeleccionado.prioridad === "Media"
                    ? "badge bg-warning text-dark"
                    : "badge bg-success"
                }
              >
                {ticketSeleccionado.prioridad}
              </span>
            </p>

            <p><strong>Estado:</strong> {ticketSeleccionado.estado}</p>

            <p><strong>Usuario:</strong> {ticketSeleccionado.nombre_usuario}</p>

            <p>
              <strong>Técnico:</strong>{" "}
              {ticketSeleccionado.nombre_tecnico || "No asignado"}
            </p>

            <p><strong>Fecha creación:</strong> {formatearFecha(ticketSeleccionado.fecha_creacion)}</p>

            {ticketSeleccionado.fecha_cierre && (
              <p><strong>Fecha cierre:</strong> {formatearFecha(ticketSeleccionado.fecha_cierre)}</p>
            )}

            <div className="d-flex justify-content-end mt-4">
              <button className="btn btn-secondary" onClick={cerrarModal}>
                <i className="bi bi-x-circle"></i> Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Tickets;
