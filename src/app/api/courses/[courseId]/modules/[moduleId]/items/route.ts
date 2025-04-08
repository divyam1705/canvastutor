import { NextResponse } from "next/server";
import { CanvasModuleItem, CanvasAPIError } from "@/types/canvas";

type Params = {
  courseId: string;
  moduleId: string;
};
export async function GET(request: Request, { params }: { params: Params }) {
  const { courseId, moduleId } = params;
  const { searchParams } = new URL(request.url);
  const apiKey = searchParams.get("apiKey");

  if (!apiKey) {
    return NextResponse.json({ error: "API key is required" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_CANVAS_API_URL}/courses/${courseId}/modules/${moduleId}/items`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      const error: CanvasAPIError = await response.json();
      return NextResponse.json(
        { error: error.errors[0]?.message || "Failed to fetch module items" },
        { status: response.status }
      );
    }

    const items: CanvasModuleItem[] = await response.json();
    return NextResponse.json(items);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch module items" },
      { status: 500 }
    );
  }
}
