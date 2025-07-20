const express = require('express');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = "taxici_token_123";

// Ruta para la verificación del webhook (GET)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token === VERIFY_TOKEN) {
    console.log("WEBHOOK VERIFICADO");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Ruta para recibir mensajes (POST)
app.post('/webhook', (req, res) => {
  console.log('Mensaje recibido:', JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

module.exports = app;
