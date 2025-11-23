import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../usuarios/Usuarios.css";

function TicketsCerrados() {
  const [ticketsCerrado, setTicketsCerrado] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [evaluaciones, setEvaluaciones] = useState([]);
  const [ticketActual, setTicketActual] = useState(null);

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

  const cargarEvaluaciones = async (id_ticket) => {
    setTicketActual(id_ticket);
    try {
      const res = await fetch(`http://localhost:3001/web/evaluaciones/${id_ticket}`);
      const data = await res.json();
      setEvaluaciones(data);
    } catch (err) {
      console.error("Error al obtener evaluaciones", err);
    }
  };

  if (cargando) return <p className="text-center mt-5">Cargando tickets...</p>;
  if (error) return <p className="text-danger text-center mt-5">{error}</p>;

  return (
    <div className="container mt-4 usuarios-container">
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
                  <button
                    className="btn btn-outline-primary btn-sm"
                    data-bs-toggle="modal"
                    data-bs-target="#modalEvaluaciones"
                    onClick={() => cargarEvaluaciones(t.id_ticket)}
                  >
                    <i className="bi bi-star"></i> Evaluaciones
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div
        className="modal fade"
        id="modalEvaluaciones"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title">
                Evaluaciones del Ticket #{ticketActual}
              </h5>
              <button
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body">

              {evaluaciones.length === 0 ? (
                <p className="text-center text-muted">
                  Este ticket no tiene evaluaciones.
                </p>
              ) : (
                evaluaciones.map((ev) => (
                  <div key={ev.id_evaluacion} className="border rounded p-3 mb-3 shadow-sm">

                    <h6 className="fw-bold">
                      {ev.nombre_evaluador}{" "}
                      <span className="badge bg-secondary">
                        {ev.rol_evaluador}
                      </span>
                    </h6>

                    <p className="mb-1">
                      <strong>Calificación:</strong> ⭐ {ev.calificacion}
                    </p>

                    <p className="mb-1">
                      <strong>Comentario:</strong>{" "}
                      {ev.comentario ? ev.comentario : "Sin comentario"}
                    </p>

                    <p className="text-muted small">
                      {formatearFecha(ev.fecha_evaluacion)}
                    </p>
                  </div>
                ))
              )}

            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Cerrar
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}

export default TicketsCerrados;
