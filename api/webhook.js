
export default async function handler(req, res) {
  const VERIFY_TOKEN = "taxici_token_2025_2";

  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode && token) {
      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("WEBHOOK_VERIFIED");
        res.status(200).send(challenge);
        return;
      } else {
        return res.status(403).send("Token inválido");
      }
    } else {
      return res.status(400).send("Faltan parámetros");
    }
  }

  if (req.method === "POST") {
    console.log("Mensaje recibido:", JSON.stringify(req.body, null, 2));
    return res.status(200).send("Mensaje procesado");
  }

  return res.status(405).send("Método no permitido");
}
