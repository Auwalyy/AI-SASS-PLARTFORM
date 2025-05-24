import { HfInference } from "@huggingface/inference";
import { NextResponse } from "next/server";

export const runtime = "edge"; // Essential for Vercel deployments

// Initialize with your API key
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Validate input
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array required" },
        { status: 400 }
      );
    }

    // Process with Hugging Face
    const response = await hf.chatCompletion({
      model: "mistralai/Mistral-7B-Instruct-v0.1", // Free-tier friendly
      messages,
      max_tokens: 800,
    });

    return NextResponse.json({
      content: response.choices[0].message.content,
    });

  } catch (error: any) {
    console.error("HF API Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate response",
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Explicitly handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}