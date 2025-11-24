import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css"; 
import logo from "../../assets/logo.png";

function Login({ setAutenticado }) {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {    
    localStorage.removeItem("autenticado");
    localStorage.removeItem("usuario");
    setAutenticado(false);
  }, []);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const respuesta = await fetch("http://localhost:3001/web/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, password }),
      });

      const datos = await respuesta.json();

      if (datos.success) {
        localStorage.setItem("token", datos.token);
        localStorage.setItem(
          "usuario",
          JSON.stringify({
            id_usuario: datos.user.id_usuario,
            nombre: datos.user.nombre,
            apellido: datos.user.apellido,
            id_rol: datos.user.id_rol,
          })
        );
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
    <div className="login-page">
      <div className="login-header"></div>

      <div className="login-content">
      
        <img src={logo} alt="ProTech" className="logo" />


        <div className="login-box">
          <form onSubmit={manejarSubmit}>
            <label>Usuario</label>
            <input
              type="text"
              placeholder="Ingresa tu usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
            />

            <label>Contraseña</label>
            <input
              type="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit">Entrar</button>
          </form>

          {error && <p className="error">{error}</p>}
        </div>
      </div>

      <div className="login-footer"></div>
    </div>
  );
}

export default Login;
