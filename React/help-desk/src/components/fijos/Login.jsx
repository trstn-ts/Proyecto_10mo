import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ setAutenticado }) {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const respuesta = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, password }),
      });

      const datos = await respuesta.json();

      if (datos.success) {        
        localStorage.setItem("token", datos.token);
        localStorage.setItem("usuario", JSON.stringify({
          id_usuario: datos.user.id_usuario,
          nombre: datos.user.nombre,
          apellido: datos.user.apellido,
          id_rol: datos.user.id_rol
        }));
        localStorage.setItem("autenticado", "true");
        
        setAutenticado(true);

        navigate("/inicio");
      } else {
        setError(datos.message);
      }
    } catch (err) {
      setError("Error al conectar con el servidor: " + err.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={manejarSubmit}>
        <input
          type="text"
          placeholder="Usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Entrar</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default Login;
