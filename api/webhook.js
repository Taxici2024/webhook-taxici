module.exports = async (req, res) => {
  const VERIFY_TOKEN = "taxici_token_2025_2";

  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode && token) {
      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("WEBHOOK_VERIFICADO");
        return res.status(200).send(challenge);
      } else {
        return res.status(403).send("Token inválido");
      }
    }
    return res.status(400).send("Faltan parámetros");
  }

  if (req.method === "POST") {
    console.log("Mensaje recibido:", JSON.stringify(req.body, null, 2));
    return res.status(200).send("Mensaje recibido");
  }

  return res.status(405).send("Método no permitido");
};
