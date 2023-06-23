
// Importaciones
const express = require('express'); // Express

// Usar express
const app = express();

// Middleware para aceptar peticiones Json
app.use(express.json());

// Ruta protegida de un cliente
app.post('/test1', function(req, res) {
  // Obtener datos de la autenticación
  res.status(200).send();
});

// Lanzar express
app.listen(3000, () => {
  console.log('Servidor iniciado en puerto 3000');
});