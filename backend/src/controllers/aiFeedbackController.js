// backend/src/controllers/aiFeedbackController.js
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const axios = require('axios');

exports.getAISummary = async (req, res) => {
  try {
    const { eventId } = req.params;
    const responses = await prisma.feedbackResponse.findMany({ where: { eventId }, select: { answers: true } });
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    const feedbackForm = await prisma.feedbackForm.findUnique({ where: { eventId } });
    if (!event || !feedbackForm) return res.status(404).json({ message: "Event or form not found." });

    // Aggregate
    const schema = feedbackForm.schema?.questions || feedbackForm.schema;
    const questionMap = {};
    responses.forEach(resp => {
      Object.entries(resp.answers).forEach(([qName, value]) => {
        if (!questionMap[qName]) questionMap[qName] = [];
        questionMap[qName].push(value);
      });
    });
    const aiQuestions = schema.map((q, idx) => ({
      number: idx + 1,
      type: q.type,
      text: q.title || q.label || q.question,
      choices: q.choices ?? q.options ?? undefined,
      answers: questionMap[q.name] ?? [],
      rateMin: q.rateMin ?? undefined,
      rateMax: q.rateMax ?? undefined,
    }));
    const questionsBlock = aiQuestions.map(q =>
      `Q${q.number}: ${q.text} [${q.type}]
${q.choices ? "Options: " + (q.choices.join(", ")) : ""}
${q.answers && q.answers.length ? q.answers.map(a => "- " + a).join("\n") : "-"}
`).join("\n");

    const prompt = `
Event: "${event.title}"

QUESTIONS AND RESPONSES:
${questionsBlock}

TASK:
1. Summarize overall attendee sentiment (with reasons).
2. List most positive aspects.
3. List top negative aspects/complaints.
4. Give actionable suggestions for organizers (tailored for this event).
5. Provide 3 key takeaways.
Present in clear English for event organizers.
`;

    const ollamaResp = await axios.post("http://localhost:11434/api/generate", {
      model: "llama3",
      prompt,
      stream: false
    }, { timeout: 120_000 });

    const summary = ollamaResp.data.response || ollamaResp.data;
    res.json({ summary });
  } catch (e) {
    console.error("[AI summary error]", e);
    res.status(500).json({ message: "AI summary failed", error: e.message });
  }
};
