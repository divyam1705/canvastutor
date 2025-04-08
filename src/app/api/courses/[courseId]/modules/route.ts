import { NextResponse } from "next/server";
import { CanvasModule, CanvasAPIError } from "@/types/canvas";

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  const { searchParams } = new URL(request.url);
  const apiKey = searchParams.get("apiKey");
  const courseId = params.courseId;

  if (!apiKey) {
    return NextResponse.json({ error: "API key is required" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_CANVAS_API_URL}/courses/${courseId}/modules`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      const error: CanvasAPIError = await response.json();
      return NextResponse.json(
        { error: error.errors[0]?.message || "Failed to fetch modules" },
        { status: response.status }
      );
    }

    const modules: CanvasModule[] = await response.json();
    return NextResponse.json(modules);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch modules" },
      { status: 500 }
    );
  }
}
