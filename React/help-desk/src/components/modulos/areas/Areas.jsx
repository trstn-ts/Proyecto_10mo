import React, { useState, useEffect } from "react";

function Areas() {
  const [areas, setAreas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [usuarios, setUsuarios] = useState([]);
  const [areaSeleccionada, setAreaSeleccionada] = useState(null);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);
  const [mostrandoModalUsuarios, setMostrandoModalUsuarios] = useState(false);

  const [mostrandoModalCrear, setMostrandoModalCrear] = useState(false);
  const [nuevoArea, setNuevoArea] = useState({ nombre_area: "", descripcion: "" });
  const [guardandoArea, setGuardandoArea] = useState(false);
  const [mensajeArea, setMensajeArea] = useState("");
  
  useEffect(() => {
    const obtenerAreas = async () => {
      try {
        const respuesta = await fetch("http://localhost:3001/api/areas");
        if (!respuesta.ok) throw new Error("Error al obtener áreas");
        const datos = await respuesta.json();
        setAreas(datos);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };
    obtenerAreas();
  }, []);
  
  const verUsuarios = async (area) => {
    setAreaSeleccionada(area);
    setMostrandoModalUsuarios(true);
    setCargandoUsuarios(true);
    try {
      const res = await fetch(`http://localhost:3001/api/areasUsuarios?id_area=${area.id_area}`);
      if (!res.ok) throw new Error("Error al obtener usuarios");
      const datos = await res.json();
      setUsuarios(datos);
    } catch (err) {
      console.error(err);
      setUsuarios([]);
    } finally {
      setCargandoUsuarios(false);
    }
  };

  const eliminarArea = async (id_area) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta área?")) return;

    try {
      const respuesta = await fetch(`http://localhost:3001/api/areas/${id_area}`, {
        method: "DELETE",
      });
      const data = await respuesta.json();

      if (!respuesta.ok) {
        alert(data.message || "Error al eliminar el área");
        return;
      }

      alert(data.message);
      setAreas(areas.filter((area) => area.id_area !== id_area));
    } catch (err) {
      console.error("Error al eliminar área:", err);
      alert("Ocurrió un error al intentar eliminar el área");
    }
  };
  
  const guardarArea = async (e) => {
    e.preventDefault();
    if (!nuevoArea.nombre_area.trim()) {
      setMensajeArea("El nombre del área es obligatorio");
      return;
    }

    setGuardandoArea(true);
    setMensajeArea("");

    try {
      const res = await fetch("http://localhost:3001/api/areaNuevo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoArea),
      });

      const data = await res.json();
      if (data.success) {
        setMensajeArea("Área creada correctamente");
        setAreas([
          ...areas,
          {
            id_area: data.id_area,
            nombre_area: nuevoArea.nombre_area,
            descripcion_area: nuevoArea.descripcion || "",
          },
        ]);
        setTimeout(() => cerrarModalCrear(), 1000);
      } else {
        setMensajeArea(data.message || "Error al crear área");
      }
    } catch (err) {
      console.error(err);
      setMensajeArea("Error al guardar el área");
    } finally {
      setGuardandoArea(false);
    }
  };

  const cerrarModalUsuarios = () => {
    setMostrandoModalUsuarios(false);
    setAreaSeleccionada(null);
    setUsuarios([]);
  };

  const cerrarModalCrear = () => {
    setMostrandoModalCrear(false);
    setNuevoArea({ nombre_area: "", descripcion: "" });
    setMensajeArea("");
  };

  if (cargando) return <p>Cargando áreas...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Lista de Áreas</h2>
      <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Acciones</th>
            <th>
              <button onClick={() => setMostrandoModalCrear(true)}>+</button>
            </th>
          </tr>
        </thead>
        <tbody>
          {areas.map((area) => (
            <tr key={area.id_area}>
              <td>{area.id_area}</td>
              <td>{area.nombre_area}</td>
              <td>{area.descripcion_area}</td>
              <td>
                <button onClick={() => eliminarArea(area.id_area)}>Eliminar</button>
                <button onClick={() => verUsuarios(area)}>Usuarios asignados</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* --- Modal Usuarios Asignados --- */}
      {mostrandoModalUsuarios && (
        <div style={estiloFondoModal}>
          <div style={estiloModal}>
            <h3>Usuarios con el área: {areaSeleccionada?.nombre_area}</h3>
            {cargandoUsuarios ? (
              <p>Cargando usuarios...</p>
            ) : usuarios.length > 0 ? (
              <ul>
                {usuarios.map((u) => (
                  <li key={u.id_usuario}>{u.nombre_usuario || "(Sin nombre registrado)"}</li>
                ))}
              </ul>
            ) : (
              <p>No hay usuarios asignados a esta área.</p>
            )}
            <div style={{ marginTop: "15px", textAlign: "right" }}>
              <button onClick={cerrarModalUsuarios}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* --- Modal Crear Área --- */}
      {mostrandoModalCrear && (
        <div style={estiloFondoModal}>
          <div style={estiloModal}>
            <h3>Crear nueva área</h3>
            <form onSubmit={guardarArea}>
              <div style={{ marginBottom: "10px" }}>
                <label>Nombre del área:</label><br />
                <input
                  type="text"
                  value={nuevoArea.nombre_area}
                  onChange={(e) => setNuevoArea({ ...nuevoArea, nombre_area: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: "10px" }}>
                <label>Descripción:</label><br />
                <textarea
                  value={nuevoArea.descripcion}
                  onChange={(e) => setNuevoArea({ ...nuevoArea, descripcion: e.target.value })}
                  rows="3"
                />
              </div>

              {mensajeArea && <p>{mensajeArea}</p>}

              <div style={{ textAlign: "right" }}>
                <button type="button" onClick={cerrarModalCrear} disabled={guardandoArea}>
                  Cancelar
                </button>{" "}
                <button type="submit" disabled={guardandoArea}>
                  {guardandoArea ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const estiloFondoModal = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const estiloModal = {
  background: "#fff",
  padding: "20px",
  borderRadius: "10px",
  width: "400px",
  maxHeight: "80vh",
  overflowY: "auto",
};

export default Areas;
