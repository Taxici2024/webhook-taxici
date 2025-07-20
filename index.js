const awsServerlessExpress = require("aws-serverless-express");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = "taxici_token_123";

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Verificado con éxito.");
    res.status(200).send(challenge);
  } else {
    console.log("❌ Falló la verificación.");
    res.sendStatus(403);
  }
});

app.post("/webhook", (req, res) => {
  console.log("📩 POST recibido:", JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

const server = awsServerlessExpress.createServer(app);

module.exports = (req, res) => {
  awsServerlessExpress.proxy(server, req, res);
};
