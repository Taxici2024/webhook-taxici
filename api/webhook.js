module.exports = (req, res) => {
  const VERIFY_TOKEN = "taxici_token_2025_2";

  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode && token) {
      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("✅ WEBHOOK VERIFICADO");
        res.status(200).send(challenge);
      } else {
        console.log("❌ TOKEN INVÁLIDO");
        res.sendStatus(403);
      }
    } else {
      res.sendStatus(400);
    }
  } else if (req.method === "POST") {
    // Aquí recibirás los mensajes reales de WhatsApp
    console.log("📩 Evento recibido:", req.body);
    res.sendStatus(200);
  } else {
    res.sendStatus(405); // Method Not Allowed
  }
};
