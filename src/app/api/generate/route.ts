import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { moduleId, type, content } = await request.json();

    if (!moduleId || !type || !content) {
      return NextResponse.json(
        { error: "Missing required fields: moduleId, type, content" },
        { status: 400 }
      );
    }

    if (!["summary", "flashcards", "quiz"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be one of: summary, flashcards, quiz" },
        { status: 400 }
      );
    }

    // Different prompt templates based on content type
    let prompt = "";
    let responseFormat = "";

    switch (type) {
      case "summary":
        prompt = `Create a comprehensive summary of the following module content from a course. Focus on the main concepts, key points, and important takeaways. Make it educational and well-structured with headings and bullet points where appropriate.\n\nModule Content:\n${content}`;
        break;

      case "flashcards":
        prompt = `Create 10 educational flashcards for studying the following module content from a course. Each flashcard should have a 'front' with a question or concept, and a 'back' with the answer or explanation. Cover the most important concepts and ensure the content is accurate and educational.\n\nModule Content:\n${content}`;
        responseFormat = `Format your response as a valid JSON array of objects, each with 'front' and 'back' properties. Example:
[
  { "front": "What is X?", "back": "X is..." },
  { "front": "When was Y developed?", "back": "Y was developed in..." }
]`;
        break;

      case "quiz":
        prompt = `Create a 5-question multiple-choice quiz based on the following module content from a course. Each question should have 4 possible answers with only one correct answer. Make the questions educational, challenging but fair, and cover important concepts from the material.\n\nModule Content:\n${content}`;
        responseFormat = `Format your response as a valid JSON array of objects, each with 'question', 'options' (array of 4 strings), and 'correctAnswer' (index of correct option, 0-3) properties. Example:
[
  {
    "question": "What is X?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 2
  }
]`;
        break;
    }

    if (responseFormat) {
      prompt += `\n\n${responseFormat}`;
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert educational content creator specializing in creating high-quality study materials. Your responses should be accurate, educational, and tailored to help students learn effectively.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    const generatedContent = completion.choices[0]?.message?.content || "";

    return NextResponse.json({ content: generatedContent });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error generating content:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate content" },
      { status: 500 }
    );
  }
}
