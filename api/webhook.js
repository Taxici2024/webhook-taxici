
const express = require("express");
const bodyParser = require("body-parser");

const app = express().use(bodyParser.json());
const PORT = process.env.PORT || 3000;

app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = "taxici_token_123";

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("✅ Verificado con éxito.");
      res.status(200).send(challenge); // Esto es lo que Meta espera
    } else {
      console.log("❌ Token incorrecto.");
      res.sendStatus(403);
    }
  } else {
    console.log("❌ Faltan parámetros.");
    res.sendStatus(400);
  }
});

// POST para mensajes
app.post("/webhook", (req, res) => {
  const body = req.body;
  console.log("📩 POST recibido:", JSON.stringify(body, null, 2));

  if (body.object) {
    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

app.listen(PORT, () => {
  console.log("✅ Servidor corriendo en puerto", PORT);
});
