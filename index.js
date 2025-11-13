import express from "express";
import cors from "cors";
import sql from "mssql";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import OpenAI from "openai";

dotenv.config();

const iaClient = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL,
});

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
  connectionTimeout: 30000,
  requestTimeout: 30000,
};


async function clasificarPrioridadIA(descripcion) {
  const RECHAZO_NO_TECNICO = "Entrada inválida";

  try {
    const completion = await iaClient.chat.completions.create({
      model: "deepseek/deepseek-chat-v3.1:free",
      messages: [
        {
          role: "system",
          content: `Tu única función es clasificar la prioridad de una incidencia técnica. 
Si la entrada del usuario es un problema técnico (relacionado con software, hardware, redes o infraestructura), 
responde SOLAMENTE con una de estas tres palabras: Baja, Media o Alta. 
Si la entrada NO es técnica, responde exactamente con: ${RECHAZO_NO_TECNICO}.`,
        },
        {
          role: "user",
          content: `Problema: ${descripcion}`,
        },
      ],
      temperature: 0.0,
      max_tokens: 10,
    });

    let respuesta = completion.choices[0].message.content
  .trim()
  .replace(/[<>\[\]{}|\\/_.,;:!¡¿?'"`*~^%$#@-]/g, '')
  .replace(/\s+/g, '') 
  .toLowerCase(); 

if (respuesta.includes('alta')) respuesta = 'Alta';
else if (respuesta.includes('media')) respuesta = 'Media';
else if (respuesta.includes('baja')) respuesta = 'Baja';
else if (respuesta.includes(RECHAZO_NO_TECNICO.toLowerCase())) respuesta = 'Baja';
else respuesta = 'Baja';

return respuesta;
  } catch (err) {
    console.error("Error al clasificar con IA:", err.message);
    return "Baja"; 
  }
}


app.get("/", (req, res) => {
  res.send("API de Tickets corriendo correctamente");
});


app.post("/api/login", async (req, res) => {
  const { usuario, contrasena } = req.body;

  if (!usuario || !contrasena) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input("usuario", sql.VarChar, usuario)
      .query("SELECT * FROM tbl_usuarios WHERE usuario = @usuario AND activo = 1");

    const user = result.recordset[0];

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado o inactivo" });
    }

    let passwordValido = false;

    if (user.password.startsWith("$2b$") || user.password.startsWith("$2a$")) {
      passwordValido = await bcrypt.compare(contrasena, user.password);
    } else {
      passwordValido = contrasena === user.password;
    }

    if (!passwordValido) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    res.json({
      mensaje: "Login exitoso",
      usuario: {
        id: user.id_usuario,
        nombre: user.nombre,
        apellido: user.apellido,
        usuario: user.usuario,
        correo: user.correo,
        rol: user.id_rol,
        area: user.id_area,
      },
    });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});


app.get("/api/tickets/usuario/:idUsuario", async (req, res) => {
  const { idUsuario } = req.params;

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("idUsuario", sql.Int, idUsuario)
      .query(`
        SELECT 
          id_ticket AS id,
          titulo,
          descripcion_problema AS descripcion,
          estado,
          prioridad,
          fecha_creacion
        FROM tbl_tickets
        WHERE id_usuario = @idUsuario
        ORDER BY fecha_creacion DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error("Error al obtener tickets del usuario:", err);
    res.status(500).json({ error: "Error al obtener tickets" });
  }
});


app.post("/api/tickets", async (req, res) => {
  const { id_usuario, id_area, titulo, descripcion_problema } = req.body;

  if (!id_usuario || !id_area || !titulo || !descripcion_problema) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  try {
    let prioridadIA = await clasificarPrioridadIA(descripcion_problema);
    console.log(`Prioridad sugerida por IA: ${prioridadIA}`);

    const prioridadesValidas = ["Alta", "Media", "Baja"];
    if (!prioridadesValidas.includes(prioridadIA)) {
      prioridadIA = "Baja"; 
    }

    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("id_usuario", sql.Int, id_usuario)
      .input("id_area", sql.Int, id_area)
      .input("titulo", sql.VarChar, titulo)
      .input("descripcion_problema", sql.VarChar, descripcion_problema)
      .input("prioridad", sql.VarChar, prioridadIA)
      .query(`
        INSERT INTO tbl_tickets (id_usuario, id_area, titulo, descripcion_problema, prioridad, estado)
        VALUES (@id_usuario, @id_area, @titulo, @descripcion_problema, @prioridad, 'En proceso')
      `);

    res.json({
      mensaje: "Ticket creado correctamente",
      prioridad_asignada: prioridadIA,
    });
  } catch (err) {
    console.error("Error al crear ticket:", err);
    res.status(500).json({ error: "Error al crear el ticket" });
  }
});



app.get("/test-db", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query("SELECT GETDATE() AS fecha");
    res.json({ conexion: "exitosa", fecha_servidor: result.recordset[0].fecha });
  } catch (err) {
    console.error("Error de conexión:", err);
    res.status(500).json({
      error: "No se pudo conectar a la base de datos",
      detalle: err.message,
    });
  }
});

//
//
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
