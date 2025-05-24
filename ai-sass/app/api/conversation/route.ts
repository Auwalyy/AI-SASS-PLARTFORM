import { GoogleGenerativeAI } from "@google/generative-ai";
import { searchWeb } from "@/lib/serper";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query = body.message;

    if (!query) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 1. Fetch real-time web data
    const searchData = await searchWeb(query);
    const topResults = searchData.organic?.slice(0, 3).map((r: any) =>
      `- ${r.title}\n${r.snippet}\nURL: ${r.link}`
    ).join("\n\n");

    // 2. Construct context-rich prompt
    const prompt = `User question: ${query}\n\n` +
      `Here are the most recent search results:\n${topResults}\n\n` +
      `Based on the information above and your own knowledge, provide a concise and clear answer:`;

    // 3. Use Gemini to generate the final response
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1024,
      },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

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
