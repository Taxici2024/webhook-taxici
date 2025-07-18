const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
"

// Token de verificación (el mismo que usaste en Meta)
const VERIFY_TOKEN = "taxici_token_123";

// Token de acceso temporal (de tu app en Meta Developers)
const ACCESS_TOKEN = 
// ✅ Ruta GET para verificar el webhook con Meta
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];const ACCESS_TOKEN = "EAA6dsGcGvsEBPLuQ2Wn7PJcNqnhKZBfzHetZCF22AOtZBCGkJp0O51YYHK712if50X8GhVcazyRNTqQ3b8409B4a70l49ZBVdU2vQu8nVYmqjfhMLuvJnVXYZA6y3uEjg2JjVOttU4oHF8YNaN1lw10R3CDCwayRJ4xwulfpzRZCEfchJSyBtl6RZAaUZAZBkZAi3dMLSZB7ReZAfVZAh5eoZA3ww7E24zYvFgq3N5w4Ds";

  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("✅ WEBHOOK VERIFICADO EXITOSAMENTE");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// ✅ Ruta POST para recibir y responder mensajes
app.post("/webhook", async (req, res) => {
  const body = req.body;

  // Verifica que sea un mensaje real de WhatsApp
  if (body.object && body.entry && body.entry[0].changes) {
    const changes = body.entry[0].changes[0];
    const value = changes.value;

    if (
      value.messages &&
      value.messages[0] &&
      value.messages[0].from &&
      value.messages[0].text
    ) {
      const phoneNumberId = value.metadata.phone_number_id;
      const from = value.messages[0].from; // Número del usuario
      const msgBody = value.messages[0].text.body; // Mensaje del usuario

      console.log("📨 Mensaje recibido de:", from);
      console.log("📄 Contenido:", msgBody);

      // ✅ Enviar respuesta automática
      try {
        await axios({
          method: "POST",
          url: `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ACCESS_TOKEN}`,
          },
          data: {
            messaging_product: "whatsapp",
            to: from,
            text: { body: "Hola 👋, gracias por contactar a TaxCi. ¿Cómo podemos ayudarte?" },
          },
        });

        console.log("✅ Respuesta enviada al usuario.");
      } catch (error) {
        console.error("❌ Error al enviar respuesta:", error.response?.data || error.message);
      }
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// Solo necesario si corres localmente, Vercel no usa este puerto directamente
app.listen(PORT, () => {
  console.log("🚀 Servidor webhook escuchando en el puerto", PORT);
});
