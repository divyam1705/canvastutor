import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Get the Canvas API configuration
  const canvasApiUrl =
    process.env.CANVAS_API_URL || "https://canvas.instructure.com/api/v1";
  const canvasApiToken = process.env.CANVAS_API_TOKEN
    ? "Set (hidden)"
    : "Not set";
  const openaiApiKey = process.env.OPENAI_API_KEY ? "Set (hidden)" : "Not set";

  // Basic connectivity test
  let canvasApiTest = "Not tested";
  if (process.env.CANVAS_API_TOKEN) {
    try {
      const response = await fetch(`${canvasApiUrl}/courses`, {
        headers: {
          Authorization: `Bearer ${process.env.CANVAS_API_TOKEN}`,
        },
      });

      if (response.ok) {
        canvasApiTest = "Success";
      } else {
        canvasApiTest = `Failed: ${response.status} ${response.statusText}`;
      }
    } catch (error) {
      const err = error as Error;
      canvasApiTest = `Error: ${err.message}`;
    }
  }

  return NextResponse.json({
    config: {
      canvasApiUrl,
      canvasApiToken,
      openaiApiKey,
    },
    tests: {
      canvasApiTest,
    },
    environment: process.env.NODE_ENV,
  });
}
