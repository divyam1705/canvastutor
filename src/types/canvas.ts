export interface CanvasCourse {
  id: number;
  name: string;
  course_code: string;
  enrollment_term_id: number;
  start_at: string | null;
  end_at: string | null;
  total_students: number;
  is_public: boolean;
  workflow_state: string;
}

export interface CanvasModule {
  id: number;
  name: string;
  position: number;
  items_count: number;
  items_url: string;
  items: CanvasModuleItem[];
}

export interface CanvasModuleItem {
  id: number;
  title: string;
  type: string;
  content_id: number;
  html_url: string;
  page_url?: string;
  external_url?: string;
  completion_requirement?: {
    type: string;
    min_score?: number;
  };
}

export interface CanvasAPIError {
  errors: {
    message: string;
  }[];
}
