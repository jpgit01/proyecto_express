const express = require("express");
const app = express();
const fs = require("fs").promises; 
const path = require("path");
const cors = require('cors');

app.use(express.json());
app.use(cors());

const FILE_PATH = path.join(__dirname, "repertorio.json");


function validarCampos(req, res, next) {
  const { id, titulo, artista, tono } = req.body;
  if (req.method === "POST" || req.method === "PUT") {
    if (!id || !titulo || !artista || !tono) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }
  }
  next();
}

app.get("/canciones", async (req, res) => {
  try {
    const response = await fs.readFile(FILE_PATH, "utf8");
    const canciones = JSON.parse(response);
    res.status(200).json(canciones);
  } catch (error) {
    console.error("Error al leer el archivo:", error);
    res.status(502).send("Error en el servidor");
  }
});

app.post("/canciones", validarCampos, async (req, res) => {
  try {
    const canciones = JSON.parse(await fs.readFile(FILE_PATH, "utf8"));
    const cancion = req.body;
    canciones.push(cancion);
    await fs.writeFile(FILE_PATH, JSON.stringify(canciones, null, 2));
    res.status(200).json({ message: "Canción agregada con éxito" });
  } catch (error) {
    console.error("Error al agregar la canción:", error);
    res.status(400).json({ error: `No se pudo agregar la canción: ${error.message}` });
  }
});

app.put("/canciones/:id", validarCampos, async (req, res) => {
  try {
    const { id } = req.params;
    const canciones = JSON.parse(await fs.readFile(FILE_PATH, "utf8"));
    const index = canciones.findIndex((cancion) => cancion.id == id);
    if (index !== -1) {
      canciones[index] = req.body;
      await fs.writeFile(FILE_PATH, JSON.stringify(canciones, null, 2));
      res.status(200).json({ message: "Canción actualizada con éxito" });
    } else {
      res.status(404).json({ message: "Canción no encontrada" });
    }
  } catch (error) {
    console.error("Error al actualizar la canción:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

app.delete("/canciones/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let canciones = JSON.parse(await fs.readFile(FILE_PATH, "utf8"));
    const index = canciones.findIndex((cancion) => cancion.id == id);

    if (index !== -1) {
      canciones.splice(index, 1);
      await fs.writeFile(FILE_PATH, JSON.stringify(canciones, null, 2));
      res.status(200).json({ message: "Canción eliminada con éxito" });
    } else {
      res.status(404).json({ message: "Canción no encontrada" });
    }
  } catch (error) {
    console.error("Error al eliminar la canción:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

app.listen(3000, () => {
  console.log("Servidor escuchando en puerto 3000");
});
