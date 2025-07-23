const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 3000;

// TOKEN DE VERIFICACIÓN PARA META
const VERIFY_TOKEN = "taxici_token_2025";

app.use(bodyParser.json());

// RUTA PARA VERIFICACIÓN DEL WEBHOOK
app.get("/webhook", (req, res) => {
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
});

// RUTA PARA RECIBIR MENSAJES DE WHATSAPP
app.post("/webhook", (req, res) => {
  console.log("📩 Recibido POST de webhook");
  const body = req.body;

  if (body.object === "whatsapp_business_account") {
    body.entry.forEach(entry => {
      const changes = entry.changes;
      changes.forEach(change => {
        const message = change.value?.messages?.[0];
        if (message) {
          console.log("📨 Mensaje recibido:", message);
        }
      });
    });
    res.sendStatus(200); // Confirmamos recepción a Meta
  } else {
    res.sendStatus(404);
  }
});

// INICIAR SERVIDOR
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
});
