
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
    const from = message.from;
    const text = message.text?.body || '';

    console.log(`📩 Mensaje recibido: ${text} de ${from}`);

    const token = 'EAA6dsGcGvsEBPEY0zqVztIAbH6yNL5R297kEX2xWkcmOhDTwCHgyWrDGnlbyJuBrpqYAM2SkqBejnpyGMz1wMGOOMcbQX7N3Vzi5pWgkcXRZCP4EQfSFu1xPPw0eJ1JO288nhOhD3daTFZBeSYoMqm4oR1J9RuTZBCecZA0cD9z5ZACiUFw58SZCchArZBIO2LZBgbzuemyjMGJ8x9kyJxVrnSh8H5ezqKU6d67eNbuiuEU1pxwZD'; 

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

    console.log('✅ Respuesta enviada');
  }

  res.sendStatus(200);
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor webhook escuchando en http://localhost:${PORT}`);
});
