import { buffer } from 'micro';

export const config = {
  api: {
    bodyParser: false,
  },
};

const VERIFY_TOKEN = "taxici_token_123";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("✅ Verificado con éxito.");
      res.status(200).send(challenge);
    } else {
      console.log("❌ Token inválido.");
      res.status(403).send("Token inválido");
    }
  } else if (req.method === "POST") {
    const rawBody = await buffer(req);
    const body = JSON.parse(rawBody.toString("utf8"));

    console.log("📩 POST recibido:", JSON.stringify(body, null, 2));
    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
