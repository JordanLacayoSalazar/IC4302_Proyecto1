import {
  Typography,
  Box,
  Button,
  TextField,
  MenuItem,
  Autocomplete,
  Divider,
} from "@mui/material";

import CapturadorUbicacion from "../../components/CapturadorUbicacion";
import ModalInterfazBase from "../../components/ModalInterfazBase";

export default function ModalFormularioProveedor({
  abierto,
  onClose,
  modoEdicion,
  IconoCrear,
  IconoEditar,
  IconoModulo,
  formData,
  manejarCambioFormulario,
  manejarCambioAutocomplete,
  manejarUbicacionCapturada,
  guardarProveedor,
  opcionesCategorias = [],
  opcionesContactos = [],
  opcionesMetodosEntrega = [],
  opcionesCiudades = [],
}) {
  return (
    <ModalInterfazBase
      abierto={abierto}
      onClose={onClose}
      titulo={modoEdicion ? "Editar Proveedor" : "Crear Nuevo Proveedor"}
      descripcion={
        modoEdicion
          ? "Modifica el nombre del proveedor"
          : "Completa la información para registrar un proveedor"
      }
      Icono={modoEdicion ? IconoEditar : IconoCrear}
      maxWidth="md"
      contenidoSx={{ p: { xs: 2, md: 4 } }}
      acciones={
        <>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              textTransform: "none",
              borderRadius: 2,
              fontWeight: 600,
              borderColor: "#cbd5e1",
              color: "#475569",
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={guardarProveedor}
            variant="contained"
            startIcon={<IconoModulo />}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              fontWeight: 600,
              px: 2.5,
              boxShadow: "none",
            }}
          >
            {modoEdicion ? "Guardar cambios" : "Crear proveedor"}
          </Button>
        </>
      }
    >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, color: "#1e293b", mb: 2 }}
            >
              Información General
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
              }}
            >
              <TextField
                label="Nombre del proveedor"
                name="SupplierName"
                value={formData.SupplierName}
                onChange={manejarCambioFormulario}
                fullWidth
                required
                sx={{ backgroundColor: "white" }}
              />

              {!modoEdicion && (
                <>
                  <TextField
                    label="Referencia del proveedor"
                    name="SupplierReference"
                    value={formData.SupplierReference}
                    onChange={manejarCambioFormulario}
                    fullWidth
                    sx={{ backgroundColor: "white" }}
                  />

                  <TextField
                    select
                    label="Categoría"
                    name="SupplierCategoryID"
                    value={formData.SupplierCategoryID}
                    onChange={manejarCambioFormulario}
                    fullWidth
                    sx={{ backgroundColor: "white", textAlign: "left" }}
                  >
                    {opcionesCategorias.map((cat) => (
                      <MenuItem
                        key={cat.SupplierCategoryID}
                        value={cat.SupplierCategoryID}
                        sx={{ textAlign: "left" }}
                      >
                        {cat.SupplierCategoryName}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label="Días de Gracia (Pagos)"
                    name="PaymentDays"
                    type="number"
                    value={formData.PaymentDays}
                    onChange={manejarCambioFormulario}
                    fullWidth
                    sx={{ backgroundColor: "white" }}
                  />
                </>
              )}
            </Box>
          </Box>

          {!modoEdicion && (
            <>
              <Divider />

              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, color: "#1e293b", mb: 2 }}
                >
                  Información de Contacto
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 2,
                  }}
                >
                  <Autocomplete
                    options={opcionesContactos}
                    getOptionLabel={(option) => option.FullName || ""}
                    value={
                      opcionesContactos.find(
                        (c) => c.PersonID === formData.PrimaryContactPersonID,
                      ) || null
                    }
                    onChange={(e, newValue) =>
                      manejarCambioAutocomplete(
                        "PrimaryContactPersonID",
                        newValue ? newValue.PersonID : "",
                      )
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Escribe para buscar Contacto Primario"
                        sx={{ backgroundColor: "white" }}
                      />
                    )}
                  />

                  <Autocomplete
                    options={opcionesContactos}
                    getOptionLabel={(option) => option.FullName || ""}
                    value={
                      opcionesContactos.find(
                        (c) => c.PersonID === formData.AlternateContactPersonID,
                      ) || null
                    }
                    onChange={(e, newValue) =>
                      manejarCambioAutocomplete(
                        "AlternateContactPersonID",
                        newValue ? newValue.PersonID : "",
                      )
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Escribe para buscar Contacto Alternativo"
                        sx={{ backgroundColor: "white" }}
                      />
                    )}
                  />

                  <TextField
                    label="Teléfono"
                    name="PhoneNumber"
                    value={formData.PhoneNumber}
                    onChange={manejarCambioFormulario}
                    fullWidth
                    sx={{ backgroundColor: "white" }}
                  />

                  <TextField
                    label="Fax"
                    name="FaxNumber"
                    value={formData.FaxNumber}
                    onChange={manejarCambioFormulario}
                    fullWidth
                    sx={{ backgroundColor: "white" }}
                  />

                  <TextField
                    label="Sitio Web (URL)"
                    name="WebsiteURL"
                    value={formData.WebsiteURL}
                    onChange={manejarCambioFormulario}
                    fullWidth
                    sx={{
                      backgroundColor: "white",
                      gridColumn: { sm: "span 2" },
                    }}
                  />
                </Box>
              </Box>

              <Divider />

              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, color: "#1e293b", mb: 2 }}
                >
                  Logística y Ubicación
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <Autocomplete
                    freeSolo
                    options={opcionesMetodosEntrega}
                    getOptionLabel={(option) =>
                      option.DeliveryMethodName || option
                    }
                    value={
                      opcionesMetodosEntrega.find(
                        (m) => m.DeliveryMethodID === formData.DeliveryMethodID,
                      ) ||
                      formData.DeliveryMethodID ||
                      null
                    }
                    onChange={(e, newValue) => {
                      let finalValue = "";
                      if (typeof newValue === "string") {
                        finalValue = newValue;
                      } else if (newValue && newValue.DeliveryMethodID) {
                        finalValue = newValue.DeliveryMethodID;
                      }
                      manejarCambioAutocomplete("DeliveryMethodID", finalValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Método de Entrega (Buscar o Escribir nuevo)"
                        sx={{ backgroundColor: "white" }}
                      />
                    )}
                  />

                  <Autocomplete
                    options={opcionesCiudades}
                    getOptionLabel={(option) => option.CityName || ""}
                    value={
                      opcionesCiudades.find(
                        (c) => c.CityID === formData.DeliveryCityID,
                      ) || null
                    }
                    onChange={(e, newValue) =>
                      manejarCambioAutocomplete(
                        "DeliveryCityID",
                        newValue ? newValue.CityID : "",
                      )
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Escribe para buscar Ciudad"
                        sx={{ backgroundColor: "white" }}
                      />
                    )}
                  />
                </Box>

                <CapturadorUbicacion
                  onUbicacionCapturada={manejarUbicacionCapturada}
                  latitudActual={formData.Latitud}
                  longitudActual={formData.Longitud}
                />
              </Box>

              <Divider />

              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, color: "#1e293b", mb: 2 }}
                >
                  Información Bancaria
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 2,
                  }}
                >
                  <TextField
                    label="Nombre del Banco"
                    name="BankAccountName"
                    value={formData.BankAccountName}
                    onChange={manejarCambioFormulario}
                    fullWidth
                    sx={{ backgroundColor: "white" }}
                  />

                  <TextField
                    label="Cuenta Corriente"
                    name="BankAccountNumber"
                    value={formData.BankAccountNumber}
                    onChange={manejarCambioFormulario}
                    fullWidth
                    sx={{ backgroundColor: "white" }}
                  />
                </Box>
              </Box>
            </>
          )}
        </Box>
    </ModalInterfazBase>
  );
}
