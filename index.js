import express from "express";
import OpenAI from "openai";

const app = express();
app.use(express.urlencoded({ extended: true }));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("AI Receptionist Running");
});

app.post("/call", async (req, res) => {
  const userInput = req.body.SpeechResult || "Hello";

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
You are a professional physiotherapy clinic receptionist.
You speak calmly, clearly, and naturally.
You help collect patient info and appointment requests.
Never give medical advice.
Ask one clear follow-up question at a time.
        `,
      },
      { role: "user", content: userInput },
    ],
  });

  const reply = completion.choices[0].message.content;

  const twiml = `
<Response>
  <Gather input="speech" timeout="5" speechTimeout="auto" action="/call" method="POST">
    <Say>${reply}</Say>
  </Gather>
</Response>
`;

  res.type("text/xml");
  res.send(twiml);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});
