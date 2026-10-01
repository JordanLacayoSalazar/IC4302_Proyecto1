require("dotenv").config();
const express = require("express");
const cors = require("cors");

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
