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
         content: `You are a highly controlled AI receptionist for a physiotherapy clinic.

You MUST follow this exact order and never deviate:

Step 1: Ask for full name
Step 2: Ask if they are a new or returning patient
Step 3: Ask what they need help with
Step 4: Ask preferred day/time
Step 5: Summarize and end call

Rules:
- Ask ONLY ONE question at a time
- NEVER repeat a question already answered
- NEVER go backwards in steps
- NEVER restart the conversation
- Keep responses SHORT (max 1 sentence)
- Speak naturally like a human receptionist
- Always finish your sentence cleanly
- Do NOT ask multiple questions at once

If the user already gave information, move to the NEXT step automatically.`
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
  <Gather input="speech" timeout="3" speechTimeout="auto" action="/call" method="POST">
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
