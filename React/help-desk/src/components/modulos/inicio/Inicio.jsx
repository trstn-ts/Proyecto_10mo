import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Inicio.css"; 
export default function Inicio() {

  const [stats, setStats] = useState({
    usuarios: 0,
    tecnicos: 0,
    enProceso: 0,
    cerrados: 0,
    cancelados: 0,
    promedioSatisfaccion: 0,
  });

  const [statsTecnicos, setStatsTecnicos] = useState([]);
  const [statsUsuarios, setStatsUsuarios] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {

        const [
          usuarios,
          tecnicos,
          enProceso,
          cerrados,
          cancelados,
          evaluaciones,
          tecnicosStats,
          usuariosStats
        ] = await Promise.all([
          axios.get("http://localhost:3001/web/usuarios"),
          axios.get("http://localhost:3001/web/tecnicos"),
          axios.get("http://localhost:3001/web/ticketsEnProceso"),
          axios.get("http://localhost:3001/web/ticketsCerrado"),
          axios.get("http://localhost:3001/web/ticketsCancelado"),
          axios.get("http://localhost:3001/web/ticketsConEvaluacion"),
          axios.get("http://localhost:3001/web/statsTecnicos"),
          axios.get("http://localhost:3001/web/statsUsuarios")
        ]);

        const promedio = calcularPromedio(evaluaciones.data);

        setStats({
          usuarios: usuarios.data.filter(u => u.id_rol === 3).length,
          tecnicos: usuarios.data.filter(u => u.id_rol === 2).length,
          enProceso: enProceso.data.length,
          cerrados: cerrados.data.length,
          cancelados: cancelados.data.length,
          promedioSatisfaccion: promedio,
        });

        setStatsTecnicos(tecnicosStats.data);
        setStatsUsuarios(usuariosStats.data);

      } catch (error) {
        console.error("Error cargando dashboard:", error);
      }
    };

    fetchData();
  }, []);

  const calcularPromedio = (lista) => {
    const evaluados = lista.filter(t => t.calificacion_promedio != null);
    if (evaluados.length === 0) return 0;

    const total = evaluados.reduce(
      (sum, t) => sum + Number(t.calificacion_promedio),
      0
    );

    return (total / evaluados.length).toFixed(2);
  };

  return (
    <div className="dashboard-container">

      <h1 className="titulo-pagina">Estadísticas Generales</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h4>Usuarios</h4>
          <p>{stats.usuarios}</p>
        </div>

        <div className="stat-card">
          <h4>Técnicos</h4>
          <p>{stats.tecnicos}</p>
        </div>

        <div className="stat-card">
          <h4>⭐ Satisfacción</h4>
          <p>{stats.promedioSatisfaccion}</p>
        </div>

        <div className="stat-card">
          <h4>En Proceso</h4>
          <p>{stats.enProceso}</p>
        </div>

        <div className="stat-card">
          <h4>Cerrados</h4>
          <p>{stats.cerrados}</p>
        </div>

        <div className="stat-card">
          <h4>Cancelados</h4>
          <p>{stats.cancelados}</p>
        </div>        
      </div>

      <hr />

      {/* ESTADÍSTICAS POR TÉCNICO */}
      <h2 className="subtitulo">Estadísticas por Técnico</h2>
      <div className="cards-container">
        {statsTecnicos.map((t) => (
          <div className="card-theme user-card" key={t.id_usuario}>
            <h5>{t.nombre}</h5>
            <p>Tickets resueltos: <strong>{t.tickets_resueltos}</strong></p>
            <p>⭐ Promedio: <strong>{t.calificacion_promedio ? Number(t.calificacion_promedio).toFixed(2) : "N/A"}</strong></p>
          </div>
        ))}
      </div>

      <hr />

      {/* ESTADÍSTICAS POR USUARIO */}
      <h2 className="subtitulo">Estadísticas por Usuario</h2>
      <div className="cards-container">
        {statsUsuarios.map((u) => (
          <div className="card-theme user-card" key={u.id_usuario}>
            <h5>{u.nombre}</h5>
            <p>Tickets creados: <strong>{u.tickets_creados}</strong></p>
            <p>⭐ Calificación recibida: <strong>{u.calificacion_promedio ? Number(u.calificacion_promedio).toFixed(2) : "N/A"}</strong></p>
          </div>
        ))}
      </div>

    </div>
  );
}
