const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");

// Importaciones del controlador de Proveedores
const {
  getVerificarConexionBD,
  getProveedores,
  getProveedorById,
  getCategoriasProveedor,
  getSugerenciasProveedores,
  getOpcionesProveedor,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
} = require("./controllers/controllerProveedores.js");

// Importaciones del controlador de Clientes
const {
  getClientes,
  getClienteById,
  getOpcionesCliente,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
} = require("./controllers/controllerClientes.js");

// Importaciones del controlador de Inventario
const {
  getProductos,
  getProductoById,
  getGruposProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  getSugerenciasProductos,
  getSubcategoriasProducto,
} = require("./controllers/controllerInventario.js");

// Importaciones del controlador de Reportes
const {
  getReporte2,
  getReporte1,
  getReporte4,
  getReporte5,
  getReporte3,
  getReporte6,
  getReporte7,
  getReporte8,
  getReporte9,
  getReporte10,
  getOpcionesReportes,
  getAniosReportes,
} = require("./controllers/controllerReportes.js");

// Importaciones del controlador de Ventas
const {
  getVentas,
  getVentaById,
  getOpcionesVenta,
  crearVenta,
  crearLineaVenta,
  actualizarVenta,
  actualizarLineaVenta,
} = require("./controllers/controllerVentas.js");

const app = express();
app.use(cors());
app.use(express.json());
const port = Number(process.env.PORT) || 3000;

// ==========================================
// RUTAS DE PROVEEDORES
// ==========================================
app.get("/api/verificar-conexion", getVerificarConexionBD);
app.get("/api/proveedores", getProveedores);
app.get("/api/proveedores/sugerencias", getSugerenciasProveedores);
app.get("/api/proveedores/opciones", getOpcionesProveedor);
app.get("/api/proveedores/:id", getProveedorById);
app.get("/api/categorias-proveedores", getCategoriasProveedor);

app.post("/api/proveedores", crearProveedor);
app.put("/api/proveedores/:id", actualizarProveedor);
app.delete("/api/proveedores/:id", eliminarProveedor);

// ==========================================
// RUTAS DE CLIENTES
// ==========================================
app.get("/api/clientes", getClientes);
app.get("/api/opciones-clientes", getOpcionesCliente);
app.get("/api/clientes/:id", getClienteById);

app.post("/api/clientes", crearCliente);
app.put("/api/clientes/:id", actualizarCliente);
app.delete("/api/clientes/:id", eliminarCliente);

// ==========================================
// RUTAS DE VENTAS
// ==========================================
app.get("/api/ventas", getVentas);
app.get("/api/ventas/opciones", getOpcionesVenta);
app.get("/api/ventas/:id", getVentaById);
app.post("/api/ventas", crearVenta);
app.put("/api/ventas/:id", actualizarVenta);
app.post("/api/ventas/:id/lineas", crearLineaVenta);
app.put("/api/ventas/:id/lineas/:lineId", actualizarLineaVenta);

// ==========================================
// RUTAS DE INVENTARIO
// ==========================================
app.get("/api/inventario/grupos", getGruposProducto);
app.get("/api/inventario", getProductos);
app.get("/api/inventario/sugerencias", getSugerenciasProductos);
app.get("/api/inventario/subcategorias", getSubcategoriasProducto);
app.get("/api/inventario/:id", getProductoById);

app.post("/api/inventario", crearProducto);
app.put("/api/inventario/:id", actualizarProducto);
app.delete("/api/inventario/:id", eliminarProducto);

// ==========================================
// RUTAS DE REPORTES
// ==========================================
app.get("/api/reportes/1", getReporte1);
app.get("/api/reportes/2", getReporte2);
app.get("/api/reportes/3", getReporte3);
app.get("/api/reportes/4", getReporte4);
app.get("/api/reportes/5", getReporte5);
app.get("/api/reportes/6", getReporte6);
app.get("/api/reportes/7", getReporte7);
app.get("/api/reportes/8", getReporte8);
app.get("/api/reportes/9", getReporte9);
app.get("/api/reportes/10", getReporte10);
app.get("/api/reportes/opciones", getOpcionesReportes);
app.get("/api/reportes/opciones/anios", getAniosReportes);

app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});
