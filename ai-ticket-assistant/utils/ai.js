import { createAgent, gemini } from "@inngest/agent-kit";

const analyzeTicket = async (ticket) => {
  try {
    const supportAgent = createAgent({
      model: gemini({
        model: "gemini-1.5-flash-8b",
        apiKey: process.env.GEMINI_API_KEY,
      }),
      name: "AI Ticket Triage Assistant",
      system: `You are an expert AI assistant that processes technical support tickets. 

Your job is to:
1. Summarize the issue.
2. Estimate its priority.
3. Provide helpful notes and resource links for human moderators.
4. List relevant technical skills required.

IMPORTANT:
- Respond with *only* valid raw JSON.
- Do NOT include markdown, code fences, comments, or any extra formatting.
- The format must be a raw JSON object with the following structure:
{
  "summary": "Short summary of the ticket",
  "priority": "low|medium|high",
  "helpfulNotes": "Detailed technical explanation",
  "relatedSkills": ["skill1", "skill2"]
}`,
    });
    
    const response = await supportAgent.run(
      `Analyze this support ticket and return ONLY a JSON object with no extra text:

Title: ${ticket.title}
Description: ${ticket.description}

Remember: Return ONLY the raw JSON object with no markdown, no code fences, no extra text.`
    );

    
    // Check if response has the expected structure
    if (!response || !response.output || !Array.isArray(response.output) || response.output.length === 0) {
      throw new Error("Invalid response structure from AI agent");
    }

    const firstOutput = response.output[0];
    // Try different possible response formats
    let raw = null;
    if (firstOutput.context) {
      raw = firstOutput.context;
    } else if (firstOutput.content) {
      raw = firstOutput.content;
    } else if (firstOutput.text) {
      raw = firstOutput.text;
    } else if (typeof firstOutput === 'string') {
      raw = firstOutput;
    } else {
      throw new Error("Could not find response content in AI output");
    }


    // Handle code fence format if present
    let jsonString = raw;
    if (raw.includes('```json')) {
      const match = raw.match(/```json\s*([\s\S]*?)\s*```/);
      if (match) {
        jsonString = match[1].trim();
      }
    } else if (raw.includes('```')) {
      // Handle generic code fences
      const match = raw.match(/```\s*([\s\S]*?)\s*```/);
      if (match) {
        jsonString = match[1].trim();
      }
    }


    // Try to parse the JSON string
    const result = JSON.parse(jsonString);

    // Validate the response structure
    if (!result.summary || !result.priority || !result.helpfulNotes || !Array.isArray(result.relatedSkills)) {
      throw new Error("Invalid response structure");
    }

    // Ensure priority is valid
    result.priority = result.priority.toLowerCase();
    if (!["low", "medium", "high"].includes(result.priority)) {
      result.priority = "medium";
    }

    return result;

  } catch (e) {
    console.error("[AI] Error analyzing ticket:", e.message);
    console.error("[AI] Error details:", e);
    
    // Return a default response instead of null
    return {
      summary: `Failed to analyze ticket: ${ticket.title}`,
      priority: "medium",
      helpfulNotes: "AI analysis failed. Please review the ticket manually.",
      relatedSkills: ["support", "troubleshooting"]
    };
  }
};

export default analyzeTicket;
