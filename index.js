app.post("/call", async (req, res) => {
  res.type("text/xml");

  try {
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
`
        },
        { role: "user", content: userInput }
      ]
    });

    const reply = completion.choices[0].message.content;

    const twiml = `
<Response>
  <Gather input="speech" timeout="5" speechTimeout="auto" action="/call" method="POST">
    <Say>${reply}</Say>
  </Gather>
</Response>
`;

    res.send(twiml);

  } catch (error) {
    console.log("ERROR:", error);

    // 🔥 fallback so Twilio ALWAYS gets something
    res.send(`
<Response>
  <Say>
    Sorry, the system is currently unavailable. Please try again later.
  </Say>
</Response>
`);
  }
});
