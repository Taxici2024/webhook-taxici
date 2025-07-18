const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

const VERIFY_TOKEN = "taxici_token_123"; // Debe coincidir con el de Meta
const ACCESS_TOKEN = ""; // 👈 Reemplaza"EAA6dsGcGvsEBPEZCBDJBEt3Q0w4U7IJHnUZCveGTA5MvWRsiG9GlvkUNNipIyFLfTogrG8jBlHn3mNGJEdlwvZBARzbGsn7dZAC1ZAekgf2EWuLXPMUpmSmchL5imLsvsd9r0ppsZAZCx6kAig2bSU6gnsLuBSPHjdp7MZCLCAg2wdD9x9KiEvmaqkLugj2eSZAuEQqnYzNmwmgG6BonZCKnNBt0vVMKqRtHiGTaC7IwZDZD" esto con tu token real

// Verificación del Webhook
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("✅ WEBHOOK VERIFICADO");
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }
});

// Manejo de mensajes entrantes
app.post("/webhook", async (req, res) => {
  const body = req.body;

  console.log("🔔 MENSAJE RECIBIDO:");
  console.dir(body, { depth: null });

  if (body.object) {
    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    const phone_number_id = body.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id;
    const from = message?.from;
    const msg_body = message?.text?.body;

    if (message && from) {
      console.log(`📨 Mensaje de ${from}: ${msg_body}`);

      // Enviar respuesta automática
      await axios.post(`https://graph.facebook.com/v18.0/${phone_number_id}/messages`, {
        messaging_product: "whatsapp",
        to: from,
        text: { body: "Hola 👋, soy tu asistente de Taxi. ¿Qué deseas solicitar?" }
      }, {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      });

      console.log("✅ Respuesta enviada");
    }

    return res.sendStatus(200);
  } else {
    return res.sendStatus(404);
  }
});

app.listen(PORT, () => {
  console.log("🚀 Servidor webhook escuchando en el puerto", PORT);
});
