import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { pageUrl } = await request.json();

    const { searchParams } = new URL(request.url);
    const canvasApiKey = searchParams.get("apiKey");
    console.log(canvasApiKey);

    if (!canvasApiKey) {
      return NextResponse.json(
        { error: "Canvas API token is not configured" },
        { status: 500 }
      );
    }

    if (!pageUrl) {
      return NextResponse.json(
        { error: "Page URL is required" },
        { status: 400 }
      );
    }

    // Fetch the content from Canvas API
    const response = await fetch(pageUrl, {
      headers: {
        Authorization: `Bearer ${canvasApiKey}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Failed to fetch content: ${response.statusText}`,
          status: response.status,
          url: pageUrl,
        },
        { status: response.status }
      );
    }

    // Parse the response as JSON
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error fetching content:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch content" },
      { status: 500 }
    );
  }
}
