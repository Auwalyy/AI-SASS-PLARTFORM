// lib/serper.ts
export async function searchWeb(query: string) {
  const response = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": process.env.SERPER_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: query }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch from SerperAPI");
  }

  return await response.json();
}
