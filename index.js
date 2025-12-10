const { exec } = require("child_process");

const port = process.env.PORT || 3000;

console.log("Iniciando en el puerto:", port);

// 1. Construye el proyecto (dist)
exec("npm run build", (buildErr, buildOut, buildErrOut) => {
  if (buildErr) {
    console.error("❌ Error en el build:", buildErr);
    return;
  }
  console.log("✔ Build completado");

  // 2. Sirve la carpeta dist en el puerto asignado por Pterodactyl
  exec(`npx serve -s dist -l ${port}`, (err, out, errOut) => {
    if (err) {
      console.error("❌ Error al iniciar el servidor:", err);
      return;
    }
    console.log("✔ Servidor iniciado");
    console.log(out);
  });
});
