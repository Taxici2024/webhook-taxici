const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Ruta GET para verificar el webhook
app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = 'taxici_token';

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verificado correctamente');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Verificación fallida');
    res.sendStatus(403);
  }
});

// Ruta POST para recibir mensajes (aún no necesaria para la verificación)
app.post('/webhook', (req, res) => {
  console.log('📩 Mensaje recibido:', JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
});
