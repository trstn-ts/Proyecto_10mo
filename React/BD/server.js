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
      .query(`SELECT * FROM tbl_usuarios WHERE usuario = @usuario AND password = @password AND id_rol = 1 AND activo = 1;`);
      // Es importante que en la base de datos en la tbl_roles el primer rol sea el de administrador (id_rol = 1)
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


// ---- Usuarios ----
// Todos los Usuarios (activos)
app.get('/api/usuarios', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`SELECT U.id_usuario, U.nombre, U.apellido, CONCAT(U.nombre, ' ', U.apellido) AS nombre_usuario, U.correo, U.telefono, U.usuario, U.id_rol, U.id_area, R.nombre_rol, A.nombre_area FROM tbl_usuarios AS U JOIN tbl_roles AS R ON U.id_rol = R.id_rol LEFT JOIN tbl_areas AS A ON U.id_area = A.id_area WHERE U.activo = 1;`);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener datos de la base de datos');
  }
});

// Todos los Usuarios (inactivos)
app.get('/api/usuariosInactivos', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`SELECT U.id_usuario, CONCAT (U.nombre, ' ', U.apellido) AS nombre_usuario, U.correo, U.telefono, R.nombre_rol, A.nombre_area FROM tbl_usuarios AS U JOIN tbl_roles AS R ON U.id_rol = R.id_rol LEFT JOIN tbl_areas AS A ON U.id_area = A.id_area WHERE U.activo = 0;`);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener datos de la base de datos');
  }
});

// Todos los Usuarios (activos e inactivos)
app.get('/api/usuariosTodos', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`SELECT U.id_usuario, CONCAT (U.nombre, ' ', U.apellido) AS nombre_usuario, U.correo, U.telefono, R.nombre_rol, A.nombre_area FROM tbl_usuarios AS U JOIN tbl_roles AS R ON U.id_rol = R.id_rol LEFT JOIN tbl_areas AS A ON U.id_area = A.id_area;`);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener datos de la base de datos');
  }
});

// Tecnicos para asignar tickets
app.get("/api/tecnicos", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query(`SELECT U.id_usuario, CONCAT (U.nombre, ' ', U.apellido) AS nombre_usuario, R.nombre_rol FROM tbl_usuarios AS U JOIN tbl_roles AS R ON U.id_rol = R.id_rol LEFT JOIN tbl_areas AS A ON U.id_area = A.id_area WHERE R.nombre_rol = 'Técnico' AND U.activo = 1;`);

    res.json(result.recordset);
  } catch (err) {
    console.error("Error al obtener técnicos:", err);
    res.status(500).json({ message: "Error al obtener técnicos" });
  }
});

// Nuevo usuario
app.post('/api/usuariosNuevo', async (req, res) => {
  const { nombre, apellido, correo, telefono, usuario, password, id_rol, id_area } = req.body;

  if (!nombre || !apellido || !correo || !usuario || !password || !id_rol) {
    return res.status(400).json({ success: false, message: "Faltan datos obligatorios" });
  }

  try {
    const pool = await poolPromise;

    const ultimo = await pool.request().query(`SELECT ISNULL(MAX(id_usuario), 0) AS ultimoId FROM tbl_usuarios`);
    const nuevoId = ultimo.recordset[0].ultimoId + 1;
    
    await pool.request()
      .input("id_usuario", sql.Int, nuevoId)
      .input("nombre", sql.VarChar(100), nombre)
      .input("apellido", sql.VarChar(100), apellido)
      .input("correo", sql.VarChar(120), correo)
      .input("telefono", sql.VarChar(20), telefono || null)
      .input("usuario", sql.VarChar(120), usuario)
      .input("password", sql.VarChar(255), password) // Por ahora lo ingresa sin cifrado
      .input("id_rol", sql.Int, id_rol)
      .input("id_area", sql.Int, id_area || null)
      .query(`INSERT INTO tbl_usuarios (id_usuario, nombre, apellido, correo, telefono, usuario, password, id_rol, id_area, activo)
              VALUES (@id_usuario, @nombre, @apellido, @correo, @telefono, @usuario, @password, @id_rol, @id_area, 1)`);

    res.status(201).json({ success: true, message: "Usuario creado correctamente", id_usuario: nuevoId });

  } catch (err) {
    console.error("Error al crear usuario:", err);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

// Eliminar usuario (solo cambiamos el activo a 0)
app.delete('/api/usuarios/:id_usuario', async (req, res) => {
  const { id_usuario } = req.params;
  try {
    const pool = await poolPromise;

    const check = await pool.request()
      .input("id_usuario", sql.Int, id_usuario)
      .query(`SELECT * FROM tbl_usuarios WHERE id_usuario = @id_usuario AND activo = 1`);

    if (check.recordset.length === 0) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado o ya inactivo" });
    }
    await pool.request()
      .input("id_usuario", sql.Int, id_usuario)
      .query(`UPDATE tbl_usuarios SET activo = 0 WHERE id_usuario = @id_usuario`);

    res.json({ success: true, message: "Usuario eliminado correctamente" });

  } catch (err) {
    console.error("Error al eliminar usuario:", err);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

// Actualizar usuario
app.put('/api/usuariosActualizar/:id_usuario', async (req, res) => {
  const { id_usuario } = req.params;
  const { nombre, apellido, correo, telefono, usuario, password, id_rol, id_area } = req.body;

  if (!nombre || !apellido || !correo || !usuario || !id_rol) {
    return res.status(400).json({ success: false, message: "Faltan datos obligatorios" });
  }

  try {
    const pool = await poolPromise;
    
    const check = await pool.request()
      .input("id_usuario", sql.Int, id_usuario)
      .query(`SELECT COUNT(*) AS total FROM tbl_usuarios WHERE id_usuario = @id_usuario`);

    if (check.recordset[0].total === 0) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }
    
    let query = `
      UPDATE tbl_usuarios
      SET nombre = @nombre,
          apellido = @apellido,
          correo = @correo,
          telefono = @telefono,
          usuario = @usuario,
          id_rol = @id_rol,
          id_area = @id_area
    `;

    if (password && password.trim() !== "") {
      query += `, password = @password`;
    }

    query += ` WHERE id_usuario = @id_usuario`;

    const request = pool.request()
      .input("id_usuario", sql.Int, id_usuario)
      .input("nombre", sql.VarChar(100), nombre)
      .input("apellido", sql.VarChar(100), apellido)
      .input("correo", sql.VarChar(120), correo)
      .input("telefono", sql.VarChar(20), telefono || null)
      .input("usuario", sql.VarChar(120), usuario)
      .input("id_rol", sql.Int, id_rol)
      .input("id_area", sql.Int, id_area || null);

    if (password && password.trim() !== "") {
      request.input("password", sql.VarChar(255), password); 
    }

    await request.query(query);

    res.json({ success: true, message: "Usuario actualizado correctamente" });

  } catch (err) {
    console.error("Error al actualizar usuario:", err);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

// Activar usuario inactivo
app.put('/api/usuariosActivar/:id_usuario', async (req, res) => {
  const { id_usuario } = req.params;

  try {
    const pool = await poolPromise;

    const check = await pool.request()
      .input('id_usuario', sql.Int, id_usuario)
      .query('SELECT COUNT(*) AS total FROM tbl_usuarios WHERE id_usuario = @id_usuario');

    if (check.recordset[0].total === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    await pool.request()
      .input('id_usuario', sql.Int, id_usuario)
      .query('UPDATE tbl_usuarios SET activo = 1 WHERE id_usuario = @id_usuario');

    res.json({ success: true, message: 'Usuario activado correctamente' });
  } catch (err) {
    console.error('Error al activar usuario:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});


// ---- Tickets ----
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

// Tickets sin asignar a tecnico y prioridad
app.get('/api/ticketsSinAsignar', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`SELECT T.id_ticket, T.titulo, T.prioridad, T.estado, T.fecha_creacion, T.fecha_cierre, CONCAT(U.nombre, ' ', U.apellido) AS nombre_usuario,  CONCAT(TE.nombre, ' ', TE.apellido) AS nombre_tecnico, T.descripcion_problema FROM tbl_tickets T INNER JOIN tbl_usuarios U ON T.id_usuario = U.id_usuario LEFT JOIN tbl_usuarios TE ON T.id_tecnico = TE.id_usuario WHERE T.id_tecnico IS NULL AND T.prioridad IS NULL AND T.estado = 'En proceso';`);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener datos de la base de datos');
  }
});

// Para el archivo TicketsSinAsignar.jsx. Asignar ticket a tecnico y prioridad
app.put("/api/asignarTicket", async (req, res) => {
  const { id_ticket, id_tecnico, prioridad } = req.body;

  if (!id_ticket || !id_tecnico || !prioridad) {
    return res.status(400).json({ success: false, message: "Faltan datos requeridos" });
  }

  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("id_ticket", sql.Int, id_ticket)
      .input("id_tecnico", sql.Int, id_tecnico)
      .input("prioridad", sql.VarChar, prioridad)      
      .query(`UPDATE tbl_tickets SET id_tecnico = @id_tecnico, prioridad = @prioridad WHERE id_ticket = @id_ticket`);
    res.json({ success: true, message: "Ticket asignado correctamente" });
  } catch (err) {
    console.error("Error al asignar ticket:", err);
    res.status(500).json({ success: false, message: "Error al asignar ticket" });
  }
});


// ---- Roles ----
// Roles
app.get('/api/roles', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`SELECT * FROM tbl_roles;`);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener datos de la base de datos');
  }
});

// Usuarios por Roles
app.get('/api/rolesUsuarios', async (req, res) => {
  const { id_rol } = req.query;
  if (!id_rol) {
    return res.status(400).json({ success: false, message: "Falta el id del rol" });
  }
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id_rol", sql.Int, id_rol)
      .query(`SELECT R.id_rol, R.nombre_rol, U.id_usuario, CONCAT(U.nombre, ' ', U.apellido) AS nombre_usuario FROM tbl_roles R LEFT JOIN tbl_usuarios U ON R.id_rol = U.id_rol WHERE R.id_rol = @id_rol;`);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error al obtener usuarios por rol:", err);
    res.status(500).send('Error al obtener datos de la base de datos');
  }
});

// Nuevo Rol
app.post('/api/rolesNuevo', async (req, res) => {
  const { nombre_rol, descripcion } = req.body;
  if (!nombre_rol) {
    return res.status(400).json({ success: false, message: "El nombre del rol es obligatorio" });
  }
  try {
    const pool = await poolPromise;    
    const ultimo = await pool.request().query(`SELECT ISNULL(MAX(id_rol), 0) AS ultimoId FROM tbl_roles`);
    const nuevoId = ultimo.recordset[0].ultimoId + 1;

    await pool.request()
      .input("id_rol", sql.Int, nuevoId)
      .input("nombre_rol", sql.VarChar(100), nombre_rol)
      .input("descripcion", sql.VarChar(255), descripcion || "")
      .query(`INSERT INTO tbl_roles (id_rol, nombre_rol, descripcion) VALUES (@id_rol, @nombre_rol, @descripcion);`);
    res.status(201).json({
      success: true,
      message: "Rol creado correctamente",
      id_rol: nuevoId
    });
  } catch (err) {
    console.error("Error al crear rol:", err);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
});

// Eliminar rol
app.delete('/api/roles/:id_rol', async (req, res) => {
  const { id_rol } = req.params;
  try {
    const pool = await poolPromise;    
    const check = await pool.request().input("id_rol", sql.Int, id_rol).query(`SELECT COUNT(*) AS total FROM tbl_usuarios WHERE id_rol = @id_rol`);
    const total = check.recordset[0].total;
    if (total > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar el rol porque hay ${total} usuario(s) asignado(s) a él.`,
      });
    }
    await pool.request()
      .input("id_rol", sql.Int, id_rol)
      .query(`DELETE FROM tbl_roles WHERE id_rol = @id_rol`);

    res.json({
      success: true,
      message: "Rol eliminado correctamente",
    });

  } catch (err) {
    console.error("Error al eliminar rol:", err);
    res.status(500).json({
      success: false,
      message: "Error al eliminar el rol en el servidor",
    });
  }
});


// ---- Areas ----
// Areas
app.get('/api/areas', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`SELECT * FROM tbl_areas;`);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener datos de la base de datos');
  }
});

// Usuarios por Area
app.get('/api/areasUsuarios', async (req, res) => {
  const { id_area } = req.query;
  if (!id_area) {
    return res.status(400).json({ success: false, message: "Falta el id del area" });
  }
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id_area", sql.Int, id_area)
      .query(`SELECT A.id_area, A.nombre_area, U.id_usuario, CONCAT(U.nombre, ' ', U.apellido) AS nombre_usuario FROM tbl_areas A LEFT JOIN tbl_usuarios U ON A.id_area = U.id_area WHERE A.id_area = @id_area;`);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error al obtener usuarios por area:", err);
    res.status(500).send('Error al obtener datos de la base de datos');
  }
});

// Nuevo Area
app.post('/api/areaNuevo', async (req, res) => {
  const { nombre_area, descripcion } = req.body;
  if (!nombre_area) {
    return res.status(400).json({ success: false, message: "El nombre del area es obligatorio" });
  }
  try {
    const pool = await poolPromise;
    const ultimo = await pool.request().query(`SELECT ISNULL(MAX(id_area), 0) AS ultimoId FROM tbl_areas`);
    const nuevoId = ultimo.recordset[0].ultimoId + 1;

    await pool.request()
      .input("id_area", sql.Int, nuevoId)
      .input("nombre_area", sql.VarChar(100), nombre_area)
      .input("descripcion", sql.VarChar(255), descripcion || "")
      .query(`INSERT INTO tbl_areas (id_area, nombre_area, descripcion_area) VALUES (@id_area, @nombre_area, @descripcion);`);
    res.status(201).json({
      success: true,
      message: "Area creada correctamente",
      id_area: nuevoId
    });
  } catch (err) {
    console.error("Error al crear area:", err);
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
});

// Eliminar area
app.delete('/api/areas/:id_area', async (req, res) => {
  const { id_area } = req.params;
  try {
    const pool = await poolPromise;
    const check = await pool.request().input("id_area", sql.Int, id_area).query(`SELECT COUNT(*) AS total FROM tbl_usuarios WHERE id_area = @id_area`);
    const total = check.recordset[0].total;
    if (total > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar el area porque hay ${total} usuario(s) asignado(s) a él.`,
      });
    }
    await pool.request()
      .input("id_area", sql.Int, id_area)
      .query(`DELETE FROM tbl_areas WHERE id_area = @id_area`);

    res.json({
      success: true,
      message: "Area eliminada correctamente",
    });

  } catch (err) {
    console.error("Error al eliminar area:", err);
    res.status(500).json({
      success: false,
      message: "Error al eliminar el area en el servidor",
    });
  }
});

app.listen(port, () => {
    console.log(`API corriendo en http://localhost:${port}`);
});