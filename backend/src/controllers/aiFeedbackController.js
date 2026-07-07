// backend/src/controllers/aiFeedbackController.js
const prisma = require("../prismaClient");
const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.getAISummary = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        ownerId: true,
        feedbackForm: {
          select: {
            schema: true,
          },
        },
      },
    });

    if (!event || !event.feedbackForm) {
      return res.status(404).json({ message: "Event or form not found." });
    }

    if (event.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const responses = await prisma.feedbackResponse.findMany({
      where: { eventId },
      select: { answers: true },
    });

    if (responses.length === 0) {
      return res.json({
        summary: `📊 Feedback Summary for "${event.title}"

📈 Response Overview:
• No responses received yet
      • ${event.feedbackForm.schema?.pages?.[0]?.elements?.length || 0} questions configured

💡 Next Steps:
• Share the feedback form with attendees
• Encourage participation
• Check back once responses are received

Note: AI insights will be available once feedback is submitted.`,
        aiStatus: "no_data",
      });
    }

    // Process schema to extract questions
    const rawSchema = event.feedbackForm.schema;
    let schema = [];

    if (Array.isArray(rawSchema)) {
      schema = rawSchema;
    } else if (rawSchema && typeof rawSchema === "object") {
      if (Array.isArray(rawSchema.questions)) {
        schema = rawSchema.questions;
      } else if (
        rawSchema.pages &&
        Array.isArray(rawSchema.pages[0]?.elements)
      ) {
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
${q.choices ? "Options: " + q.choices.map((c) => (typeof c === "object" ? c.text : c)).join(", ") : ""}
${
  q.answers && q.answers.length
    ? q.answers.map((a) => "- " + a).join("\n")
    : "-"
}
`,
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
      const geminiApiKey =
        process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
      if (!geminiApiKey) {
        throw new Error("GEMINI_API_KEY not configured");
      }

      const genAI = new GoogleGenerativeAI(geminiApiKey);
      let summary;
      let usedModel = "gemini-1.5-flash";

      try {
        // Dynamically fetch available models to avoid 404 errors with different keys
        const axios = require('axios');
        const modelsRes = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiApiKey}`);
        
        // Find the first model that supports generateContent and contains 'flash' or 'pro'
        const availableModels = modelsRes.data.models || [];
        const validModel = availableModels.find(m => 
          m.supportedGenerationMethods?.includes('generateContent') &&
          m.name.includes('gemini')
        );

        if (validModel) {
          // m.name looks like "models/gemini-1.5-flash", we just need the end part
          usedModel = validModel.name.replace('models/', '');
          console.log(`[Gemini] Auto-detected supported model: ${usedModel}`);
        } else {
          console.log(`[Gemini] No valid model found in API response, defaulting to gemini-1.5-flash`);
        }

        const model = genAI.getGenerativeModel({ model: usedModel });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        summary = response.text();
      } catch (firstError) {
        console.error(`[Gemini] Core generation failed with ${usedModel}:`, firstError.message);
        throw firstError; // Throw so it triggers the fallback UI
      }

      console.log(`[Gemini response received via ${usedModel}]`);
      res.json({
        summary,
        aiStatus: "success",
        model: usedModel,
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
        aiStatus: "fallback",
        error: geminiError.message,
      });
    }
  } catch (e) {
    next(e);
  }
};
