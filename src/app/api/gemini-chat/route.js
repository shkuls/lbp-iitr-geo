import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a highly knowledgeable scientific AI assistant. Your purpose is to:
- Provide accurate, detailed scientific explanations
- Help users understand complex scientific concepts
- Reference relevant scientific research and theories
- Maintain scientific accuracy while being accessible
- Correct misconceptions with evidence-based information
- Use analogies and examples to explain difficult concepts
- Stay up-to-date with current scientific understanding
- Keep responses concise and to the point
- keep all responses in proper raw markdown format using the following format:

# Heading 1
## Heading 2
### Heading 3

**Bold Text**
*Italic Text*

[Link Text](https://www.example.com)

1. List Item 1
2. List Item 2
3. List Item 3

> Blockquote Text   










Please maintain a professional, educational tone while being engaging and clear in your responses.`;

export async function POST(req) {
  try {
    const { message, history = [] } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "No message provided." }, { status: 400 });
    }

    const apiKey = "AIzaSyDq2kEy5bcrdgWr5a7Z_dGsdFHajUFXHO8";
    if (!apiKey) {
      console.error("Gemini API key is missing");
      return NextResponse.json({ error: "API configuration error" }, { status: 500 });
    }

    // Prepare conversation history for Gemini
    const geminiHistory = history.map(msg => ({
      role: msg.sender === "Gemini AI" ? "model" : "user",
      parts: [{ text: msg.text }]
    }));

    // Create request payload for Gemini with system prompt
    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: SYSTEM_PROMPT }]
        },
        ...geminiHistory,
        {
          role: "user",
          parts: [{ text: message }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
        topP: 0.8,
        topK: 40,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);
      return NextResponse.json(
        { error: "Failed to get response from AI" },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Extract the AI's response text
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error("Error in Gemini API route:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
} 