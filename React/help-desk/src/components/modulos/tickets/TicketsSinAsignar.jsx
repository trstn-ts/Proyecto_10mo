import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../usuarios/Usuarios.css"; 

function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [ticketSeleccionado, setTicketSeleccionado] = useState(null);
  const [idTecnico, setIdTecnico] = useState("");
  const [prioridad, setPrioridad] = useState("");
  const [mostrandoModal, setMostrandoModal] = useState(false);

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
    const obtenerTickets = async () => {
      try {
        const respuesta = await fetch("http://localhost:3001/web/ticketsSinAsignar");
        if (!respuesta.ok) throw new Error("Error al obtener tickets");
        const datos = await respuesta.json();
        setTickets(datos);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };
    obtenerTickets();
  }, []);

  useEffect(() => {
    const obtenerTecnicos = async () => {
      try {
        const res = await fetch("http://localhost:3001/web/tecnicos");
        const datos = await res.json();
        setTecnicos(datos);
      } catch (err) {
        console.error("Error al cargar técnicos:", err);
      }
    };
    obtenerTecnicos();
  }, []);

  const abrirModal = (ticket) => {
    setTicketSeleccionado(ticket);
    setIdTecnico("");
    setPrioridad(ticket.prioridad || "");
    setMostrandoModal(true);
  };

  const cerrarModal = () => {
    setMostrandoModal(false);
    setTicketSeleccionado(null);
  };

  const asignarTicket = async () => {
    if (!idTecnico || !prioridad) {
      alert("Por favor selecciona técnico y prioridad.");
      return;
    }

    try {
      const respuesta = await fetch("http://localhost:3001/web/asignarTicket", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_ticket: ticketSeleccionado.id_ticket,
          id_tecnico: parseInt(idTecnico),
          prioridad,
        }),
      });

      if (!respuesta.ok) throw new Error("Error al asignar ticket");

      alert("Ticket asignado correctamente");
      cerrarModal();

      setTickets(tickets.filter((t) => t.id_ticket !== ticketSeleccionado.id_ticket));
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  if (cargando) return <p className="text-center mt-4">Cargando tickets...</p>;
  if (error) return <p className="text-danger text-center mt-4">{error}</p>;

  return (
    <div className="container mt-4 usuarios-container">

      <h2 className="text-dark mb-3">Tickets Sin Asignar</h2>

      <div className="table-responsive shadow-sm rounded mb-4">
        <table className="table table-hover align-middle">
          <thead className="table-danger">
          <tr>
            <th>ID</th>
            <th>Usuario</th>
            <th>Título</th>
            <th>Fecha de Creación</th>
            <th>Prioridad</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id_ticket}>
              <td>{ticket.id_ticket}</td>
              <td>{ticket.nombre_usuario}</td>
              <td>{ticket.titulo}</td>
              <td>{formatearFecha(ticket.fecha_creacion)}</td>
              <td>
                <span
                  className={
                    ticket.prioridad === "Alta" ? "badge bg-danger" :
                    ticket.prioridad === "Media" ? "badge bg-warning text-dark" :
                    "badge bg-success"
                  }
                >
                  {ticket.prioridad}
                </span>
              </td>
              <td>
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => abrirModal(ticket)}
                >
                  <i className="bi bi-eye"></i> Detalles
                </button>
              </td>
            </tr>
          ))}
        </tbody>


        </table>
      </div>

      {/* MODAL */}
      {mostrandoModal && ticketSeleccionado && (
        <div className="custom-modal">
          <div className="custom-modal-content shadow-lg">

            <h3 className="mb-3 text-dark">
              <i className="bi bi-ticket-detailed"></i> Detalles del Ticket
            </h3>

            <p><strong>Título:</strong> {ticketSeleccionado.titulo}</p>
            <p><strong>Descripción:</strong> {ticketSeleccionado.descripcion_problema}</p>
            <p><strong>Fecha:</strong> {ticketSeleccionado.fecha_creacion}</p>
            <p><strong>Prioridad asignada por IA:</strong>
              <span
                className={
                  ticketSeleccionado.prioridad === "Alta" ? "badge bg-danger" :
                  ticketSeleccionado.prioridad === "Media" ? "badge bg-warning text-dark" :
                  "badge bg-success"
                }
              >
                {ticketSeleccionado.prioridad}
              </span>
            </p>

            <div className="mt-3">
              <label className="form-label"><strong>Prioridad:</strong></label>
              <select
                className="form-select"
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value)}
              >
                <option value="">Selecciona</option>
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </div>

            <div className="mt-3">
              <label className="form-label"><strong>Técnico:</strong></label>
              <select
                className="form-select"
                value={idTecnico}
                onChange={(e) => setIdTecnico(e.target.value)}
              >
                <option value="">Selecciona un técnico</option>
                {tecnicos.map((t) => (
                  <option key={t.id_usuario} value={t.id_usuario}>
                    {t.nombre_usuario}
                  </option>
                ))}
              </select>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button className="btn btn-success" onClick={asignarTicket}>
                <i className="bi bi-check-circle"></i> Asignar
              </button>

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

