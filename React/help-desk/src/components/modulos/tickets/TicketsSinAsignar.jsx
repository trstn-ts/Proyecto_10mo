import React, { useState, useEffect } from "react";

function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [ticketSeleccionado, setTicketSeleccionado] = useState(null);
  const [idTecnico, setIdTecnico] = useState("");
  const [prioridad, setPrioridad] = useState("");
  const [mostrandoModal, setMostrandoModal] = useState(false);

  useEffect(() => {
    const obtenerTickets = async () => {
      try {
        const respuesta = await fetch("http://localhost:3001/api/ticketsSinAsignar");
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
        const res = await fetch("http://localhost:3001/api/tecnicos");
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
    setPrioridad("");
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
      const respuesta = await fetch("http://localhost:3001/api/asignarTicket", {
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

  if (cargando) return <p>Cargando tickets...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Tickets Sin Asignar</h2>
      <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Usuario</th>
            <th>Título</th>
            <th>Fecha de Creación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id_ticket}>
              <td>{ticket.id_ticket}</td>
              <td>{ticket.nombre_usuario}</td>
              <td>{ticket.titulo}</td>
              <td>{ticket.fecha_creacion}</td>
              <td>
                <button onClick={() => abrirModal(ticket)}>Detalles</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {mostrandoModal && ticketSeleccionado && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "10px",
            width: "400px",
          }}>
            <h3>Detalles del Ticket</h3>
            <p><strong>Título:</strong> {ticketSeleccionado.titulo}</p>
            <p><strong>Descripción:</strong> {ticketSeleccionado.descripcion_problema}</p>
            <p><strong>Fecha:</strong> {ticketSeleccionado.fecha_creacion}</p>

            <div>
              <label>Prioridad: </label>
              <select value={prioridad} onChange={(e) => setPrioridad(e.target.value)}>
                <option value="">Selecciona</option>
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </div>

            <div>
              <label>Técnico: </label>
              <select value={idTecnico} onChange={(e) => setIdTecnico(e.target.value)}>
                <option value="">Selecciona un técnico</option>
                {tecnicos.map((t) => (
                  <option key={t.id_usuario} value={t.id_usuario}>
                    {t.nombre_usuario}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: "15px" }}>
              <button onClick={asignarTicket}>Asignar</button>
              <button onClick={cerrarModal} style={{ marginLeft: "10px" }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tickets;
