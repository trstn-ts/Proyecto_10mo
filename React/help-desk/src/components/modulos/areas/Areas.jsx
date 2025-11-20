import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../usuarios/Usuarios.css"; 

function Areas() {
  const [areas, setAreas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [usuarios, setUsuarios] = useState([]);
  const [areaSeleccionada, setAreaSeleccionada] = useState(null);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);
  const [mostrandoModalUsuarios, setMostrandoModalUsuarios] = useState(false);

  const [mostrandoModalCrear, setMostrandoModalCrear] = useState(false);
  const [nuevoArea, setNuevoArea] = useState({
    nombre_area: "",
    descripcion: "",
  });
  const [guardandoArea, setGuardandoArea] = useState(false);
  const [mensajeArea, setMensajeArea] = useState("");

  useEffect(() => {
    const obtenerAreas = async () => {
      try {
        const res = await fetch("http://localhost:3001/web/areas");
        if (!res.ok) throw new Error("Error al obtener áreas");
        const datos = await res.json();
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
      const res = await fetch(
        `http://localhost:3001/web/areasUsuarios?id_area=${area.id_area}`
      );
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
    if (!window.confirm("¿Seguro que deseas eliminar esta área?")) return;

    try {
      const res = await fetch(
        `http://localhost:3001/web/areas/${id_area}`,
        { method: "DELETE" }
      );
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Error al eliminar el área");
        return;
      }

      alert(data.message);
      setAreas(areas.filter((a) => a.id_area !== id_area));
    } catch (err) {
      console.error("Error:", err);
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
      const res = await fetch("http://localhost:3001/web/areaNuevo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoArea),
      });

      const data = await res.json();

      if (data.success) {
        alert("Área creada correctamente");
        const resAreas = await fetch("http://localhost:3001/web/areas");
        const nuevasAreas = await resAreas.json();
        setAreas(nuevasAreas);
        cerrarModalCrear();
      } else {
        setMensajeArea(data.message || "Error al crear el área");
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

  if (cargando) return <p className="text-center mt-5">Cargando áreas...</p>;
  if (error) return <p className="text-danger text-center mt-5">{error}</p>;

  return (
    <div className="container mt-4 usuarios-container">

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="text-dark">Lista de Áreas</h2>

        <button
          className="btn btn-primary"
          onClick={() => setMostrandoModalCrear(true)}
        >
          <i className="bi bi-plus-circle"></i> Nueva área
        </button>
      </div>

      <div className="table-responsive shadow-sm rounded">
        <table className="table table-hover align-middle">
          <thead className="table-danger">
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {areas.map((area) => (
              <tr key={area.id_area}>
                <td>{area.id_area}</td>
                <td>{area.nombre_area}</td>
                <td>{area.descripcion_area}</td>

                <td className="text-center">
                  <button
                    className="btn btn-outline-danger btn-sm me-2"
                    onClick={() => eliminarArea(area.id_area)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>

                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => verUsuarios(area)}
                  >
                    <i className="bi bi-people"></i> Usuarios
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Usuarios */}
      {mostrandoModalUsuarios && (
        <div className="custom-modal">
          <div className="custom-modal-content">
            <h4>
              Usuarios asignados al área:{" "}
              <strong>{areaSeleccionada?.nombre_area}</strong>
            </h4>

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
              <p className="text-center mt-3">
                No hay usuarios asignados a esta área.
              </p>
            )}

            <div className="d-flex justify-content-end mt-3">
              <button className="btn btn-secondary" onClick={cerrarModalUsuarios}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear Área */}
      {mostrandoModalCrear && (
        <div className="custom-modal">
          <div className="custom-modal-content">
            <h4>Crear nueva área</h4>

            <form onSubmit={guardarArea}>
              <div className="mb-3">
                <label>Nombre del área</label>
                <input
                  type="text"
                  className="form-control"
                  value={nuevoArea.nombre_area}
                  onChange={(e) =>
                    setNuevoArea({
                      ...nuevoArea,
                      nombre_area: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="mb-3">
                <label>Descripción</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={nuevoArea.descripcion}
                  onChange={(e) =>
                    setNuevoArea({
                      ...nuevoArea,
                      descripcion: e.target.value,
                    })
                  }
                ></textarea>
              </div>

              {mensajeArea && (
                <p className="text-danger">{mensajeArea}</p>
              )}

              <div className="d-flex justify-content-end">
                <button
                  type="button"
                  className="btn btn-secondary me-2"
                  onClick={cerrarModalCrear}
                  disabled={guardandoArea}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={guardandoArea}
                >
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

export default Areas;
