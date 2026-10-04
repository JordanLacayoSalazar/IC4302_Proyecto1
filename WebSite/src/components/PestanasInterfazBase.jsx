import { Box, Tabs, Tab } from "@mui/material";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`pestana-tabpanel-${index}`}
      aria-labelledby={`pestana-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `pestana-tab-${index}`,
    "aria-controls": `pestana-tabpanel-${index}`,
  };
}

export default function PestanasInterfazBase({
  pestanas,
  tabActual,
  onChangeTab,
}) {
  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabActual}
          onChange={onChangeTab}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="pestañas de interfaz base"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
              minHeight: 56,
            },
          }}
        >
          {pestanas.map((pestana, index) => (
            <Tab
              key={index}
              label={pestana.etiqueta}
              icon={pestana.icono}
              iconPosition="start"
              {...a11yProps(index)}
              // Si la pestaña tiene error, la pintamos de rojo
              sx={
                pestana.tieneError
                  ? {
                      color: "error.main",
                      "&.Mui-selected": { color: "error.main" },
                    }
                  : {}
              }
            />
          ))}
        </Tabs>
      </Box>

      {pestanas.map((pestana, index) => (
        <TabPanel key={index} value={tabActual} index={index}>
          {pestana.contenido}
        </TabPanel>
      ))}
    </Box>
  );
}
