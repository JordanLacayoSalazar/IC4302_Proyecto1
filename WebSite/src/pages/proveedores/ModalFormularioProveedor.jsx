import { useState } from "react";
import { Box, Button, TextField, Autocomplete } from "@mui/material";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import CapturadorUbicacion from "../../components/CapturadorUbicacion";
import ModalInterfazBase from "../../components/ModalInterfazBase";
import PestanasInterfazBase from "../../components/PestanasInterfazBase";
import { esEnteroNoNegativo } from "../../components/apiHerramientas";

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
  const [tabActual, setTabActual] = useState(0);
  const [errores, setErrores] = useState({});

  const manejarCierre = () => {
    setTabActual(0);
    setErrores({});
    onClose();
  };

  const validarYGuardar = () => {
    const nuevosErrores = {};

    const camposObligatorios = [
      ["SupplierName", "El nombre del proveedor es obligatorio."],
      ["SupplierReference", "La referencia del proveedor es obligatoria."],
      ["SupplierCategoryName", "La categoría es obligatoria."],
      ["PrimaryContactPersonName", "El contacto primario es obligatorio."],
      ["DeliveryMethodName", "El método de entrega es obligatorio."],
      ["DeliveryCityName", "La ciudad de entrega es obligatoria."],
    ];

    camposObligatorios.forEach(([campo, mensaje]) => {
      if (!String(formData[campo] || "").trim()) {
        nuevosErrores[campo] = mensaje;
      }
    });

    if (!esEnteroNoNegativo(formData.PaymentDays)) {
      nuevosErrores.PaymentDays = "Debe ser un número entero no negativo.";
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    setErrores({});

    guardarProveedor({
      ...formData,
      SupplierName: formData.SupplierName.trim(),
      SupplierReference: formData.SupplierReference.trim(),
      SupplierCategoryName: formData.SupplierCategoryName.trim(),
      PrimaryContactPersonName: formData.PrimaryContactPersonName.trim(),
      AlternateContactPersonName:
        formData.AlternateContactPersonName?.trim() || null,
      DeliveryMethodName: formData.DeliveryMethodName.trim(),
      DeliveryCityName: formData.DeliveryCityName.trim(),
      DeliveryAddressLine1: formData.DeliveryAddressLine1?.trim() || null,
      DeliveryAddressLine2: formData.DeliveryAddressLine2?.trim() || null,
      DeliveryPostalCode: formData.DeliveryPostalCode?.trim() || null,
      PostalAddressLine1: formData.PostalAddressLine1?.trim() || null,
      PostalAddressLine2: formData.PostalAddressLine2?.trim() || null,
      PostalPostalCode: formData.PostalPostalCode?.trim() || null,
      PhoneNumber: formData.PhoneNumber?.trim() || null,
      FaxNumber: formData.FaxNumber?.trim() || null,
      WebsiteURL: formData.WebsiteURL?.trim() || null,
      BankAccountName: formData.BankAccountName?.trim() || null,
      BankAccountNumber: formData.BankAccountNumber?.trim() || null,
      PaymentDays:
        formData.PaymentDays === "" ? 30 : Number(formData.PaymentDays),
    });
  };

  const nombresCategorias = opcionesCategorias.map(
    (item) => item.SupplierCategoryName,
  );
  const nombresContactos = opcionesContactos.map((item) => item.FullName);
  const nombresMetodos = opcionesMetodosEntrega.map(
    (item) => item.DeliveryMethodName,
  );
  const nombresCiudades = opcionesCiudades.map((item) => item.CityName);

  const contenidoGeneral = (
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
        value={formData.SupplierName || ""}
        onChange={manejarCambioFormulario}
        fullWidth
        required
        error={!!errores.SupplierName}
        helperText={errores.SupplierName}
        sx={{ backgroundColor: "white" }}
      />
      <TextField
        label="Referencia del proveedor"
        name="SupplierReference"
        value={formData.SupplierReference || ""}
        onChange={manejarCambioFormulario}
        fullWidth
        required
        error={!!errores.SupplierReference}
        helperText={errores.SupplierReference}
        sx={{ backgroundColor: "white" }}
      />
      <Autocomplete
        freeSolo
        options={nombresCategorias}
        value={formData.SupplierCategoryName || ""}
        onChange={(_, value) =>
          manejarCambioAutocomplete("SupplierCategoryName", value || "")
        }
        onInputChange={(_, value) =>
          manejarCambioAutocomplete("SupplierCategoryName", value || "")
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Categoría"
            required
            error={!!errores.SupplierCategoryName}
            helperText={errores.SupplierCategoryName}
            sx={{ backgroundColor: "white" }}
          />
        )}
      />
      <TextField
        label="Días de gracia (pagos)"
        name="PaymentDays"
        value={formData.PaymentDays ?? 30}
        onChange={manejarCambioFormulario}
        inputMode="numeric"
        error={!!errores.PaymentDays}
        helperText={
          errores.PaymentDays || "Solo enteros mayores o iguales a 0."
        }
        fullWidth
        sx={{ backgroundColor: "white" }}
      />
    </Box>
  );

  const contenidoContacto = (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
        gap: 2,
      }}
    >
      <Autocomplete
        options={nombresContactos}
        value={formData.PrimaryContactPersonName || ""}
        onChange={(_, value) =>
          manejarCambioAutocomplete("PrimaryContactPersonName", value || "")
        }
        onInputChange={(_, value) =>
          manejarCambioAutocomplete("PrimaryContactPersonName", value || "")
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Contacto primario"
            required
            error={!!errores.PrimaryContactPersonName}
            helperText={
              errores.PrimaryContactPersonName ||
              "Seleccione un contacto existente."
            }
            sx={{ backgroundColor: "white" }}
          />
        )}
      />
      <Autocomplete
        options={nombresContactos}
        value={formData.AlternateContactPersonName || ""}
        onChange={(_, value) =>
          manejarCambioAutocomplete("AlternateContactPersonName", value || "")
        }
        onInputChange={(_, value) =>
          manejarCambioAutocomplete("AlternateContactPersonName", value || "")
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Contacto alternativo"
            helperText="Opcional. Si se deja vacío, se utiliza el primario."
            sx={{ backgroundColor: "white" }}
          />
        )}
      />
      <TextField
        label="Teléfono"
        name="PhoneNumber"
        value={formData.PhoneNumber || ""}
        onChange={manejarCambioFormulario}
        fullWidth
        placeholder="Opcional"
        sx={{ backgroundColor: "white" }}
      />
      <TextField
        label="Fax"
        name="FaxNumber"
        value={formData.FaxNumber || ""}
        onChange={manejarCambioFormulario}
        fullWidth
        placeholder="Opcional"
        sx={{ backgroundColor: "white" }}
      />
      <TextField
        label="Sitio web (URL)"
        name="WebsiteURL"
        value={formData.WebsiteURL || ""}
        onChange={manejarCambioFormulario}
        fullWidth
        placeholder="https://..."
        sx={{ backgroundColor: "white", gridColumn: { sm: "span 2" } }}
      />
    </Box>
  );

  const contenidoLogistica = (
    <Box>
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
          options={nombresMetodos}
          value={formData.DeliveryMethodName || ""}
          onChange={(_, value) =>
            manejarCambioAutocomplete("DeliveryMethodName", value || "")
          }
          onInputChange={(_, value) =>
            manejarCambioAutocomplete("DeliveryMethodName", value || "")
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Método de entrega"
              required
              error={!!errores.DeliveryMethodName}
              helperText={errores.DeliveryMethodName}
              sx={{ backgroundColor: "white" }}
            />
          )}
        />
        <Autocomplete
          options={nombresCiudades}
          value={formData.DeliveryCityName || ""}
          onChange={(_, value) =>
            manejarCambioAutocomplete("DeliveryCityName", value || "")
          }
          onInputChange={(_, value) =>
            manejarCambioAutocomplete("DeliveryCityName", value || "")
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Ciudad de entrega"
              required
              error={!!errores.DeliveryCityName}
              helperText={errores.DeliveryCityName}
              sx={{ backgroundColor: "white" }}
            />
          )}
        />
        <TextField
          label="Código postal de entrega"
          name="DeliveryPostalCode"
          value={formData.DeliveryPostalCode || ""}
          onChange={manejarCambioFormulario}
          sx={{ backgroundColor: "white" }}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2,
          mb: 2,
        }}
      >
        <TextField
          label="Dirección de entrega (línea 1)"
          name="DeliveryAddressLine1"
          value={formData.DeliveryAddressLine1 || ""}
          onChange={manejarCambioFormulario}
          sx={{ backgroundColor: "white" }}
        />
        <TextField
          label="Dirección de entrega (línea 2)"
          name="DeliveryAddressLine2"
          value={formData.DeliveryAddressLine2 || ""}
          onChange={manejarCambioFormulario}
          sx={{ backgroundColor: "white" }}
        />
        <TextField
          label="Dirección postal (línea 1)"
          name="PostalAddressLine1"
          value={formData.PostalAddressLine1 || ""}
          onChange={manejarCambioFormulario}
          sx={{ backgroundColor: "white" }}
        />
        <TextField
          label="Dirección postal (línea 2)"
          name="PostalAddressLine2"
          value={formData.PostalAddressLine2 || ""}
          onChange={manejarCambioFormulario}
          sx={{ backgroundColor: "white" }}
        />
        <TextField
          label="Código postal postal"
          name="PostalPostalCode"
          value={formData.PostalPostalCode || ""}
          onChange={manejarCambioFormulario}
          sx={{ backgroundColor: "white" }}
        />
      </Box>

      <CapturadorUbicacion
        onUbicacionCapturada={manejarUbicacionCapturada}
        latitudActual={formData.Latitud}
        longitudActual={formData.Longitud}
      />
    </Box>
  );

  const contenidoBancaria = (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
        gap: 2,
      }}
    >
      <TextField
        label="Nombre del banco"
        name="BankAccountName"
        value={formData.BankAccountName || ""}
        onChange={manejarCambioFormulario}
        fullWidth
        placeholder="Opcional"
        sx={{ backgroundColor: "white" }}
      />
      <TextField
        label="Cuenta corriente"
        name="BankAccountNumber"
        value={formData.BankAccountNumber || ""}
        onChange={manejarCambioFormulario}
        fullWidth
        placeholder="Opcional"
        sx={{ backgroundColor: "white" }}
      />
    </Box>
  );

  const arregloPestanas = [
    {
      etiqueta: "General",
      icono: <InfoOutlinedIcon />,
      tieneError: !!(
        errores.SupplierName ||
        errores.SupplierReference ||
        errores.SupplierCategoryName ||
        errores.PaymentDays
      ),
      contenido: contenidoGeneral,
    },
    {
      etiqueta: "Contacto",
      icono: <ContactsOutlinedIcon />,
      tieneError: !!errores.PrimaryContactPersonName,
      contenido: contenidoContacto,
    },
    {
      etiqueta: "Logística y ubicación",
      icono: <LocalShippingOutlinedIcon />,
      tieneError: !!(errores.DeliveryMethodName || errores.DeliveryCityName),
      contenido: contenidoLogistica,
    },
    {
      etiqueta: "Bancaria",
      icono: <AccountBalanceOutlinedIcon />,
      tieneError: false,
      contenido: contenidoBancaria,
    },
  ];

  return (
    <ModalInterfazBase
      abierto={abierto}
      onClose={manejarCierre}
      titulo={modoEdicion ? "Editar proveedor" : "Crear nuevo proveedor"}
      descripcion={
        modoEdicion
          ? "Modifica la información del proveedor"
          : "Completa la información para registrar un proveedor"
      }
      Icono={modoEdicion ? IconoEditar : IconoCrear}
      maxWidth="md"
      contenidoSx={{ p: { xs: 2, md: 4 } }}
      acciones={
        <>
          <Button
            onClick={manejarCierre}
            variant="outlined"
            sx={{ textTransform: "none", borderRadius: 2, fontWeight: 600 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={validarYGuardar}
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
      <PestanasInterfazBase
        pestanas={arregloPestanas}
        tabActual={tabActual}
        onChangeTab={(_, value) => setTabActual(value)}
      />
    </ModalInterfazBase>
  );
}
