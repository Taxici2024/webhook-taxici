const fetch = require('node-fetch');

// Store temporal de estados por número (en memoria)
const userStates = {};

module.exports = async function handler(req, res) {
  const VERIFY_TOKEN   = 'taxici_token_2025_2';
  const ACCESS_TOKEN   = 'EAA6dsGcGvsEBPCKXr3rXDscr1eIZBd3uebCS0Y5vZA1F2e7omGCZC04HQaBaKZCZAU5vysqQGjSZBET4PA44s6VjJ159Dewn1kAEMCxY0kdRZCAnxXc3lVx8CAcg7ZAzxmtAacLKXKXm2JFPo9k0OSLiF48kQ7A0bWhfQ9RZC6bjNG2AVNhZC2BcnZCFfRkXjTkvBFv6TNQFjAAGPUf5DZBQDbuibViYTP0EWnPEUhF5JvECLdAmDTUZD';
  const PHONE_NUMBER_ID = '4114030642249409';

  try {
    // VERIFICACIÓN DE WEBHOOK (GET)
    if (req.method === 'GET') {
      const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query;
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        return res.status(200).send(challenge);
      }
      return res.sendStatus(403);
    }

    // MENSAJES ENTRANTES (POST)
    if (req.method === 'POST') {
      console.log('>>> BODY RECEIVED:', JSON.stringify(req.body, null, 2));
      if (!req.body.object) return res.sendStatus(404);

      const entry   = req.body.entry?.[0];
      const change  = entry?.changes?.[0];
      const message = change?.value?.messages?.[0];
      const from    = message?.from;
      const text    = message?.text?.body?.trim();

      let reply;
      const state = userStates[from] || {};

      if (!state.step) {
        // Paso inicial
        if (text.toLowerCase() === 'reservar') {
          state.step = 'awaiting_pickup';
          reply = '¡Perfecto! ¿Cuál es tu dirección de recogida?';
        } else {
          reply = 'Hola, soy tu asistente automático de TAXICI 🚖. Escribe "reservar" para pedir un taxi.';
        }
      } else if (state.step === 'awaiting_pickup') {
        // Recogida recibida
        state.pickup = text;
        state.step = 'awaiting_destination';
        reply = `Genial, recogida: ${text}.\nAhora dime, ¿a dónde te diriges?`;
      } else if (state.step === 'awaiting_destination') {
        // Destino recibido y confirmación
        const pickup = state.pickup;
        const destination = text;
        reply = `Tu reserva está confirmada:\nRecogida: ${pickup}\nDestino: ${destination}\n\nUn taxi llegará en breve. ¡Gracias por usar TAXICI!`;
        delete userStates[from];
      }

      if (state.step) {
        userStates[from] = state;
      }

      // Enviar respuesta
      await fetch(`https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: from,
          text: { body: reply },
        }),
      });

      console.log(`Responded to ${from}: "${reply}"`);
      return res.status(200).send('EVENT_RECEIVED');
    }

    // Métodos no permitidos
    return res.sendStatus(405);
  } catch (err) {
    console.error('‼️ ERROR IN HANDLER:', err);
    return res.status(500).send('Server error');
  }
};
