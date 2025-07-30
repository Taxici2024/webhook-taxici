const fetch = require('node-fetch');

module.exports = async function handler(req, res) {
  const VERIFY_TOKEN = 'taxici_token_2025_2'; // Token de verificación
  const ACCESS_TOKEN = 'EAA6dsGcGvsEBPPoakLAp1Fh5gYZCutT5ZC7rMhwZAEHl1CPCKZC6JmXIxpyq1uEb95nlUJAXlHBYKZC1YTZA06SjDSAS0SCn9HzljyzSeuIZCt35rCEg4ZAKSlJgXtwH3XZBl5m6XoDIUqLbINDWyTSTh5dfrVKFZCjuTlZCXAUuH71sGNDi6wwsF2JdTlOaFzuZCgKdFmkdeihZCCx0j4BGgAcuruZAAjdyOCKfgesMgee6mn4eGawQZDZD'; // Token largo
  const PHONE_NUMBER_ID = '4114030642249409'; // ID de número de WhatsApp Business

  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    if (mode && token === VERIFY_TOKEN && mode === 'subscribe') {
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403); // 403 si la verificación falla
    }
  }

  if (req.method === 'POST') {
    console.log('MENSAJE ENTRANTE:', JSON.stringify(req.body, null, 2)); // Log del mensaje entrante
    
    if (req.body.object) {
      const entry = req.body.entry?.[0];
      const changes = entry?.changes?.[0];
      const message = changes?.value?.messages?.[0];
      const from = message?.from;
      const text = message?.text?.body;

      if (from && text) {
        await fetch(`https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ACCESS_TOKEN}`
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: from,
            text: { body: 'Hola, soy tu asistente automático de TAXICI 🚖. ¿En qué puedo ayudarte?' }
          })
        });
      }

      return res.status(200).send('EVENT_RECEIVED');
    }
    return res.sendStatus(404); // Si no hay evento válido
  }

  return res.sendStatus(405); // Método no permitido
};
