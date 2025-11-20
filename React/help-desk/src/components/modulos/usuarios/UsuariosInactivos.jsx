import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Usuarios.css"; // reutiliza el mismo CSS

function UsuariosInactivos() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const obtenerUsuarios = async () => {
    try {
      const res = await fetch("http://localhost:3001/web/usuariosInactivos");
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
    if (!window.confirm("¿Seguro que deseas activar este usuario?")) return;

    try {
      const res = await fetch(
        `http://localhost:3001/web/usuariosActivar/${id_usuario}`,
        { method: "PUT" }
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || "Error al activar usuario");
        return;
      }

      alert("Usuario activado correctamente");
      setUsuarios(usuarios.filter((u) => u.id_usuario !== id_usuario));
    } catch (err) {
      console.error("Error al activar usuario:", err);
      alert("Error al activar usuario");
    }
  };

  if (cargando) return <p className="text-center mt-5">Cargando usuarios...</p>;
  if (error) return <p className="text-danger text-center mt-5">{error}</p>;

  return (
    <div className="container mt-4 usuarios-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="text-dark">Usuarios Inactivos</h2>
      </div>

      <div className="table-responsive shadow-sm rounded">
        <table className="table table-hover align-middle">
          <thead className="table-danger">
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
                  <button
                    className="btn btn-outline-success btn-sm"
                    onClick={() => activarUsuario(usuario.id_usuario)}
                  >
                    <i className="bi bi-check-circle"></i> Activar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UsuariosInactivos;
