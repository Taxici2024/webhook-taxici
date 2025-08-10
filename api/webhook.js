// TAXICI – Webhook con botones e intents (Node 18+, fetch nativo, Vercel)
// Fix: sin res.sendStatus (usamos res.status(...).end())

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN; // p.ej. "taxici_token_2025_2"
const WA_TOKEN = process.env.WHATSAPP_TOKEN;            // Token largo actual

function parseUrl(req) {
  const base = `http://${req.headers.host || 'localhost'}`;
  return new URL(req.url, base);
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const raw = await new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => resolve(data));
  });
  try { return JSON.parse(raw || '{}'); } catch { return {}; }
}

async function waPost(path, payload) {
  const url = `https://graph.facebook.com/v23.0/${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WA_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const t = await res.text();
    console.error('WA error', res.status, t);
  }
  return res;
}

async function sendText(phoneNumberId, to, text) {
  return waPost(`${phoneNumberId}/messages`, {
    messaging_product: 'whatsapp',
    to,
    text: { body: text }
  });
}

async function sendButtons(phoneNumberId, to) {
  return waPost(`${phoneNumberId}/messages`, {
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: '🚕 *TAXICI*\nElige una opción:' },
      action: {
        buttons: [
          { type: 'reply', reply: { id: 'taxi_now', title: 'Pedir taxi' } },
          { type: 'reply', reply: { id: 'reserve',  title: 'Reservar' } },
          { type: 'reply', reply: { id: 'agent',    title: 'Agente' } }
        ]
      }
    }
  });
}

function parseTaxi(text) {
  // Formato: TAXI: origen -> destino
  const m = text.match(/^\s*TAXI\s*:\s*(.+?)\s*(?:->|→| a )\s*(.+)$/i);
  if (!m) return null;
  return { pickup: m[1].trim(), dest: m[2].trim() };
}

function parseReserva(text) {
  // Formato: RESERVA: AAAA-MM-DD HH:MM | origen -> destino
  const m = text.match(/^\s*RESERVA\s*:\s*([^|]+?)\s*\|\s*(.+?)\s*(?:->|→| a )\s*(.+)$/i);
  if (!m) return null;
  return { when: m[1].trim(), pickup: m[2].trim(), dest: m[3].trim() };
}

function intentFromMessage(msg) {
  const text = (
    msg.text?.body ||
    msg.button?.text ||
    msg.interactive?.button_reply?.title ||
    msg.interactive?.list_reply?.title ||
    ''
  ).trim();

  const btnId = msg.interactive?.button_reply?.id;
  if (btnId === 'taxi_now') return { type: 'TAXI_BUTTON' };
  if (btnId === 'reserve')  return { type: 'RESERVA_BUTTON' };
  if (btnId === 'agent')    return { type: 'AGENTE_BUTTON' };

  if (/^\s*menu\s*$/i.test(text) || /^\s*hola\b/i.test(text)) return { type: 'MENU' };

  const t = parseTaxi(text);
  if (t) return { type: 'TAXI_TEXT', ...t };

  const r = parseReserva(text);
  if (r) return { type: 'RESERVA_TEXT', ...r };

  return { type: 'UNKNOWN' };
}

export default async function handler(req, res) {
  // Verificación GET + ping
  if (req.method === 'GET') {
    try {
      const url = parseUrl(req);
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');
      if (mode === 'subscribe' && token && challenge) {
        if (token === VERIFY_TOKEN) return res.status(200).send(challenge);
        return res.status(403).send('Token inválido');
      }
      return res.status(200).send('TAXICI webhook live');
    } catch (e) {
      console.error('GET error:', e);
      return res.status(500).send('GET error');
    }
  }

  // Recepción POST
  if (req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      if (body.object !== 'whatsapp_business_account') return res.status(200).end();

      const value = body.entry?.[0]?.changes?.[0]?.value;
      const messages = value?.messages || [];
      const phoneNumberId = value?.metadata?.phone_number_id;
      if (!phoneNumberId) return res.status(200).end();

      for (const msg of messages) {
        const from = msg.from;
        const intent = intentFromMessage(msg);

        switch (intent.type) {
          case 'MENU':
            await sendButtons(phoneNumberId, from);
            break;

          case 'TAXI_BUTTON':
            await sendText(
              phoneNumberId,
              from,
              '🚕 Pide tu taxi en *un solo mensaje*:\n\nTAXI: [origen] -> [destino]\n\nEjemplo:\nTAXI: Av. Constitución 1200, Col. Centro -> Aeropuerto Monterrey\n\nOpcional: personas y referencia.'
            );
            break;

          case 'RESERVA_BUTTON':
            await sendText(
              phoneNumberId,
              from,
              '🗓️ Haz tu reserva en *un solo mensaje*:\n\nRESERVA: AAAA-MM-DD HH:MM | [origen] -> [destino]\n\nEjemplo:\nRESERVA: 2025-08-10 07:30 | Calle 5 #321, Centro -> Terminal Ómnibus'
            );
            break;

          case 'AGENTE_BUTTON':
            await sendText(phoneNumberId, from, '👤 Un agente te atenderá en breve. Gracias.');
            break;

          case 'TAXI_TEXT': {
            const { pickup, dest } = intent;
            await sendText(
              phoneNumberId,
              from,
              `✅ *Solicitud recibida*\nOrigen: ${pickup}\nDestino: ${dest}\n\nEn minutos un operador confirmará la unidad.`
            );
            break;
          }

          case 'RESERVA_TEXT': {
            const { when, pickup, dest } = intent;
            await sendText(
              phoneNumberId,
              from,
              `✅ *Reserva registrada*\nFecha/hora: ${when}\nOrigen: ${pickup}\nDestino: ${dest}\n\nUn operador confirmará tu viaje.`
            );
            break;
          }

          default:
            await sendButtons(phoneNumberId, from);
        }
      }

      return res.status(200).end();
    } catch (e) {
      console.error('POST error:', e);
      return res.status(500).end();
    }
  }

  return res.status(405).send('Method Not Allowed');
}
