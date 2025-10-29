import React, { useState, useEffect } from "react";

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const obtenerUsuarios = async () => {
      try {
        const respuesta = await fetch("http://localhost:3001/api/usuarios");
        if (!respuesta.ok) {
          throw new Error("Error al obtener usuarios");
        }
        const datos = await respuesta.json();
        setUsuarios(datos);
        setCargando(false);
      } catch (err) {
        setError(err.message);
        setCargando(false);
      }
    };

    obtenerUsuarios();
  }, []);

  if (cargando) return <p>Cargando usuarios...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Lista de Usuarios</h2>
      <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Teléfono</th>            
            <th>Rol</th>
            <th>Area</th>
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
// soknvownvlanbna
export default Usuarios;
