const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");

const {
  getVerificarConexionBD,
  getProveedores,
  getProveedorById,
  getCategoriasProveedor,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
} = require("./controllers/controllerProvedores.js");
const {
  getClientes,
  getClienteById,
  getOpcionesCliente,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
} = require("./controllers/controllerClientes.js");

const app = express();
app.use(cors());
app.use(express.json());
const port = Number(process.env.PORT) || 3000;

// Rutas
app.get("/api/verificar-conexion", getVerificarConexionBD);
app.get("/api/proveedores", getProveedores);
app.get("/api/proveedores/:id", getProveedorById);
app.get("/api/categorias-proveedores", getCategoriasProveedor);
app.get("/api/clientes", getClientes);
app.get("/api/opciones-clientes", getOpcionesCliente);
app.get("/api/clientes/:id", getClienteById);

app.post("/api/proveedores", crearProveedor);
app.put("/api/proveedores/:id", actualizarProveedor);
app.delete("/api/proveedores/:id", eliminarProveedor);
app.post("/api/clientes", crearCliente);
app.put("/api/clientes/:id", actualizarCliente);
app.delete("/api/clientes/:id", eliminarCliente);

app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});
