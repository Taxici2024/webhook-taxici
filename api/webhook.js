import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const VERIFY_TOKEN = 'taxici_token_2025_2';
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token === VERIFY_TOKEN) {
      console.log('✅ WEBHOOK VERIFICADO');
      return res.status(200).send(challenge);
    } else {
      console.log('❌ Verificación fallida');
      return res.status(403).send('Token inválido');
    }
  }

  if (req.method === 'POST') {
    console.log('📥 MENSAJE ENTRANTE:', JSON.stringify(req.body, null, 2));
    res.status(200).send('EVENT_RECEIVED');

    try {
      const changes = req.body.entry?.[0]?.changes?.[0]?.value;
      const msg = changes?.messages?.[0];
      if (!msg) return;

      const from = msg.from;
      const text = msg.text?.body || 'Hola 👋';

      const token = process.env.WHATSAPP_TOKEN_LONG;
      const phoneId = process.env.WABA_PHONE_ID;

      await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: from,
          type: 'text',
          text: { body: `TAXICI: recibí tu mensaje: "${text}" ✅` }
        })
      });

      console.log('📤 RESPUESTA ENVIADA AL CLIENTE');
    } catch (e) {
      console.error('❌ ERROR EN RESPUESTA:', e);
    }

    return;
  }

  res.status(405).send('Method Not Allowed');
}
