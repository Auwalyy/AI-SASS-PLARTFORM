 

// import { GoogleGenerativeAI } from "@google/generative-ai";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// export async function POST(req: Request) {
//   try {
//     // Validate request
//     const contentType = req.headers.get("content-type");
//     if (!contentType?.includes("application/json")) {
//       return new Response(JSON.stringify({ error: "Invalid content type" }), {
//         status: 400,
//         headers: { "Content-Type": "application/json" }
//       });
//     }

//     const body = await req.json();
    
//     // Validate message
//     if (!body?.message || typeof body.message !== "string") {
//       return new Response(JSON.stringify({ error: "Message is required" }), {
//         status: 400,
//         headers: { "Content-Type": "application/json" }
//       });
//     }

//     // Initialize model - using the latest stable model
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//     // Generate content
//     const result = await model.generateContent(body.message);
//     const response = await result.response;
//     const text = response.text();

//     return new Response(JSON.stringify({ message: text }), {
//       status: 200,
//       headers: { "Content-Type": "application/json" }
//     });

//   } catch (error: any) {
//     console.error("[GEMINI_API_ERROR]", error);
    
//     let status = 500;
//     let errorMessage = "Internal server error";

//     if (error.message.includes("model not found")) {
//       status = 404;
//       errorMessage = "AI model is currently unavailable";
//     } else if (error.message.includes("API key")) {
//       status = 401;
//       errorMessage = "Invalid API key configuration";
//     } else if (error.message.includes("quota")) {
//       status = 429;
//       errorMessage = "Too many requests. Please try again later.";
//     }

//     return new Response(JSON.stringify({ error: errorMessage }), {
//       status,
//       headers: { "Content-Type": "application/json" }
//     });
//   }
// }

 import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    // Validate request
    const body = await req.json();
    if (!body?.message) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Use correct model names for v1beta
    const model = genAI.getGenerativeModel({
      // Updated model names that work with v1beta
      model: "gemini-1.5-flash", // or "gemini-1.5-flash" for newer models
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1000
      }
    });

    const prompt = `Provide information about: ${body.message}\n` +
                  `Keep response accurate and concise.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return new Response(JSON.stringify({ 
      message: text,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("API Error:", error);

    // Handle model not found error specifically
    if (error?.message?.includes("is not found")) {
      return new Response(JSON.stringify({ 
        error: "Model unavailable",
        solution: "Please check available models or update your API version",
        documentation: "https://ai.google.dev/gemini-api/docs/models/gemini"
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Other error handling
    return new Response(JSON.stringify({ 
      error: "Failed to process request",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}