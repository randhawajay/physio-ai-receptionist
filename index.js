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
  console.log("TWILIO HIT /call");

  res.type("text/xml");

  try {
    const userInput = req.body.SpeechResult || "Hello";

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a calm, professional AI phone receptionist for a physiotherapy clinic.

Your job:
- greet callers naturally
- collect their full name
- ask if they are a new or returning patient
- ask what they need help with
- ask what day/time they prefer
- never give medical advice
- if they mention severe pain, chest pain, trouble breathing, numbness, major injury, or emergency symptoms, tell them to contact emergency services or clinic staff immediately
- ask only ONE question at a time
- keep replies short and natural for a phone call`
        },
        {
          role: "user",
          content: userInput
        }
      ]
    });

    const reply = completion.choices[0].message.content;

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" timeout="5" speechTimeout="auto" action="/call" method="POST">
    <Say>${reply}</Say>
  </Gather>
</Response>`;

    res.send(twiml);
  } catch (error) {
    console.log("OPENAI ERROR:", error);

    const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Sorry, the system is currently unavailable. Please try again later.</Say>
</Response>`;

    res.send(fallback);
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});
