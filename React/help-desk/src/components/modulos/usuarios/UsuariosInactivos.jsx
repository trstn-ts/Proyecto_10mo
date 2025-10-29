import React, { useState, useEffect } from "react";

function UsuariosInactivos() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const obtenerUsuarios = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/usuariosInactivos");
      if (!res.ok) throw new Error("Error al obtener usuarios");
      const datos = await res.json();
      setUsuarios(datos);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const activarUsuario = async (id_usuario) => {
    if (!window.confirm("¿Seguro?")) return;

    try {
      const res = await fetch(`http://localhost:3001/api/usuariosActivar/${id_usuario}`, {
        method: "PUT",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || "Error al activar usuario");
        return;
      }

      alert("Usuario activado correctamente");      
      setUsuarios(usuarios.filter(u => u.id_usuario !== id_usuario));

    } catch (err) {
      console.error("Error al activar usuario:", err);
      alert("Error al activar usuario");
    }
  };

  if (cargando) return <p>Cargando usuarios...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Lista de Usuarios Inactivos</h2>
      <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Teléfono</th>
            <th>Rol</th>
            <th>Área</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id_usuario}>
              <td>{usuario.id_usuario}</td>
              <td>{usuario.nombre_usuario}</td>
              <td>{usuario.correo}</td>
              <td>{usuario.telefono}</td>
              <td>{usuario.nombre_rol}</td>
              <td>{usuario.nombre_area}</td>
              <td>
                <button onClick={() => activarUsuario(usuario.id_usuario)}>Activar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UsuariosInactivos;
