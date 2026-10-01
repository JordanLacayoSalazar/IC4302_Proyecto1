import React, { useState, useEffect } from "react";
import {
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Box,
  Chip,
  IconButton,
  InputAdornment,
  Stack,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import BusinessIcon from "@mui/icons-material/Business";
import CategoryIcon from "@mui/icons-material/Category";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

import ModalDetallesProveedor from "./ModalDetallesProveedor";
import ModalFormularioProveedor from "./ModalFormularioProveedor";

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);

  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");

  const [categorias, setCategorias] = useState([]);
  const [contactos, setContactos] = useState([]);
  const [metodosEntrega, setMetodosEntrega] = useState([]);
  const [ciudades, setCiudades] = useState([]);

  const [modalDetallesAbierto, setModalDetallesAbierto] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);

  const [modalFormAbierto, setModalFormAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  const initialStateFormData = {
    SupplierID: "",
    SupplierName: "",
    SupplierCategoryID: "",
    PrimaryContactPersonID: "",
    AlternateContactPersonID: "",
    DeliveryMethodID: "",
    DeliveryCityID: "",
    SupplierReference: "",
    PhoneNumber: "",
    FaxNumber: "",
    WebsiteURL: "",
    BankAccountName: "",
    BankAccountNumber: "",
    PaymentDays: 30,
    Latitud: null,
    Longitud: null,
  };

  const [formData, setFormData] = useState(initialStateFormData);

  const fetchDatosRelacionales = async () => {
    try {
      const resCategorias = await fetch(
        "http://localhost:3000/api/categorias-proveedores",
      );
      const dataCategorias = await resCategorias.json();
      setCategorias(dataCategorias);

      setContactos([
        { PersonID: 1, FullName: "Juan Pérez" },
        { PersonID: 2, FullName: "Ana Gómez" },
      ]);
      setMetodosEntrega([
        { DeliveryMethodID: 1, DeliveryMethodName: "Air Freight" },
        { DeliveryMethodID: 2, DeliveryMethodName: "Delivery Truck" },
      ]);
      setCiudades([
        { CityID: 1, CityName: "San José" },
        { CityID: 2, CityName: "Alajuela" },
      ]);
    } catch (error) {
      console.error("Error al cargar datos relacionales:", error);
    }
  };

  const fetchProveedores = async () => {
    let url = `http://localhost:3000/api/proveedores?`;
    if (filtroNombre) url += `nombre=${filtroNombre}&`;
    if (filtroCategoria) url += `categoriaId=${filtroCategoria}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      setProveedores(data);
    } catch (error) {
      console.error("Error al cargar proveedores:", error);
      setProveedores([]);
    }
  };

  useEffect(() => {
    fetchProveedores();
    fetchDatosRelacionales();
  }, []);

  const restaurarFiltros = () => {
    setFiltroNombre("");
    setFiltroCategoria("");
    fetch("http://localhost:3000/api/proveedores")
      .then((res) => res.json())
      .then((data) => setProveedores(data))
      .catch((error) => console.error("Error al restaurar:", error));
  };

  const abrirDetalles = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/proveedores/${id}`,
      );
      const data = await response.json();
      setProveedorSeleccionado(data);
      setModalDetallesAbierto(true);
    } catch (error) {
      console.error("Error al obtener detalles:", error);
    }
  };

  const abrirFormularioNuevo = () => {
    setModoEdicion(false);
    setFormData(initialStateFormData);
    setModalFormAbierto(true);
  };

  const abrirFormularioEdicion = (proveedor) => {
    setModoEdicion(true);
    setFormData({
      ...initialStateFormData,
      SupplierID: proveedor.SupplierID,
      SupplierName: proveedor.NombreProveedor,
    });
    setModalFormAbierto(true);
  };

  const manejarCambioFormulario = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const manejarCambioAutocomplete = (nombreCampo, valor) => {
    setFormData({
      ...formData,
      [nombreCampo]: valor,
    });
  };

  const manejarUbicacionCapturada = (lat, lng) => {
    setFormData((prevData) => ({
      ...prevData,
      Latitud: lat,
      Longitud: lng,
    }));
  };

  const guardarProveedor = async () => {
    const url = modoEdicion
      ? `http://localhost:3000/api/proveedores/${formData.SupplierID}`
      : `http://localhost:3000/api/proveedores`;
    const metodo = modoEdicion ? "PUT" : "POST";

    try {
      await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setModalFormAbierto(false);
      fetchProveedores();
    } catch (error) {
      console.error("Error al guardar proveedor:", error);
    }
  };

  const eliminarProveedor = async (id) => {
    if (
      window.confirm("¿Estás seguro de que deseas eliminar este proveedor?")
    ) {
      try {
        await fetch(`http://localhost:3000/api/proveedores/${id}`, {
          method: "DELETE",
        });
        fetchProveedores();
      } catch (error) {
        console.error("Error al eliminar proveedor:", error);
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f1f5f9",
        p: { xs: 2, md: 4 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 1400,
          mx: "auto",
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          backgroundColor: "#ffffff",
        }}
      >
        <Box
          sx={{
            px: { xs: 3, md: 4 },
            py: 3,
            background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
            color: "white",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              gap: 2,
            }}
          >
            <Box>
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: "center" }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(255,255,255,0.12)",
                  }}
                >
                  <BusinessIcon />
                </Box>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: "1.6rem", md: "2rem" },
                    }}
                  >
                    Gestión de Proveedores
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255,255,255,0.72)", mt: 0.3 }}
                  >
                    Consulta, administra y controla los proveedores registrados
                  </Typography>
                </Box>
              </Stack>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={abrirFormularioNuevo}
              sx={{
                backgroundColor: "#22c55e",
                color: "white",
                fontWeight: 700,
                px: 2.5,
                py: 1.2,
                borderRadius: 2.5,
                textTransform: "none",
                boxShadow: "none",
                "&:hover": { backgroundColor: "#16a34a", boxShadow: "none" },
              }}
            >
              Nuevo Proveedor
            </Button>
          </Box>
        </Box>

        <Box sx={{ p: { xs: 2.5, md: 3 } }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: "1px solid #e2e8f0",
              backgroundColor: "#f8fafc",
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", mb: 2 }}
            >
              <SearchIcon sx={{ color: "#2563eb", fontSize: 21 }} />
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, color: "#1e293b" }}
              >
                Buscar proveedores
              </Typography>
            </Stack>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "2fr 1fr auto auto" },
                gap: 1.5,
                alignItems: "center",
              }}
            >
              <TextField
                label="Nombre del proveedor"
                variant="outlined"
                size="small"
                value={filtroNombre}
                onChange={(e) => setFiltroNombre(e.target.value)}
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ backgroundColor: "white" }}
              />

              <TextField
                select
                label="Categoría"
                size="small"
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                fullWidth
                sx={{ backgroundColor: "white", textAlign: "left" }}
              >
                {categorias.map((cat) => (
                  <MenuItem
                    key={cat.SupplierCategoryID}
                    value={cat.SupplierCategoryID}
                    sx={{ textAlign: "left" }}
                  >
                    {cat.SupplierCategoryName}
                  </MenuItem>
                ))}
              </TextField>

              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={fetchProveedores}
                sx={{
                  height: 40,
                  px: 2,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  boxShadow: "none",
                }}
              >
                Buscar
              </Button>
              <Button
                variant="outlined"
                startIcon={<RestartAltIcon />}
                onClick={restaurarFiltros}
                sx={{
                  height: 40,
                  px: 2,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  borderColor: "#cbd5e1",
                  color: "#475569",
                  "&:hover": {
                    borderColor: "#94a3b8",
                    backgroundColor: "#f1f5f9",
                  },
                }}
              >
                Restaurar
              </Button>
            </Box>
          </Paper>

          <Box sx={{ mt: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1.5,
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#0f172a" }}
                >
                  Proveedores registrados
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b", mt: 0.3 }}>
                  {Array.isArray(proveedores)
                    ? `${proveedores.length} proveedor${proveedores.length === 1 ? "" : "es"} encontrado${proveedores.length === 1 ? "" : "s"}`
                    : "No disponible"}
                </Typography>
              </Box>
            </Box>

            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                border: "1px solid #e2e8f0",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                    <TableCell
                      sx={{ fontWeight: 700, color: "#475569", py: 2 }}
                    >
                      PROVEEDOR
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{ fontWeight: 700, color: "#475569" }}
                    >
                      CATEGORÍA
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{ fontWeight: 700, color: "#475569" }}
                    >
                      MÉTODO DE ENTREGA
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 700, color: "#475569" }}
                    >
                      ACCIONES
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.isArray(proveedores) && proveedores.length > 0 ? (
                    proveedores.map((row) => (
                      <TableRow
                        key={row.SupplierID}
                        hover
                        sx={{
                          "&:last-child td": { borderBottom: 0 },
                          "&:hover": { backgroundColor: "#f8fafc" },
                        }}
                      >
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1.5}
                            sx={{ alignItems: "center" }}
                          >
                            <Box
                              sx={{
                                width: 38,
                                height: 38,
                                borderRadius: 2,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "#dbeafe",
                                color: "#2563eb",
                                fontWeight: 700,
                              }}
                            >
                              {row.NombreProveedor?.charAt(0)?.toUpperCase() ||
                                "P"}
                            </Box>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 700, color: "#1e293b" }}
                              >
                                {row.NombreProveedor}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "#94a3b8" }}
                              >
                                ID: {row.SupplierID}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        <TableCell align="left">
                          <Chip
                            icon={<CategoryIcon />}
                            label={row.Categoria || "N/A"}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              backgroundColor: "#eff6ff",
                              color: "#2563eb",
                              justifyContent: "flex-start",
                              "& .MuiChip-label": { paddingLeft: 1 },
                              "& .MuiChip-icon": { color: "#2563eb" },
                            }}
                          />
                        </TableCell>

                        <TableCell align="left">
                          <Chip
                            icon={<LocalShippingIcon />}
                            label={row.MetodoEntrega || "N/A"}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              backgroundColor: "#f0fdf4",
                              color: "#15803d",
                              justifyContent: "flex-start",
                              "& .MuiChip-label": { paddingLeft: 1 },
                              "& .MuiChip-icon": { color: "#15803d" },
                            }}
                          />
                        </TableCell>

                        <TableCell align="center">
                          <Stack
                            direction="row"
                            spacing={0.5}
                            sx={{ justifyContent: "center" }}
                          >
                            <IconButton
                              size="small"
                              title="Ver detalles"
                              onClick={() => abrirDetalles(row.SupplierID)}
                              sx={{
                                color: "#2563eb",
                                backgroundColor: "#eff6ff",
                                "&:hover": { backgroundColor: "#dbeafe" },
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              title="Editar"
                              onClick={() => abrirFormularioEdicion(row)}
                              sx={{
                                color: "#d97706",
                                backgroundColor: "#fffbeb",
                                "&:hover": { backgroundColor: "#fef3c7" },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              title="Eliminar"
                              onClick={() => eliminarProveedor(row.SupplierID)}
                              sx={{
                                color: "#dc2626",
                                backgroundColor: "#fef2f2",
                                "&:hover": { backgroundColor: "#fee2e2" },
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 7 }}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <BusinessIcon
                            sx={{ fontSize: 50, color: "#cbd5e1" }}
                          />
                          <Typography
                            variant="h6"
                            sx={{ color: "#475569", fontWeight: 600 }}
                          >
                            No hay proveedores
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                            No se encontraron proveedores con los filtros
                            actuales.
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Paper>

      <ModalDetallesProveedor
        abierto={modalDetallesAbierto}
        onClose={() => setModalDetallesAbierto(false)}
        proveedor={proveedorSeleccionado}
      />

      <ModalFormularioProveedor
        abierto={modalFormAbierto}
        onClose={() => setModalFormAbierto(false)}
        modoEdicion={modoEdicion}
        formData={formData}
        manejarCambioFormulario={manejarCambioFormulario}
        manejarCambioAutocomplete={manejarCambioAutocomplete}
        manejarUbicacionCapturada={manejarUbicacionCapturada}
        guardarProveedor={guardarProveedor}
        opcionesCategorias={categorias}
        opcionesContactos={contactos}
        opcionesMetodosEntrega={metodosEntrega}
        opcionesCiudades={ciudades}
      />
    </Box>
  );
}
