
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ WEBHOOK VERIFICADO');
      return res.status(200).send(challenge);
    } else {
      console.log('❌ Verificación fallida');
      return res.status(403).send('Token inválido');
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body;
      console.log('📥 MENSAJE ENTRANTE:', JSON.stringify(body, null, 2));
      res.status(200).send('EVENT_RECEIVED');

      const changes = body.entry?.[0]?.changes?.[0]?.value;
      const msg = changes?.messages?.[0];
      if (!msg) return;

      const from = msg.from;
      const text = msg.text?.body || 'Mensaje sin texto';

      const token = process.env.WHATSAPP_TOKEN_LONG;
      const phoneId = process.env.WABA_PHONE_ID;

      // Enviar respuesta
      await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: from,
          type: 'text',
          text: {
            body: `TAXICI: recibí tu mensaje: "${text}" ✅`
          }
        })
      });
    } catch (err) {
      console.error('❌ ERROR al manejar el mensaje:', err);
    }
    return;
  }

  res.status(405).send('Method Not Allowed');
}
