
const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = 'taxci2024'; // Este debe coincidir con el token que pusiste en Meta

// Ruta de verificación
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verificado correctamente');
    res.status(200).send(challenge);
  } else {
    console.warn('❌ Error al verificar webhook');
    res.sendStatus(403);
  }
});

// Ruta para recibir mensajes reales y responder
app.post('/webhook', async (req, res) => {
  const entry = req.body.entry?.[0];
  const message = entry?.changes?.[0]?.value?.messages?.[0];

  if (message) {
    const phoneNumberId = entry.changes[0].value.metadata.phone_number_id;
    
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

// Tu token de verificación (elige uno y colócalo también en Meta Developers)
const VERIFY_TOKEN = 'taxici_token_seguro';

// Ruta para verificar el webhook (GET)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verificado correctamente');
    res.status(200).send(challenge);
  } else {
    console.warn('❌ Error al verificar webhook');
    res.sendStatus(403);
  }
});

// Ruta para recibir mensajes (POST)
app.post('/webhook', async (req, res) => {
  const entry = req.body.entry?.[0];
  const message = entry?.changes?.[0]?.value?.messages?.[0];

  if (message) {
    const phoneNumberId = entry.changes[0].value.metadata.phone_number_id;
    const from = message.from;
    const text = message.text?.body || '';

    console.log(`📩 Mensaje recibido: ${text} de ${from}`);

    // Pega aquí tu token real de acceso desde Meta (sin espacios ni saltos)
    const token = '';

    try {
      await axios.post(EAA6dsGcGvsEBPETlOWOkjfqT4OIkrgpfuy1tInsrVzwQwCC536d5lgte9PiVsgg5T6TU2wiklwlF9GOIZC9M8BNrLvvZAYEzejibcRyUDPpMFC68lzwdWMUD6vY6WEplAHOHxliW6WFkknIMdYGF5Ch0y9OGZAJFD7mYKHH2Fw9IynwEIKwIvEsVffNYzfpt4d6wGP7L8aFApMXI0z0oVCBqZCl7kRR0U4U4R9ZACZCNPuZCLGx
        `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: from,
          text: { body: 'Hola 👋, soy tu asistente de Taxi. ¿Deseas pedir un viaje, mototaxi o reparto?' }
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Respuesta enviada');
    } catch (error) {
      console.error('❌ Error al enviar respuesta:', error.response?.data || error.message);
    }
  }

  res.sendStatus(200);
});

// Iniciar servidor local (solo útil si lo pruebas con Ngrok)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor webhook escuchando en http://localhost:${PORT}`);
});
