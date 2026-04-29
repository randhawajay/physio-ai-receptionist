import express from "express";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.post("/call", (req, res) => {
  console.log("TWILIO HIT /call");

  res.type("text/xml");
  res.send(twiml);
<Response>
  <Say>Hello. Twilio is connected to Render successfully.</Say>
</Response>
`);
});
app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});
