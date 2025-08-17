// api/webhook.js
module.exports = (req, res) => {
  if (req.method === 'GET') {
    const VERIFY_TOKEN = 'taxici_token_2025_2'; // 👈 tu token de verificación
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
    return res.status(200).send('EVENT_RECEIVED');
  }

  res.status(405).send('Method Not Allowed');
};
