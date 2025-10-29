const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
const port = 3001;
app.use(cors());
app.use(express.json());

const dbConfig = {
    /**
     Supongo que tendremos que cambiar esto para no darle los permisos de admistrador
     Como borrar o crear tablas, para desarrollar y probar las conexiones usamos por ahora el sa
     Si tienes problemas recuerda instalar express, mssql y cors con npm "npm install express mssql cors"
     Y otra cosa, puede que tengas que habilitar el puerto 1433 en el firewall de windows y en las 
     configuraciones de SQL Server, si tienes problemas con eso me avisas.

     Si realizas alguna modificacion al archivo vuelve a cargarlo en el cmd
     */
    user: 'sa', 
    password: 'root',
    server: 'DESKTOP-QR0LR16',
    database: 'HelpDesk_DB',
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

let poolPromise = sql.connect(dbConfig)
  .then(pool => {
    console.log('Conexión a SQL Server establecida correctamente.');
    return pool;
  })
  .catch(err => {
    console.error('Error al conectar a SQL Server:', err);
  });

// --- Endpoints ---
// Login
app.post("/api/login", async (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({ success: false, message: "Faltan datos" });
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("usuario", sql.VarChar, usuario)
      .input("password", sql.VarChar, password)
      .query("SELECT * FROM tbl_usuarios WHERE usuario = @usuario AND password = @password");

    if (result.recordset.length > 0) {
      res.json({ success: true, message: "Login exitoso", user: result.recordset[0] });
    } else {
      res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
    }
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

// Todos los Usuarios sin filtros
app.get('/api/usuarios', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`SELECT U.id_usuario, CONCAT (U.nombre, ' ', U.apellido) AS nombre_usuario, U.correo, U.telefono, R.nombre_rol, A.nombre_area FROM tbl_usuarios AS U JOIN tbl_roles AS R ON U.id_rol = R.id_rol LEFT JOIN tbl_areas AS A ON U.id_area = A.id_area;`);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener datos de la base de datos');
  }
});

// Todos los Tickets sin filtros
app.get('/api/tickets', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`SELECT T.id_ticket, T.titulo, T.prioridad, T.estado, T.fecha_creacion, T.fecha_cierre, CONCAT(U.nombre, ' ', U.apellido) AS nombre_usuario, CONCAT(TE.nombre, ' ', TE.apellido) AS nombre_tecnico FROM tbl_tickets T INNER JOIN tbl_usuarios U ON T.id_usuario = U.id_usuario LEFT JOIN tbl_usuarios TE ON T.id_tecnico = TE.id_usuario;`);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener datos de la base de datos');
  }
});

// Todos los Tickets sin filtros
app.get('/api/ticketsSinAsignar', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`SELECT T.id_ticket, T.titulo, T.prioridad, T.estado, T.fecha_creacion, T.fecha_cierre, CONCAT(U.nombre, ' ', U.apellido) AS nombre_usuario,  CONCAT(TE.nombre, ' ', TE.apellido) AS nombre_tecnico FROM tbl_tickets T INNER JOIN tbl_usuarios U ON T.id_usuario = U.id_usuario LEFT JOIN tbl_usuarios TE ON T.id_tecnico = TE.id_usuario WHERE T.id_tecnico IS NULL AND T.prioridad IS NULL AND T.estado = 'En proceso';`);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener datos de la base de datos');
  }
});

app.listen(port, () => {
    console.log(`API corriendo en http://localhost:${port}`);
});