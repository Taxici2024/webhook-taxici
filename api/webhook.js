export default async function handler(req, res) {
  const VERIFY_TOKEN = 'taxici_token_2025_2';
  const ACCESS_TOKEN = 'EAA6dsGcGvsEBPHQ1nMxvmhNfcz5ZCLFtqumOtyobBTMh2zlN5TeR9R3L8mTW4Y2G6j1qRoShMV0TGhfC79GmT4RUTgOAZCDa3uDdLtvmbo5weknzcupY2KZB3P6nThP7mg2UMsgMUA20wBdYkAsr3YfKZBZBVZCDPpHZABdSe9axmE8GdviFtceZAbeWnUYUPUOgtTYd6DTSjfW2B4xXSSVtXfHAydDtEFnzZBaZCHDjSnGK3aEAZDZD';
  const PHONE_NUMBER_ID = '4114030642249409';

  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token === VERIFY_TOKEN && mode === 'subscribe') {
      console.log('WEBHOOK_VERIFICADO');
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }

  if (req.method === 'POST') {
    console.log('MENSAJE ENTRANTE:', JSON.stringify(req.body, null, 2));

    if (req.body.object) {
      const entry = req.body.entry?.[0];
      const changes = entry?.changes?.[0];
      const message = changes?.value?.messages?.[0];
      const from = message?.from;
      const text = message?.text?.body;

      if (from && text) {
        const respuesta = {
          messaging_product: 'whatsapp',
          to: from,
          text: { body: 'Hola, soy tu asistente automático de TAXICI 🚖. ¿En qué puedo ayudarte?' }
        };

        await fetch(`https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ACCESS_TOKEN}`
          },
          body: JSON.stringify(respuesta)
        });
      }

      return res.status(200).send('EVENT_RECEIVED');
    }

    return res.sendStatus(404);
  }

  return res.sendStatus(405);
}
