import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Usuarios.css";

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [roles, setRoles] = useState([]);
  const [areas, setAreas] = useState([]);

  const [mostrandoModal, setMostrandoModal] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    usuario: "",
    password: "",
    id_rol: "",
    id_area: "",
  });
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

  const [mostrandoModalEditar, setMostrandoModalEditar] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  useEffect(() => {
    const obtenerUsuarios = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/usuarios");
        if (!res.ok) throw new Error("Error al obtener usuarios");
        const datos = await res.json();
        setUsuarios(datos);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };
    obtenerUsuarios();
  }, []);

  useEffect(() => {
    const cargarRoles = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/roles");
        const datos = await res.json();
        setRoles(datos);
      } catch (err) {
        console.error("Error al cargar roles:", err);
      }
    };
    const cargarAreas = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/areas");
        const datos = await res.json();
        setAreas(datos);
      } catch (err) {
        console.error("Error al cargar áreas:", err);
      }
    };
    cargarRoles();
    cargarAreas();
  }, []);

  const abrirModal = () => {
    setNuevoUsuario({
      nombre: "",
      apellido: "",
      correo: "",
      telefono: "",
      usuario: "",
      password: "",
      id_rol: "",
      id_area: "",
    });
    setMensaje("");
    setMostrandoModal(true);
  };

  const abrirModalEditar = (usuario) => {
    setUsuarioSeleccionado({
      ...usuario,
      password: "",
    });
    setMensaje("");
    setMostrandoModalEditar(true);
  };

  const cerrarModal = () => setMostrandoModal(false);
  const cerrarModalEditar = () => {
    setMostrandoModalEditar(false);
    setUsuarioSeleccionado(null);
  };

  const guardarUsuario = async (e) => {
    e.preventDefault();
    const { nombre, apellido, correo, usuario, password, id_rol } = nuevoUsuario;

    if (!nombre || !apellido || !correo || !usuario || !password || !id_rol) {
      setMensaje("Faltan campos obligatorios");
      return;
    }

    setGuardando(true);
    setMensaje("");

    try {
      const res = await fetch("http://localhost:3001/api/usuariosNuevo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoUsuario),
      });
      const data = await res.json();

      if (data.success) {
        alert("Usuario creado correctamente");
        const resUsuarios = await fetch("http://localhost:3001/api/usuarios");
        const usuariosActualizados = await resUsuarios.json();
        setUsuarios(usuariosActualizados);
        cerrarModal();
      } else {
        setMensaje(data.message || "Error al crear usuario");
      }
    } catch (err) {
      console.error(err);
      setMensaje("Error al crear usuario");
    } finally {
      setGuardando(false);
    }
  };

  const guardarEdicion = async (e) => {
    e.preventDefault();
    const { id_usuario, nombre, apellido, correo, telefono, usuario, password, id_rol, id_area } =
      usuarioSeleccionado;

    if (!nombre || !apellido || !correo || !usuario || !id_rol) {
      setMensaje("Faltan campos obligatorios");
      return;
    }

    try {
      const res = await fetch(`http://localhost:3001/api/usuariosActualizar/${id_usuario}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, apellido, correo, telefono, usuario, password, id_rol, id_area }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMensaje(data.message || "Error al actualizar usuario");
        return;
      }

      alert(data.message);
      const resUsuarios = await fetch("http://localhost:3001/api/usuarios");
      const usuariosActualizados = await resUsuarios.json();
      setUsuarios(usuariosActualizados);
      cerrarModalEditar();
    } catch (err) {
      console.error(err);
      setMensaje("Error al actualizar usuario");
    }
  };

  const eliminarUsuario = async (id_usuario) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;

    try {
      const res = await fetch(`http://localhost:3001/api/usuarios/${id_usuario}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Error al eliminar el usuario");
        return;
      }

      alert(data.message);
      setUsuarios(usuarios.filter((u) => u.id_usuario !== id_usuario));
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      alert("Ocurrió un error al eliminar el usuario");
    }
  };

  if (cargando) return <p className="text-center mt-5">Cargando usuarios...</p>;
  if (error) return <p className="text-danger text-center mt-5">{error}</p>;

  return (
    <div className="container mt-4 usuarios-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="text-dark">Lista de Usuarios</h2>
        <button className="btn btn-danger" onClick={abrirModal}>
          <i className="bi bi-person-plus"></i> Nuevo Usuario
        </button>
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
                    className="btn btn-outline-danger btn-sm me-2"
                    onClick={() => eliminarUsuario(usuario.id_usuario)}
                  >
                    <i className="bi bi-trash3"></i>
                  </button>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => abrirModalEditar(usuario)}
                  >
                    <i className="bi bi-pencil-square"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Crear */}
      {mostrandoModal && (
        <div className="custom-modal">
          <div className="custom-modal-content">
            <h4>Crear Nuevo Usuario</h4>
            <form onSubmit={guardarUsuario} className="form-grid">
              <input className="form-control" placeholder="Nombre" value={nuevoUsuario.nombre}
                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })} />
              <input className="form-control" placeholder="Apellido" value={nuevoUsuario.apellido}
                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, apellido: e.target.value })} />
              <input className="form-control" placeholder="Correo" value={nuevoUsuario.correo}
                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, correo: e.target.value })} />
              <input className="form-control" placeholder="Teléfono" value={nuevoUsuario.telefono}
                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, telefono: e.target.value })} />
              <input className="form-control" placeholder="Usuario" value={nuevoUsuario.usuario}
                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, usuario: e.target.value })} />
              <input className="form-control" type="password" placeholder="Contraseña" value={nuevoUsuario.password}
                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })} />

              <select className="form-select" value={nuevoUsuario.id_rol}
                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, id_rol: e.target.value })}>
                <option value="">Selecciona rol</option>
                {roles.map((r) => (
                  <option key={r.id_rol} value={r.id_rol}>
                    {r.nombre_rol}
                  </option>
                ))}
              </select>

              <select className="form-select" value={nuevoUsuario.id_area}
                onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, id_area: e.target.value })}>
                <option value="">Selecciona área</option>
                {areas.map((a) => (
                  <option key={a.id_area} value={a.id_area}>
                    {a.nombre_area}
                  </option>
                ))}
              </select>

              {mensaje && <p className="text-danger text-center">{mensaje}</p>}

              <div className="d-flex justify-content-end mt-2">
                <button type="button" className="btn btn-secondary me-2" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-danger" disabled={guardando}>
                  {guardando ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {mostrandoModalEditar && usuarioSeleccionado && (
        <div className="custom-modal">
          <div className="custom-modal-content">
            <h4>Editar Usuario</h4>
            <form onSubmit={guardarEdicion} className="form-grid">
              <input className="form-control" placeholder="Nombre"
                value={usuarioSeleccionado.nombre}
                onChange={(e) => setUsuarioSeleccionado({ ...usuarioSeleccionado, nombre: e.target.value })} />
              <input className="form-control" placeholder="Apellido"
                value={usuarioSeleccionado.apellido}
                onChange={(e) => setUsuarioSeleccionado({ ...usuarioSeleccionado, apellido: e.target.value })} />
              <input className="form-control" placeholder="Correo"
                value={usuarioSeleccionado.correo}
                onChange={(e) => setUsuarioSeleccionado({ ...usuarioSeleccionado, correo: e.target.value })} />
              <input className="form-control" placeholder="Teléfono"
                value={usuarioSeleccionado.telefono}
                onChange={(e) => setUsuarioSeleccionado({ ...usuarioSeleccionado, telefono: e.target.value })} />
              <input className="form-control" placeholder="Usuario"
                value={usuarioSeleccionado.usuario}
                onChange={(e) => setUsuarioSeleccionado({ ...usuarioSeleccionado, usuario: e.target.value })} />
              <input className="form-control" type="password" placeholder="Contraseña"
                value={usuarioSeleccionado.password}
                onChange={(e) => setUsuarioSeleccionado({ ...usuarioSeleccionado, password: e.target.value })} />

              <select className="form-select" value={usuarioSeleccionado.id_rol}
                onChange={(e) => setUsuarioSeleccionado({ ...usuarioSeleccionado, id_rol: e.target.value })}>
                <option value="">Selecciona rol</option>
                {roles.map((r) => (
                  <option key={r.id_rol} value={r.id_rol}>
                    {r.nombre_rol}
                  </option>
                ))}
              </select>

              <select className="form-select" value={usuarioSeleccionado.id_area}
                onChange={(e) => setUsuarioSeleccionado({ ...usuarioSeleccionado, id_area: e.target.value })}>
                <option value="">Selecciona área</option>
                {areas.map((a) => (
                  <option key={a.id_area} value={a.id_area}>
                    {a.nombre_area}
                  </option>
                ))}
              </select>

              {mensaje && <p className="text-danger text-center">{mensaje}</p>}

              <div className="d-flex justify-content-end mt-2">
                <button type="submit" className="btn btn-danger me-2">Guardar</button>
                <button type="button" className="btn btn-secondary" onClick={cerrarModalEditar}>Cerrar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Usuarios;

