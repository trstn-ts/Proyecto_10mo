import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../usuarios/Usuarios.css"; 

function Roles() {
  const [roles, setRoles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [usuarios, setUsuarios] = useState([]);
  const [rolSeleccionado, setRolSeleccionado] = useState(null);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);
  const [mostrandoModalUsuarios, setMostrandoModalUsuarios] = useState(false);

  useEffect(() => {
    const obtenerRoles = async () => {
      try {
        const respuesta = await fetch("http://localhost:3001/web/roles");
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
      const res = await fetch(`http://localhost:3001/web/rolesUsuarios?id_rol=${rol.id_rol}`);
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

  const cerrarModalUsuarios = () => {
    setMostrandoModalUsuarios(false);
    setRolSeleccionado(null);
    setUsuarios([]);
  };

  if (cargando) return <p className="text-center mt-5">Cargando roles...</p>;
  if (error) return <p className="text-danger text-center mt-5">{error}</p>;

  return (
    <div className="container mt-4 usuarios-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="text-dark">Lista de Roles</h2>
      </div>

      <div className="table-responsive shadow-sm rounded">
        <table className="table table-hover align-middle">
          <thead className="table-danger">
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {roles.map((rol) => (
              <tr key={rol.id_rol}>
                <td>{rol.id_rol}</td>
                <td>{rol.nombre_rol}</td>
                <td>{rol.descripcion_rol}</td>
                <td>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => verUsuarios(rol)}
                  >
                    <i className="bi bi-people"></i> Usuarios
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Modal Usuarios Asignados --- */}
      {mostrandoModalUsuarios && (
        <div className="custom-modal">
          <div className="custom-modal-content">
            <h4>Usuarios con el rol: {rolSeleccionado?.nombre_rol}</h4>

            {cargandoUsuarios ? (
              <p className="text-center mt-3">Cargando usuarios...</p>
            ) : usuarios.length > 0 ? (
              <ul>
                {usuarios.map((u) => (
                  <li key={u.id_usuario}>
                    {u.nombre_usuario || "(Sin nombre registrado)"}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center mt-3">No hay usuarios asignados a este rol.</p>
            )}

            <div className="d-flex justify-content-end mt-3">
              <button className="btn btn-secondary" onClick={cerrarModalUsuarios}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Roles;
