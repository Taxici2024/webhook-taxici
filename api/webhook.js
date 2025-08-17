// api/webhook.js
module.exports = (req, res) => {
  const VERIFY_TOKEN = 'taxici_token_2025_2';

  // Verificación de webhook
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ WEBHOOK VERIFICADO');
      return res.status(200).send(challenge.toString()); // Solo enviar el challenge como string
    } else {
      console.log('❌ Verificación fallida');
      return res.status(403).send('Token inválido');
    }
  }

  // Recepción de mensajes
  if (req.method === 'POST') {
    const body = req.body;

    // Facebook envía eventos dentro de body.entry
    if (body.object === 'whatsapp_business_account') {
      body.entry.forEach((entry) => {
        const changes = entry.changes;
        changes.forEach((change) => {
          const value = change.value;
          if (value.messages) {
            value.messages.forEach((message) => {
              console.log('📥 MENSAJE ENTRANTE:', JSON.stringify(message, null, 2));
            });
          }
        });
      });
      return res.status(200).send('EVENT_RECEIVED');
    } else {
      return res.status(404).send('No se reconoció el evento');
    }
  }

  // Método no permitido
  res.status(405).send('Method Not Allowed');
};

