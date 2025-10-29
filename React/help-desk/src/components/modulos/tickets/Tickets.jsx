import React, { useState, useEffect } from "react";

function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const obtenerTickets = async () => {
      try {
        const respuesta = await fetch("http://localhost:3001/api/tickets");
        if (!respuesta.ok) {
          throw new Error("Error al obtener tickets");
        }
        const datos = await respuesta.json();
        setTickets(datos);
        setCargando(false);
      } catch (err) {
        setError(err.message);
        setCargando(false);
      }
    };

    obtenerTickets();
  }, []);

  if (cargando) return <p>Cargando tickets...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Lista de Tickets</h2>
      <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Usuario</th>
            <th>Tecnico</th>
            <th>Titulo</th>
            <th>Prioridad</th>
            <th>Estado</th>
            <th>Fecha de Creación</th>
            <th>Fecha de Cierre</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id_ticket}>
              <td>{ticket.id_ticket}</td>
              <td>{ticket.nombre_usuario}</td>
              <td>{ticket.nombre_tecnico}</td>
              <td>{ticket.titulo}</td>
              <td>{ticket.prioridad}</td>
              <td>{ticket.estado}</td>
              <td>{ticket.fecha_creacion}</td>
              <td>{ticket.fecha_cierre}</td>
              <td>
                <button>Ver</button>
                <button>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Tickets;

