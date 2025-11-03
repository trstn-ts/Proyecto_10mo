import React, { useState, useEffect } from "react";

function Tickets() {
  const [ticketsProceso, setTicketsProceso] = useState([]);
  const [ticketsCerrado, setTicketsCerrado] = useState([]);
  const [ticketsCancelado, setTicketsCancelado] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const obtenerTicketsProceso = async () => {
      try {
        const respuesta = await fetch("http://localhost:3001/api/ticketsEnProceso");
        if (!respuesta.ok) {
          throw new Error("Error al obtener tickets");
        }
        const datos = await respuesta.json();
        setTicketsProceso(datos);
        setCargando(false);
      } catch (err) {
        setError(err.message);
        setCargando(false);
      }
    };

    const obtenerTicketsCerrado = async () => {
      try {
        const respuesta = await fetch("http://localhost:3001/api/ticketsCerrado");
        if (!respuesta.ok) {
          throw new Error("Error al obtener tickets");
        }
        const datos = await respuesta.json();
        setTicketsCerrado(datos);
        setCargando(false);
      } catch (err) {
        setError(err.message);
        setCargando(false);
      }
    };

    const obtenerTicketsCancelado = async () => {
      try {
        const respuesta = await fetch("http://localhost:3001/api/ticketsCancelado");
        if (!respuesta.ok) {
          throw new Error("Error al obtener tickets");
        }
        const datos = await respuesta.json();
        setTicketsCancelado(datos);
        setCargando(false);
      } catch (err) {
        setError(err.message);
        setCargando(false);
      }
    };

    obtenerTicketsProceso();
    obtenerTicketsCerrado();
    obtenerTicketsCancelado();
  }, []);

  if (cargando) return <p>Cargando tickets...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Tickets En Proceso</h2>
      <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Titulo</th>
            <th>Prioridad</th>
            <th>Usuario</th>
            <th>Tecnico</th>                                  
            <th>Fecha de creación</th>            
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ticketsProceso.map((ticket) => (
            <tr key={ticket.id_ticket}>
              <td>{ticket.id_ticket}</td>              
              <td>{ticket.titulo}</td>
              <td>{ticket.prioridad}</td>
              <td>{ticket.nombre_usuario}</td>
              <td>{ticket.nombre_tecnico}</td>                         
              <td>{ticket.fecha_creacion}</td>              
              <td>
                <button>Detalles</button>                
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Tickets Cerrados</h2>
      <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Titulo</th>
            <th>Prioridad</th>
            <th>Usuario</th>
            <th>Tecnico</th>                                              
            <th>Fecha de cierre</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ticketsCerrado.map((ticket) => (
            <tr key={ticket.id_ticket}>
              <td>{ticket.id_ticket}</td>              
              <td>{ticket.titulo}</td>
              <td>{ticket.prioridad}</td>
              <td>{ticket.nombre_usuario}</td>
              <td>{ticket.nombre_tecnico}</td>                                       
              <td>{ticket.fecha_cierre}</td>
              <td>
                <button>Detalles</button>                
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Tickets Cancelados</h2>
      <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>            
            <th>ID</th>            
            <th>Titulo</th>       
            <th>Usuario</th>                        
            <th>Fecha de creacion</th>   
            <th>Fecha de cancelacion</th>            
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ticketsCancelado.map((ticket) => (
            <tr key={ticket.id_ticket}>
              <td>{ticket.id_ticket}</td>
              <td>{ticket.titulo}</td>
              <td>{ticket.nombre_usuario}</td>              
              <td>{ticket.fecha_creacion}</td>                                  
              <td>{ticket.fecha_cierre}</td>
              <td>
                <button>Detalles</button>                
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    
  );
}

export default Tickets;

