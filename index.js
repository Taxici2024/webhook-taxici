
const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = 'taxci2024'; // Token de verificación usado en Meta

// Verificación de webhook (GET)
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

// Recepción de mensajes (POST)
app.post('/webhook', async (req, res) => {
  const entry = req.body.entry?.[0];
  const message = entry?.changes?.[0]?.value?.messages?.[0];

  if (message) {
    const phoneNumberId = entry.changes[0].value.metadata.phone_number_id;
    const from = message.from;
    const text = message.text?.body || '';

    console.log(`📩 Mensaje recibido: "${text}" de ${from}`);

    // ✅ Reemplaza esto con tu token temporal actual
    const token = 'EAA6dsGcGvsEBPIx3oKBBooZAfRNIHCt4FupGv0bKD4PyyqABkJxWcenZBfAiZB1aJd7X4vDAOB3gfeqSg1CmmviQZAyZBPk11I33DGSpmNJZCBScUrOJj243u5NEAW6hH9EgnZCbgHpG3aZCMYPhkccJkVQqH1kQYDjz1nV82h2VMBhLhNhBaAZB7ZAxKNc2RKAoKk9rioP2ck4VVlUYJL0YZA6oL0f4yKa8kyj91ZCPbwZDZD';

    try {
      await axios.post(
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
      console.log('✅ Respuesta enviada correctamente');
    } catch (error) {
      console.error('❌ Error al enviar respuesta:', error.response?.data || error.message);
    }
  }

  res.sendStatus(200);
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor webhook escuchando en http://localhost:${PORT}`);
});
