import { NextResponse } from "next/server";
import { CanvasCourse, CanvasAPIError } from "@/types/canvas";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const apiKey = searchParams.get("apiKey");

  if (!apiKey) {
    return NextResponse.json({ error: "API key is required" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_CANVAS_API_URL}/courses?enrollment_state=active`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      const error: CanvasAPIError = await response.json();
      return NextResponse.json(
        { error: error.errors[0]?.message || "Failed to fetch courses" },
        { status: response.status }
      );
    }

    const courses: CanvasCourse[] = await response.json();
    return NextResponse.json(courses);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
