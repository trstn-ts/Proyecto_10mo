import React, { useState, useEffect } from "react";

function Roles() {
  const [roles, setRoles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [usuarios, setUsuarios] = useState([]);
  const [rolSeleccionado, setRolSeleccionado] = useState(null);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);
  const [mostrandoModalUsuarios, setMostrandoModalUsuarios] = useState(false);

  const [mostrandoModalCrear, setMostrandoModalCrear] = useState(false);
  const [nuevoRol, setNuevoRol] = useState({ nombre_rol: "", descripcion: "" });
  const [guardandoRol, setGuardandoRol] = useState(false);
  const [mensajeRol, setMensajeRol] = useState("");
  
  useEffect(() => {
    const obtenerRoles = async () => {
      try {
        const respuesta = await fetch("http://localhost:3001/api/roles");
        if (!respuesta.ok) throw new Error("Error al obtener roles");
        const datos = await respuesta.json();
        setRoles(datos);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };
    obtenerRoles();
  }, []);
  
  const verUsuarios = async (rol) => {
    setRolSeleccionado(rol);
    setMostrandoModalUsuarios(true);
    setCargandoUsuarios(true);
    try {
      const res = await fetch(`http://localhost:3001/api/rolesUsuarios?id_rol=${rol.id_rol}`);
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

  const eliminarRol = async (id_rol) => {
  if (!window.confirm("¿Estás seguro de que deseas eliminar este rol?")) return;

  try {
    const respuesta = await fetch(`http://localhost:3001/api/roles/${id_rol}`, {
      method: "DELETE",
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      alert(data.message || "Error al eliminar el rol");
      return;
    }

    alert(data.message);    
    setRoles(roles.filter((rol) => rol.id_rol !== id_rol));
    } catch (err) {
        console.error("Error al eliminar rol:", err);
        alert("Ocurrió un error al intentar eliminar el rol");
    }
    };
  
  const guardarRol = async (e) => {
    e.preventDefault();
    if (!nuevoRol.nombre_rol.trim()) {
      setMensajeRol("El nombre del rol es obligatorio");
      return;
    }

    setGuardandoRol(true);
    setMensajeRol("");

    try {
      const res = await fetch("http://localhost:3001/api/rolesNuevo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoRol),
      });

      const data = await res.json();
      if (data.success) {
        setMensajeRol("Rol creado correctamente");
        setRoles([...roles, { ...nuevoRol, id_rol: roles.length + 1 }]);
        setTimeout(() => {
          cerrarModalCrear();
        }, 1000);
      } else {
        setMensajeRol(data.message || "Error al crear rol");
      }
    } catch (err) {
      console.error(err);
      setMensajeRol("Error al guardar el rol");
    } finally {
      setGuardandoRol(false);
    }
  };

  const cerrarModalUsuarios = () => {
    setMostrandoModalUsuarios(false);
    setRolSeleccionado(null);
    setUsuarios([]);
  };

  const cerrarModalCrear = () => {
    setMostrandoModalCrear(false);
    setNuevoRol({ nombre_rol: "", descripcion: "" });
    setMensajeRol("");
  };

  if (cargando) return <p>Cargando roles...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Lista de Roles</h2>
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
          {roles.map((rol) => (
            <tr key={rol.id_rol}>
              <td>{rol.id_rol}</td>
              <td>{rol.nombre_rol}</td>
              <td>{rol.descripcion}</td>
              <td>
                <button onClick={() => eliminarRol(rol.id_rol)}>Eliminar</button>
                <button onClick={() => verUsuarios(rol)}>Usuarios asignados</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* --- Modal Usuarios Asignados --- */}
      {mostrandoModalUsuarios && (
        <div style={estiloFondoModal}>
          <div style={estiloModal}>
            <h3>Usuarios con el rol: {rolSeleccionado?.nombre_rol}</h3>
            {cargandoUsuarios ? (
              <p>Cargando usuarios...</p>
            ) : usuarios.length > 0 ? (
              <ul>
                {usuarios.map((u) => (
                  <li key={u.id_usuario}>{u.nombre_usuario || "(Sin nombre registrado)"}</li>
                ))}
              </ul>
            ) : (
              <p>No hay usuarios asignados a este rol.</p>
            )}
            <div style={{ marginTop: "15px", textAlign: "right" }}>
              <button onClick={cerrarModalUsuarios}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* --- Modal Crear Rol --- */}
      {mostrandoModalCrear && (
        <div style={estiloFondoModal}>
          <div style={estiloModal}>
            <h3>Crear nuevo rol</h3>
            <form onSubmit={guardarRol}>
              <div style={{ marginBottom: "10px" }}>
                <label>Nombre del rol:</label><br />
                <input
                  type="text"
                  value={nuevoRol.nombre_rol}
                  onChange={(e) => setNuevoRol({ ...nuevoRol, nombre_rol: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: "10px" }}>
                <label>Descripción:</label><br />
                <textarea
                  value={nuevoRol.descripcion}
                  onChange={(e) => setNuevoRol({ ...nuevoRol, descripcion: e.target.value })}
                  rows="3"
                />
              </div>

              {mensajeRol && <p>{mensajeRol}</p>}

              <div style={{ textAlign: "right" }}>
                <button type="button" onClick={cerrarModalCrear} disabled={guardandoRol}>
                  Cancelar
                </button>{" "}
                <button type="submit" disabled={guardandoRol}>
                  {guardandoRol ? "Guardando..." : "Guardar"}
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

export default Roles;
