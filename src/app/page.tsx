'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { CanvasCourse } from '@/types/canvas';

export default function Home() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState('');
  const [courses, setCourses] = useState<CanvasCourse[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCourses = async () => {
    if (!apiKey) {
      toast.error('Please enter your Canvas API key');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/courses?apiKey=${encodeURIComponent(apiKey)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch courses');
      }

      setCourses(data);
      toast.success('Courses fetched successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (courseId: number) => {
    router.push(`/courses/${courseId}?apiKey=${encodeURIComponent(apiKey)}`);
  };

  return (
    <main className="container mx-auto p-4 min-h-screen">
      <Toaster />
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="">
          <CardHeader>
            <CardTitle className="text-2xl">Canvas Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                type="password"
                placeholder="Enter your Canvas API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/70"
              />
              <Button
                onClick={fetchCourses}
                disabled={loading}
                className=""
              >
                {loading ? 'Loading...' : 'Fetch Courses'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {courses.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleCourseClick(course.id)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{course.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Course Code: {course.course_code}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Students: {course.total_students}
                  </p>
                  {course.start_at && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Start Date: {new Date(course.start_at).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
