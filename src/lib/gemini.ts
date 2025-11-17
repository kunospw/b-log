import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("Gemini API key is not set. AI features will not work.");
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

export interface GeneratedPost {
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
}

export async function generatePostContent(prompt: string): Promise<GeneratedPost> {
  if (!genAI) {
    throw new Error("Gemini API key is not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your environment variables.");
  }

  try {
    // Using gemini-2.0-flash model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const systemPrompt = `You are a helpful blog post generator. Generate a complete blog post based on the user's prompt. 
Return your response as a JSON object with the following structure:
{
  "title": "A catchy and engaging blog post title",
  "content": "The full blog post content (at least 300 words, well-formatted with paragraphs)",
  "excerpt": "A short 1-2 sentence summary of the post (max 150 characters)",
  "tags": ["tag1", "tag2", "tag3", "tag4"]
}

Make sure the content is well-written, informative, and engaging. The tags should be relevant to the topic.
Only return the JSON object, no additional text or markdown formatting.`;

    const result = await model.generateContent(`${systemPrompt}\n\nUser prompt: ${prompt}`);
    const response = await result.response;
    const text = response.text();

    // Clean up the response - remove markdown code blocks if present
    let jsonText = text.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "");
    }

    const generated = JSON.parse(jsonText) as GeneratedPost;

    // Validate and ensure all fields are present
    return {
      title: generated.title || "Untitled Post",
      content: generated.content || "",
      excerpt: generated.excerpt || generated.content?.slice(0, 150) + "..." || "",
      tags: Array.isArray(generated.tags) ? generated.tags : [],
    };
  } catch (error: any) {
    console.error("Error generating post content:", error);
    
    // Provide more specific error messages
    if (error?.message?.includes("404") || error?.message?.includes("not found")) {
      throw new Error("Model not found. Please check your API key and model availability.");
    }
    if (error?.message?.includes("API key")) {
      throw new Error("Invalid API key. Please check your NEXT_PUBLIC_GEMINI_API_KEY.");
    }
    if (error instanceof SyntaxError) {
      throw new Error("Failed to parse AI response. Please try again with a different prompt.");
    }
    
    throw new Error(error?.message || "Failed to generate post content. Please try again.");
  }
}

export async function summarizePost(content: string, maxLength: number = 200): Promise<string> {
  if (!genAI) {
    throw new Error("Gemini API key is not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your environment variables.");
  }

  if (!content.trim()) {
    throw new Error("Content cannot be empty.");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Summarize the following blog post content in a concise and engaging way. 
The summary should be approximately ${maxLength} characters or less, written as 2-3 sentences that capture the main points and key insights.

Blog post content:
${content}

Provide only the summary text, no additional formatting, labels, or markdown.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text().trim();

    // Ensure the summary doesn't exceed maxLength
    if (summary.length > maxLength) {
      return summary.slice(0, maxLength - 3) + "...";
    }

    return summary;
  } catch (error: any) {
    console.error("Error summarizing post:", error);
    
    // Provide more specific error messages
    if (error?.message?.includes("404") || error?.message?.includes("not found")) {
      throw new Error("Model not found. Please check your API key and model availability.");
    }
    if (error?.message?.includes("API key")) {
      throw new Error("Invalid API key. Please check your NEXT_PUBLIC_GEMINI_API_KEY.");
    }
    
    throw new Error(error?.message || "Failed to summarize post. Please try again.");
  }
}

