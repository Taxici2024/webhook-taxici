// ✅ ESTE ES EL CORRECTO: api/webhook.js
// El archivo webhook.js debe estar dentro de la carpeta "api"

const express = require('express');
const app = express();
app.use(express.json());

// Ruta para verificación de Webhook (GET)
app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = 'taxici_token_2025_2';

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFICADO');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// Ruta para recibir mensajes (POST)
app.post('/webhook', (req, res) => {
  const body = req.body;

  console.log('Webhook recibido:', JSON.stringify(body, null, 2));

  if (body.object) {
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

module.exports = app;
