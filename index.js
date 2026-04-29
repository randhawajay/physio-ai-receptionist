import express from "express";

const app = express();

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("AI Receptionist Running");
});

app.post("/call", (req, res) => {
  console.log("TWILIO HIT /call");

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Hello. Twilio is connected to Render successfully.</Say>
</Response>`;

  res.type("text/xml");
  res.send(twiml);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});
