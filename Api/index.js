const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");

if (!process.env.DB_CONFIG || !process.env.PORT) {
  console.error("Falta DB_CONFIG o PORT en Api/.env.");
  process.exit(1);
}

const port = Number(process.env.PORT);

if (port !== 3000) {
  console.error("PORT debe ser 3000.");
  process.exit(1);
}

const {
  getProveedores,
  getProveedorById,
  getCategoriasProveedor,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
} = require("./controllers/controllerProvedores.js");

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.get("/api/proveedores", getProveedores);
app.get("/api/proveedores/:id", getProveedorById);
app.get("/api/categorias-proveedores", getCategoriasProveedor);

app.post("/api/proveedores", crearProveedor);
app.put("/api/proveedores/:id", actualizarProveedor);
app.delete("/api/proveedores/:id", eliminarProveedor);

app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});
