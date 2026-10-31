<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
use Carbon\Carbon;

class StudentController extends Controller
{
    /**
     * Display a listing of students with search, filters, sorting, and pagination.
     */
    public function index(Request $request)
    {
        $query = Student::with('course:id,course_name,course_code');

        // Server-Side Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('student_code', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Filters
        if ($courseId = $request->input('course_id')) {
            $query->where('course_id', $courseId);
        }

        if ($gender = $request->input('gender')) {
            $query->where('gender', $gender);
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($fromDate = $request->input('from_date')) {
            $query->where('admission_date', '>=', $fromDate);
        }

        if ($toDate = $request->input('to_date')) {
            $query->where('admission_date', '<=', $toDate);
        }

        // Safe Sorting Allowlist
        $allowedSort = ['id', 'full_name', 'student_code', 'admission_date', 'status', 'created_at'];
        $sortBy = in_array($request->input('sort_by'), $allowedSort) ? $request->input('sort_by') : 'id';
        $sortOrder = strtolower($request->input('sort_order')) === 'asc' ? 'asc' : 'desc';

        $query->orderBy($sortBy, $sortOrder);

        // Server-Side Pagination
        $perPage = min(max((int) $request->input('per_page', 10), 5), 100);
        $paginated = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $paginated->items(),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }

    /**
     * Store a newly created student with auto-generated student code.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:150',
            'email' => 'required|string|email|max:150|unique:students,email',
            'phone' => 'required|string|max:25',
            'gender' => 'required|in:Male,Female,Other',
            'date_of_birth' => 'nullable|date',
            'address' => 'nullable|string',
            'course_id' => 'nullable|exists:courses,id',
            'admission_date' => 'required|date',
            'status' => 'required|in:Active,Inactive,Graduated',
        ]);

        // Auto-generate unique Student Code: STU-YYYY-XXXX
        $year = Carbon::parse($validated['admission_date'])->format('Y');
        $lastStudent = Student::latest('id')->first();
        $nextId = $lastStudent ? $lastStudent->id + 1 : 1;
        $studentCode = sprintf('STU-%s-%04d', $year, $nextId);

        $student = Student::create([
            ...$validated,
            'student_code' => $studentCode,
        ]);

        $student->load('course:id,course_name,course_code');

        return response()->json([
            'success' => true,
            'message' => 'Student registered successfully.',
            'data' => $student,
        ], 201);
    }

    /**
     * Display specific student profile.
     */
    public function show($id)
    {
        $student = Student::with([
            'course:id,course_name,course_code,fees,duration',
            'attendances' => function ($q) {
                $q->latest('attendance_date')->limit(10);
            }
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $student,
        ]);
    }

    /**
     * Update student details.
     */
    public function update(Request $request, $id)
    {
        $student = Student::findOrFail($id);

        $validated = $request->validate([
            'full_name' => 'sometimes|required|string|max:150',
            'email' => "sometimes|required|string|email|max:150|unique:students,email,{$id}",
            'phone' => 'sometimes|required|string|max:25',
            'gender' => 'sometimes|required|in:Male,Female,Other',
            'date_of_birth' => 'nullable|date',
            'address' => 'nullable|string',
            'course_id' => 'nullable|exists:courses,id',
            'admission_date' => 'sometimes|required|date',
            'status' => 'sometimes|required|in:Active,Inactive,Graduated',
        ]);

        $student->update($validated);
        $student->load('course:id,course_name,course_code');

        return response()->json([
            'success' => true,
            'message' => 'Student record updated successfully.',
            'data' => $student,
        ]);
    }

    /**
     * Delete student.
     */
    public function destroy($id)
    {
        $student = Student::findOrFail($id);
        $student->delete();

        return response()->json([
            'success' => true,
            'message' => 'Student deleted successfully.',
        ]);
    }
}
