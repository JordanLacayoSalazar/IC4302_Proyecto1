import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Autocomplete,
  InputAdornment,
} from "@mui/material";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AllInboxIcon from "@mui/icons-material/AllInbox";

import ModalInterfazBase from "../../components/ModalInterfazBase";
import PestanasInterfazBase from "../../components/PestanasInterfazBase";
import {
  esDecimalNoNegativo,
  esEnteroNoNegativo,
} from "../../components/apiHerramientas";

export default function ModalFormularioProducto({
  abierto,
  onClose,
  modoEdicion,
  formData,
  manejarCambioFormulario,
  manejarCambioAutocomplete,
  guardarProducto,
  opcionesGrupos = [],
  opcionesProveedores = [],
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

    [
      ["NombreProducto", "El nombre del producto es obligatorio."],
      ["NombreGrupo", "El grupo del producto es obligatorio."],
      ["Proveedor", "El proveedor es obligatorio."],
      ["UnidadEmpaque", "La unidad de empaque es obligatoria."],
      ["EmpaqueExterior", "El empaque exterior es obligatorio."],
    ].forEach(([campo, mensaje]) => {
      if (!String(formData[campo] || "").trim()) {
        nuevosErrores[campo] = mensaje;
      }
    });

    const enteros = [["CantidadEmpaque", formData.CantidadEmpaque]];
    enteros.forEach(([campo, valor]) => {
      if (!esEnteroNoNegativo(valor) || Number(valor) < 1) {
        nuevosErrores[campo] = "Debe ser un entero mayor que 0.";
      }
    });

    [
      ["Impuesto", formData.Impuesto],
      ["PrecioUnitario", formData.PrecioUnitario],
      ["PrecioVenta", formData.PrecioVenta],
      ["Peso", formData.Peso],
    ].forEach(([campo, valor]) => {
      if (!esDecimalNoNegativo(valor) || valor === "") {
        nuevosErrores[campo] = "Debe ser un número mayor o igual a 0.";
      }
    });

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    setErrores({});

    guardarProducto({
      ...formData,
      NombreProducto: formData.NombreProducto.trim(),
      NombreGrupo: formData.NombreGrupo.trim(),
      Proveedor: formData.Proveedor.trim(),
      UnidadEmpaque: formData.UnidadEmpaque.trim(),
      EmpaqueExterior: formData.EmpaqueExterior.trim(),
      CantidadEmpaque: Number(formData.CantidadEmpaque),
      Impuesto: Number(String(formData.Impuesto).replace(",", ".")),
      PrecioUnitario: Number(String(formData.PrecioUnitario).replace(",", ".")),
      PrecioVenta: Number(String(formData.PrecioVenta).replace(",", ".")),
      Peso: Number(String(formData.Peso).replace(",", ".")),
      Color: formData.Color?.trim() || null,
      Marca: formData.Marca?.trim() || null,
      Talla: formData.Talla?.trim() || null,
      PalabrasClaves: formData.PalabrasClaves?.trim() || null,
    });
  };

  const nombresGrupos = opcionesGrupos.map((item) => item.NombreGrupo);
  const nombresProveedores = opcionesProveedores.map(
    (item) => item.NombreProveedor,
  );

  const contenidoGeneral = (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
        gap: 2,
      }}
    >
      <TextField
        label="Nombre del producto"
        name="NombreProducto"
        value={formData.NombreProducto || ""}
        onChange={manejarCambioFormulario}
        fullWidth
        required
        error={!!errores.NombreProducto}
        helperText={errores.NombreProducto}
        sx={{ backgroundColor: "white", gridColumn: { sm: "span 2" } }}
      />
      <Autocomplete
        freeSolo
        options={nombresGrupos}
        value={formData.NombreGrupo || ""}
        onChange={(_, value) =>
          manejarCambioAutocomplete("NombreGrupo", value || "")
        }
        onInputChange={(_, value) =>
          manejarCambioAutocomplete("NombreGrupo", value || "")
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Grupo de producto"
            required
            error={!!errores.NombreGrupo}
            helperText={errores.NombreGrupo}
            sx={{ backgroundColor: "white" }}
          />
        )}
      />
      <Autocomplete
        freeSolo
        options={nombresProveedores}
        value={formData.Proveedor || ""}
        onChange={(_, value) =>
          manejarCambioAutocomplete("Proveedor", value || "")
        }
        onInputChange={(_, value) =>
          manejarCambioAutocomplete("Proveedor", value || "")
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Proveedor"
            required
            error={!!errores.Proveedor}
            helperText={
              errores.Proveedor || "Seleccione un proveedor existente."
            }
            sx={{ backgroundColor: "white" }}
          />
        )}
      />
      <TextField
        label="Marca"
        name="Marca"
        value={formData.Marca || ""}
        onChange={manejarCambioFormulario}
        fullWidth
        placeholder="Opcional"
        sx={{ backgroundColor: "white" }}
      />
      <TextField
        label="Talla / tamaño"
        name="Talla"
        value={formData.Talla || ""}
        onChange={manejarCambioFormulario}
        fullWidth
        placeholder="Opcional"
        sx={{ backgroundColor: "white" }}
      />
      <TextField
        label="Color"
        name="Color"
        value={formData.Color || ""}
        onChange={manejarCambioFormulario}
        fullWidth
        placeholder="Opcional"
        sx={{ backgroundColor: "white" }}
      />
      <TextField
        label="Palabras clave / Search detail"
        name="PalabrasClaves"
        value={formData.PalabrasClaves || ""}
        onChange={manejarCambioFormulario}
        fullWidth
        placeholder="Ej.: rojo, algodón, verano"
        sx={{ backgroundColor: "white", gridColumn: { sm: "span 2" } }}
      />
    </Box>
  );

  const contenidoPrecios = (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
        gap: 2,
      }}
    >
      {[
        ["PrecioUnitario", "Precio unitario", "$"],
        ["PrecioVenta", "Precio de venta (RRP)", "$"],
      ].map(([name, label, adornment]) => (
        <TextField
          key={name}
          label={label}
          name={name}
          value={formData[name] ?? ""}
          onChange={manejarCambioFormulario}
          inputMode="decimal"
          error={!!errores[name]}
          helperText={errores[name]}
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">{adornment}</InputAdornment>
              ),
            },
          }}
          sx={{ backgroundColor: "white" }}
        />
      ))}
      <TextField
        label="Impuesto"
        name="Impuesto"
        value={formData.Impuesto ?? ""}
        onChange={manejarCambioFormulario}
        inputMode="decimal"
        error={!!errores.Impuesto}
        helperText={errores.Impuesto}
        fullWidth
        slotProps={{
          input: {
            endAdornment: <InputAdornment position="end">%</InputAdornment>,
          },
        }}
        sx={{ backgroundColor: "white" }}
      />
    </Box>
  );

  const contenidoEmpaque = (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
        gap: 2,
      }}
    >
      <Autocomplete
        freeSolo
        options={["Each", "Carton", "Bag", "Box", "Pair", "Packet"]}
        value={formData.UnidadEmpaque || ""}
        onChange={(_, value) =>
          manejarCambioAutocomplete("UnidadEmpaque", value || "")
        }
        onInputChange={(_, value) =>
          manejarCambioAutocomplete("UnidadEmpaque", value || "")
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Unidad de empaque"
            required
            error={!!errores.UnidadEmpaque}
            helperText={errores.UnidadEmpaque}
            sx={{ backgroundColor: "white" }}
          />
        )}
      />
      <Autocomplete
        freeSolo
        options={["Carton", "Pallet", "Box"]}
        value={formData.EmpaqueExterior || ""}
        onChange={(_, value) =>
          manejarCambioAutocomplete("EmpaqueExterior", value || "")
        }
        onInputChange={(_, value) =>
          manejarCambioAutocomplete("EmpaqueExterior", value || "")
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Empaque exterior"
            required
            error={!!errores.EmpaqueExterior}
            helperText={errores.EmpaqueExterior}
            sx={{ backgroundColor: "white" }}
          />
        )}
      />
      <TextField
        label="Cantidad por empaque"
        name="CantidadEmpaque"
        value={formData.CantidadEmpaque ?? ""}
        onChange={manejarCambioFormulario}
        inputMode="numeric"
        error={!!errores.CantidadEmpaque}
        helperText={errores.CantidadEmpaque || "Solo enteros positivos."}
        sx={{ backgroundColor: "white" }}
      />
      <TextField
        label="Peso (kg)"
        name="Peso"
        value={formData.Peso ?? ""}
        onChange={manejarCambioFormulario}
        inputMode="decimal"
        error={!!errores.Peso}
        helperText={errores.Peso || "No puede ser negativo."}
        sx={{ backgroundColor: "white" }}
      />
    </Box>
  );

  const pestanas = [
    {
      etiqueta: "General",
      icono: <InventoryIcon />,
      tieneError: !!(
        errores.NombreProducto ||
        errores.NombreGrupo ||
        errores.Proveedor
      ),
      contenido: contenidoGeneral,
    },
    {
      etiqueta: "Precios",
      icono: <AttachMoneyIcon />,
      tieneError: !!(
        errores.PrecioUnitario ||
        errores.PrecioVenta ||
        errores.Impuesto
      ),
      contenido: contenidoPrecios,
    },
    {
      etiqueta: "Empaque",
      icono: <AllInboxIcon />,
      tieneError: !!(
        errores.UnidadEmpaque ||
        errores.EmpaqueExterior ||
        errores.CantidadEmpaque ||
        errores.Peso
      ),
      contenido: contenidoEmpaque,
    },
  ];

  return (
    <ModalInterfazBase
      abierto={abierto}
      onClose={manejarCierre}
      titulo={modoEdicion ? "Editar producto" : "Registrar producto"}
      descripcion={
        modoEdicion
          ? "Modifica los datos del producto en inventario"
          : "Agrega un nuevo artículo al catálogo"
      }
      Icono={LocalOfferIcon}
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
            sx={{
              textTransform: "none",
              borderRadius: 2,
              fontWeight: 600,
              px: 2.5,
            }}
          >
            {modoEdicion ? "Guardar cambios" : "Crear producto"}
          </Button>
        </>
      }
    >
      <PestanasInterfazBase
        pestanas={pestanas}
        tabActual={tabActual}
        onChangeTab={(_, value) => setTabActual(value)}
      />
    </ModalInterfazBase>
  );
}
