import { NextResponse } from "next/server";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function GET() {
  console.log("\n========================================");
  console.log("[TEST] Testing OpenRouter API Connection");
  console.log("========================================\n");
  
  const apiKey = process.env.OPENROUTER_API_KEY;
  
  console.log("[TEST] API Key configured:", !!apiKey);
  console.log("[TEST] API Key prefix:", apiKey?.substring(0, 15) + "...");
  
  if (!apiKey || apiKey === "your_openrouter_api_key_here") {
    return NextResponse.json({
      success: false,
      error: "API key not configured",
      keyStatus: "missing or placeholder"
    });
  }

  try {
    console.log("[TEST] Making test request to OpenRouter...");
    
    // Try multiple free models in order
    const models = [
      "google/gemma-2-9b-it:free",
      "mistralai/mistral-7b-instruct:free",
      "huggingfaceh4/zephyr-7b-beta:free"
    ];
    
    let response;
    let usedModel = "";
    
    for (const model of models) {
      console.log(`[TEST] Trying model: ${model}`);
      response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "vettcode Test"
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "user", content: "Say 'API working!' in 3 words or less." }
          ],
          max_tokens: 20
        })
      });
      
      if (response.ok) {
        usedModel = model;
        break;
      }
      console.log(`[TEST] Model ${model} failed with status: ${response.status}`);
    }

    console.log("[TEST] Response status:", response?.status);
    
    if (!response || !response.ok) {
      const errorText = response ? await response.text() : "No response from any model";
      return NextResponse.json({
        success: false,
        error: `All models failed. Last status: ${response?.status || 'N/A'}`,
        response: errorText.substring(0, 500),
        keyPrefix: apiKey.substring(0, 15) + "...",
        triedModels: models
      });
    }

    const responseText = await response.text();
    console.log("[TEST] Response body:", responseText.substring(0, 500));

    const data = JSON.parse(responseText);
    const message = data.choices?.[0]?.message?.content || "No response";
    
    console.log("[TEST] AI Response:", message);
    
    return NextResponse.json({
      success: true,
      message: message,
      model: usedModel || data.model,
      keyPrefix: apiKey.substring(0, 15) + "..."
    });
    
  } catch (error: any) {
    console.error("[TEST] Error:", error?.message || error);
    
    return NextResponse.json({
      success: false,
      error: error?.message || "Unknown error",
      type: error?.constructor?.name
    });
  }
}
