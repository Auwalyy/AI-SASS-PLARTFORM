import { GoogleGenerativeAI } from "@google/generative-ai";
import { searchWeb } from "@/lib/serper";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Conversation memory with enhanced context
const conversationContext: Record<string, {
  lastQuery: string;
  lastResponse: string;
  searchResults?: string;
}> = {};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query = body.message.trim();
    const sessionId = body.sessionId || 'default';

    if (!query) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Initialize context for this session
    if (!conversationContext[sessionId]) {
      conversationContext[sessionId] = {
        lastQuery: '',
        lastResponse: '',
        searchResults: ''
      };
    }

    const context = conversationContext[sessionId];

    // Handle "more details" requests
    if (query.toLowerCase().includes("more details") && context.lastQuery) {
      const enhancedPrompt = `The user requested more details about:\n"${context.lastQuery}"\n\n` +
        `Your previous response was:\n"${context.lastResponse}"\n\n` +
        `Available search context:\n${context.searchResults || "No additional search results"}\n\n` +
        `Please provide a more detailed response with additional insights, facts, and context:`;

      const detailModel = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.7, // More creative for detailed responses
          maxOutputTokens: 2048,
        },
      });

      const detailResult = await detailModel.generateContent(enhancedPrompt);
      const detailResponse = await detailResult.response;
      const detailText = detailResponse.text();

      // Update context with the detailed response
      context.lastResponse = detailText;

      return new Response(JSON.stringify({
        message: detailText,
        timestamp: new Date().toISOString(),
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // For new queries, perform fresh search and generate response
    const searchData = await searchWeb(query);
    const topResults = searchData.organic?.slice(0, 3).map((r: any) =>
      `- ${r.title}\n${r.snippet}\nURL: ${r.link}`
    ).join("\n\n");

    const fullPrompt = `Generate a comprehensive response to: "${query}"\n\n` +
      `Current date: ${new Date().toISOString()}\n\n` +
      `Relevant search results:\n${topResults || "No results found"}\n\n` +
      `Combine the most accurate information from these sources with your own knowledge ` +
      `to create a well-structured response. Include key facts, dates, and context. ` +
      `If there are conflicting information sources, note this and provide the most ` +
      `likely accurate version based on source reliability.`;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.4, // Balanced for accuracy
        maxOutputTokens: 1024,
      },
    });

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    // Update conversation context
    context.lastQuery = query;
    context.lastResponse = text;
    context.searchResults = topResults;

    return new Response(JSON.stringify({
      message: text,
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("[ERROR]", error);
    return new Response(JSON.stringify({
      error: "Internal error",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}