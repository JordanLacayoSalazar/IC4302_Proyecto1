import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

export default function ModalConfirmacion({
  abierto,
  onClose,
  onConfirmar,
  titulo = "Confirmar acción",
  mensaje = "¿Estás seguro de que deseas realizar esta acción?",
  textoCancelar = "Cancelar",
  textoConfirmar = "Confirmar",
  colorIconoTexto = "#dc2626",
  colorBoton = "error",
}) {
  return (
    <Dialog
      open={abierto}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: { borderRadius: 3, p: 1 },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          color: colorIconoTexto,
          fontWeight: 700,
        }}
      >
        <WarningAmberIcon /> {titulo}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ color: "#475569", typography: "body1" }}>{mensaje}</Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderColor: "#cbd5e1",
            color: "#475569",
            "&:hover": { borderColor: "#94a3b8", backgroundColor: "#f1f5f9" },
          }}
        >
          {textoCancelar}
        </Button>
        <Button
          onClick={onConfirmar}
          variant="contained"
          color={colorBoton}
          sx={{ textTransform: "none", fontWeight: 600, boxShadow: "none" }}
        >
          {textoConfirmar}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
