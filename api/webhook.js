const fetch = require('node-fetch');

module.exports = async function handler(req, res) {
  const VERIFY_TOKEN  = 'taxici_token_2025_2';
  const ACCESS_TOKEN  = 'EAA6dsGcGvsEBPCBFsg2dJGKXE01pqa4779RHlDHNWZADOq4b4Wg0Q5sJoizqZAINjvuPa4aWeakZC2aGZBWFDzoypSbXRNGEBN47dZAkLuZBNivDwPAmK9R2TxkeR9ZAOqTVttZALOZBeObOlNVojCzGIZBM4Y3T9DRZCHw8J1BmSWF0Osg2OoOFkLpJM6bprUkZCzhdlGN0DTtPtvyDdhjok1jbxdc18HR4PckDDBzpW3QWoDwgwZDZD';
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
      const text    = message?.text?.body;

      if (from && text) {
        console.log(`Responding to ${from}: "${text}"`);
        await fetch(`https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${ACCESS_TOKEN}`,
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: from,
            text: { body: 'Hola, soy tu asistente automático de TAXICI 🚖. ¿En qué puedo ayudarte?' },
          }),
        });
      }

      return res.status(200).send('EVENT_RECEIVED');
    }

    // MÉTODO NO PERMITIDO
    return res.sendStatus(405);
  } catch (err) {
    console.error('‼️ ERROR IN HANDLER:', err);
    return res.status(500).send('Server error');
  }
};
