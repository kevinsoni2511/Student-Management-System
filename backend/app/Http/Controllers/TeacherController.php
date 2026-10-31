<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use Illuminate\Http\Request;
use Carbon\Carbon;

class TeacherController extends Controller
{
    /**
     * List all faculty members with search and status filters
     */
    public function index(Request $request)
    {
        $schoolId = $request->user()->school_id ?? 1;

        $query = Teacher::where('school_id', $schoolId);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('employee_id', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('qualification', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $teachers = $query->orderBy('name', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $teachers,
        ]);
    }

    /**
     * Store new faculty teacher
     */
    public function store(Request $request)
    {
        $schoolId = $request->user()->school_id ?? 1;

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'email' => 'nullable|email|max:150',
            'phone' => 'required|string|max:30',
            'gender' => 'required|in:Male,Female,Other',
            'date_of_birth' => 'nullable|date',
            'qualification' => 'nullable|string|max:150',
            'experience' => 'nullable|string|max:100',
            'joining_date' => 'required|date',
            'salary' => 'nullable|numeric|min:0',
            'status' => 'required|in:Active,Inactive,On Leave',
            'employee_id' => 'nullable|string|max:50',
        ]);

        if (empty($validated['employee_id'])) {
            $year = Carbon::parse($validated['joining_date'])->format('Y');
            $count = Teacher::where('school_id', $schoolId)->count() + 1;
            $validated['employee_id'] = sprintf('TCH-%s-%03d', $year, $count);
        }

        $teacher = Teacher::create([
            ...$validated,
            'school_id' => $schoolId,
            'salary' => $validated['salary'] ?? 0.00,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Teacher {$teacher->name} added successfully (ID: {$teacher->employee_id}).",
            'data' => $teacher,
        ], 201);
    }

    /**
     * Show teacher profile
     */
    public function show(Request $request, $id)
    {
        $schoolId = $request->user()->school_id ?? 1;
        $teacher = Teacher::where('school_id', $schoolId)->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $teacher,
        ]);
    }

    /**
     * Update teacher details
     */
    public function update(Request $request, $id)
    {
        $schoolId = $request->user()->school_id ?? 1;
        $teacher = Teacher::where('school_id', $schoolId)->findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'email' => 'nullable|email|max:150',
            'phone' => 'required|string|max:30',
            'gender' => 'required|in:Male,Female,Other',
            'date_of_birth' => 'nullable|date',
            'qualification' => 'nullable|string|max:150',
            'experience' => 'nullable|string|max:100',
            'joining_date' => 'required|date',
            'salary' => 'nullable|numeric|min:0',
            'status' => 'required|in:Active,Inactive,On Leave',
        ]);

        $teacher->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Teacher record updated successfully.',
            'data' => $teacher,
        ]);
    }

    /**
     * Remove teacher
     */
    public function destroy(Request $request, $id)
    {
        $schoolId = $request->user()->school_id ?? 1;
        $teacher = Teacher::where('school_id', $schoolId)->findOrFail($id);
        $teacher->delete();

        return response()->json([
            'success' => true,
            'message' => 'Teacher record removed successfully.',
        ]);
    }
}
