import express from "express";
import OpenAI from "openai";

const app = express();
app.use(express.urlencoded({ extended: true }));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// memory per call
const conversations = new Map();

function escapeXml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

app.get("/", (req, res) => {
  res.send("AI Receptionist Running");
});

app.post("/call", async (req, res) => {
  console.log("TWILIO HIT /call");

  res.type("text/xml");

  const callSid = req.body.CallSid;
  const userInput = req.body.SpeechResult;

  // FIRST TIME CALL → initialize memory
  if (!conversations.has(callSid)) {
    conversations.set(callSid, {
      step: 1,
      data: {}
    });
  }

  const convo = conversations.get(callSid);

  // STORE USER ANSWERS BASED ON STEP
  if (userInput) {
    if (convo.step === 1) {
      convo.data.name = userInput;
      convo.step = 2;
    } else if (convo.step === 2) {
      convo.data.type = userInput;
      convo.step = 3;
    } else if (convo.step === 3) {
      convo.data.issue = userInput;
      convo.step = 4;
    } else if (convo.step === 4) {
      convo.data.time = userInput;
      convo.step = 5;
    }
  }

  let reply = "";

  // CONTROLLED FLOW (NO AI GUESSING)
  if (convo.step === 1) {
    reply = "Thanks for calling Apex Physio Clinic. May I get your full name?";
  }

  else if (convo.step === 2) {
    reply = `Thanks ${convo.data.name}. Are you a new or returning patient?`;
  }

  else if (convo.step === 3) {
    reply = "What can we help you with today?";
  }

  else if (convo.step === 4) {
    reply = "What day and time works best for you?";
  }

  else if (convo.step === 5) {
    reply = `Perfect. Just to confirm, your name is ${convo.data.name}, you are a ${convo.data.type} patient, and you need help with ${convo.data.issue}. You prefer ${convo.data.time}. Our team will contact you shortly. Thank you for calling.`;

    // reset after finishing
    conversations.delete(callSid);
  }

  const safeReply = escapeXml(reply);

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" timeout="3" speechTimeout="auto" action="/call" method="POST">
    <Say>${safeReply}</Say>
  </Gather>
</Response>`;

  res.send(twiml);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});
