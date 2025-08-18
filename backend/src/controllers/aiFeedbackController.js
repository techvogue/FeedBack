// backend/src/controllers/aiFeedbackController.js
const { PrismaClient } = require("../../generated/prisma");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const prisma = new PrismaClient();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.getAISummary = async (req, res) => {
  try {
    const { eventId } = req.params;
    const responses = await prisma.feedbackResponse.findMany({
      where: { eventId },
      select: { answers: true },
    });
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    const feedbackForm = await prisma.feedbackForm.findUnique({
      where: { eventId },
    });

    if (!event || !feedbackForm) {
      return res.status(404).json({ message: "Event or form not found." });
    }

    if (responses.length === 0) {
      return res.json({
        summary: `📊 Feedback Summary for "${event.title}"

📈 Response Overview:
• No responses received yet
• ${feedbackForm.schema?.pages?.[0]?.elements?.length || 0} questions configured

💡 Next Steps:
• Share the feedback form with attendees
• Encourage participation
• Check back once responses are received

Note: AI insights will be available once feedback is submitted.`,
        aiStatus: 'no_data'
      });
    }

    // Process schema to extract questions
    const rawSchema = feedbackForm.schema;
    let schema = [];

    if (Array.isArray(rawSchema)) {
      schema = rawSchema;
    } else if (rawSchema && typeof rawSchema === "object") {
      if (Array.isArray(rawSchema.questions)) {
        schema = rawSchema.questions;
      } else if (rawSchema.pages && Array.isArray(rawSchema.pages[0]?.elements)) {
        schema = rawSchema.pages[0].elements;
      } else {
        schema = [];
      }
    }

    // Map responses to questions
    const questionMap = {};
    responses.forEach((resp) => {
      Object.entries(resp.answers).forEach(([qName, value]) => {
        if (!questionMap[qName]) questionMap[qName] = [];
        questionMap[qName].push(value);
      });
    });

    // Prepare questions for AI analysis
    const aiQuestions = schema.map((q, idx) => ({
      number: idx + 1,
      type: q.type,
      text: q.title || q.label || q.question,
      choices: q.choices ?? q.options ?? undefined,
      answers: questionMap[q.name] ?? [],
      rateMin: q.rateMin ?? undefined,
      rateMax: q.rateMax ?? undefined,
    }));

    const questionsBlock = aiQuestions
      .map(
        (q) =>
          `Q${q.number}: ${q.text} [${q.type}]
${q.choices ? "Options: " + q.choices.map(c => typeof c === 'object' ? c.text : c).join(", ") : ""}
${
  q.answers && q.answers.length
    ? q.answers.map((a) => "- " + a).join("\n")
    : "-"
}
`
      )
      .join("\n");

    // Create Gemini prompt
    const prompt = `
You are an AI assistant analyzing event feedback. Please provide a comprehensive analysis.

Event: "${event.title}"

QUESTIONS AND RESPONSES:
${questionsBlock}

Please provide a structured analysis with the following sections:

1. **Overall Sentiment**: Analyze the overall sentiment with specific reasons
2. **Positive Aspects**: List the top 3-5 positive aspects mentioned
3. **Areas for Improvement**: List the top 3-5 areas that need improvement
4. **Actionable Recommendations**: Provide 3-5 specific, actionable recommendations for organizers
5. **Key Insights**: Share 3 key takeaways from the feedback

Format your response in clear, professional English suitable for event organizers. Use bullet points and clear headings for each section.
`;

    try {
      // Use Gemini Flash model
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const summary = response.text();

      console.log("[Gemini Flash response received]");
      res.json({ 
        summary,
        aiStatus: 'success',
        model: 'gemini-1.5-flash'
      });
    } catch (geminiError) {
      console.error("[Gemini Flash error]", geminiError);
      
      // Fallback to basic summary
      const totalResponses = responses.length;
      const questionCount = aiQuestions.length;

      let positiveCount = 0;
      let negativeCount = 0;
      let neutralCount = 0;

      // Simple sentiment analysis based on rating questions
      aiQuestions.forEach((q) => {
        if (q.type === "rating") {
          q.answers.forEach((answer) => {
            const rating = parseInt(answer);
            if (rating >= 4) positiveCount++;
            else if (rating <= 2) negativeCount++;
            else neutralCount++;
          });
        }
      });

      const basicSummary = `
📊 Feedback Summary for "${event.title}"

📈 Response Overview:
• Total responses: ${totalResponses}
• Questions asked: ${questionCount}

🎯 Quick Insights:
${positiveCount > 0 ? `• Positive ratings: ${positiveCount}` : ""}
${negativeCount > 0 ? `• Areas for improvement: ${negativeCount}` : ""}
${neutralCount > 0 ? `• Neutral feedback: ${neutralCount}` : ""}

💡 Key Takeaways:
• ${totalResponses} attendees provided feedback
• ${questionCount} different aspects were evaluated
${
  positiveCount > negativeCount
    ? "• Overall sentiment appears positive"
    : negativeCount > positiveCount
    ? "• Some areas need attention"
    : "• Mixed feedback received"
}

🔧 Suggestions:
• Review detailed responses for specific improvement areas
• Consider follow-up surveys for deeper insights
• Share positive feedback with your team

Note: This is a basic summary. AI analysis is temporarily unavailable.
      `.trim();

      res.json({ 
        summary: basicSummary,
        aiStatus: 'fallback',
        error: geminiError.message
      });
    }
  } catch (e) {
    console.error("[AI summary error]", e);
    res.status(500).json({ 
      message: "AI summary failed", 
      error: e.message,
      aiStatus: 'error'
    });
  }
};
