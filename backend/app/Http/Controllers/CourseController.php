<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    /**
     * List all courses with student counts and optional search
     */
    public function index(Request $request)
    {
        $query = Course::withCount('students');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('course_name', 'like', "%{$search}%")
                  ->orWhere('course_code', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $courses = $query->orderBy('course_name', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $courses,
        ]);
    }

    /**
     * Store new course
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'course_name' => 'required|string|max:150|unique:courses,course_name',
            'course_code' => 'required|string|max:30|unique:courses,course_code',
            'description' => 'nullable|string',
            'duration' => 'nullable|string|max:50',
            'fees' => 'required|numeric|min:0',
            'status' => 'required|in:Active,Inactive',
        ]);

        $course = Course::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Course created successfully.',
            'data' => $course,
        ], 201);
    }

    /**
     * Display course details
     */
    public function show($id)
    {
        $course = Course::withCount('students')
            ->with(['students:id,student_code,full_name,email,status,course_id'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $course,
        ]);
    }

    /**
     * Update course
     */
    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);

        $validated = $request->validate([
            'course_name' => "sometimes|required|string|max:150|unique:courses,course_name,{$id}",
            'course_code' => "sometimes|required|string|max:30|unique:courses,course_code,{$id}",
            'description' => 'nullable|string',
            'duration' => 'nullable|string|max:50',
            'fees' => 'sometimes|required|numeric|min:0',
            'status' => 'sometimes|required|in:Active,Inactive',
        ]);

        $course->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Course updated successfully.',
            'data' => $course,
        ]);
    }

    /**
     * Delete course with foreign-key business rule protection
     */
    public function destroy($id)
    {
        $course = Course::withCount('students')->findOrFail($id);

        // Business Rule: Prevent deletion if students are assigned
        if ($course->students_count > 0) {
            return response()->json([
                'success' => false,
                'message' => "Cannot delete course '{$course->course_name}' because {$course->students_count} student(s) are currently enrolled in it. Please reassign or graduate students before removing this course.",
            ], 422);
        }

        $course->delete();

        return response()->json([
            'success' => true,
            'message' => 'Course deleted successfully.',
        ]);
    }
}
