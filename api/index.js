const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Verificación del Webhook
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = "taxici_token_123"; // <-- Usa el mismo token que escribiste en Meta Developers

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK VERIFICADO EXITOSAMENTE");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// Manejo de mensajes entrantes
app.post("/webhook", (req, res) => {
  const body = req.body;

  console.log("🔔 MENSAJE RECIBIDO:");
  console.dir(body, { depth: null });

  if (body.object) {
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// Servidor en Vercel (sin necesidad de escuchar puerto si estás en Vercel)
app.listen(PORT, () => {
  console.log("Servidor webhook escuchando en el puerto", PORT);
});
