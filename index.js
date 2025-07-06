const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Ruta para verificación del webhook
app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = 'taxci2024';

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor webhook escuchando en puerto ${PORT}`);
});
