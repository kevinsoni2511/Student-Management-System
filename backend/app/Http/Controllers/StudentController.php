<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\AcademicSession;
use App\Models\FeeStructure;
use App\Models\StudentFee;
use Illuminate\Http\Request;
use Carbon\Carbon;

class StudentController extends Controller
{
    /**
     * Display a listing of students with filters, search, and pagination.
     */
    public function index(Request $request)
    {
        $schoolId = $request->user()->school_id ?? 1;

        $query = Student::where('school_id', $schoolId)
            ->with(['schoolClass:id,class_name,numeric_grade', 'section:id,section_name', 'academicSession:id,session_name']);

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('admission_no', 'like', "%{$search}%")
                  ->orWhere('roll_no', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('parent_name', 'like', "%{$search}%");
            });
        }

        // Filters
        if ($classId = $request->input('class_id')) {
            $query->where('class_id', $classId);
        }

        if ($sectionId = $request->input('section_id')) {
            $query->where('section_id', $sectionId);
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($gender = $request->input('gender')) {
            $query->where('gender', $gender);
        }

        // Sorting
        $allowedSort = ['id', 'admission_no', 'first_name', 'roll_no', 'admission_date', 'status'];
        $sortBy = in_array($request->input('sort_by'), $allowedSort) ? $request->input('sort_by') : 'id';
        $sortOrder = strtolower($request->input('sort_order')) === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
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
     * Store a newly admitted student
     */
    public function store(Request $request)
    {
        $schoolId = $request->user()->school_id ?? 1;

        $validated = $request->validate([
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'class_id' => 'required|exists:school_classes,id',
            'section_id' => 'nullable|exists:sections,id',
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'gender' => 'required|in:Male,Female,Other',
            'date_of_birth' => 'required|date',
            'blood_group' => 'nullable|string|max:10',
            'religion' => 'nullable|string|max:50',
            'nationality' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:150',
            'phone' => 'nullable|string|max:30',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'pincode' => 'nullable|string|max:20',
            'admission_date' => 'required|date',
            'previous_school' => 'nullable|string|max:150',
            'parent_name' => 'required|string|max:150',
            'parent_relation' => 'nullable|string|max:50',
            'parent_phone' => 'required|string|max:30',
            'parent_email' => 'nullable|email|max:150',
            'parent_occupation' => 'nullable|string|max:100',
            'emergency_contact' => 'nullable|string|max:30',
            'roll_no' => 'nullable|string|max:30',
            'admission_no' => 'nullable|string|max:50',
            'status' => 'nullable|in:Active,Inactive,Alumni,Suspended',
        ]);

        // Generate Admission No if not supplied
        if (empty($validated['admission_no'])) {
            $year = Carbon::parse($validated['admission_date'])->format('Y');
            $count = Student::where('school_id', $schoolId)->count() + 1;
            $validated['admission_no'] = sprintf('ADM-%s-%04d', $year, $count);
        }

        // Auto-assign roll no if not given
        if (empty($validated['roll_no'])) {
            $currentClassCount = Student::where('school_id', $schoolId)
                ->where('class_id', $validated['class_id'])
                ->count() + 1;
            $validated['roll_no'] = (string) $currentClassCount;
        }

        $student = Student::create([
            ...$validated,
            'school_id' => $schoolId,
            'status' => $validated['status'] ?? 'Active',
            'nationality' => $validated['nationality'] ?? 'Indian',
            'parent_relation' => $validated['parent_relation'] ?? 'Father',
        ]);

        // Automatically assign default fee structure for this class if exists
        $feeStructures = FeeStructure::where('school_id', $schoolId)
            ->where('class_id', $student->class_id)
            ->where('academic_session_id', $student->academic_session_id)
            ->get();

        foreach ($feeStructures as $structure) {
            StudentFee::firstOrCreate(
                [
                    'school_id' => $schoolId,
                    'student_id' => $student->id,
                    'fee_structure_id' => $structure->id,
                ],
                [
                    'academic_session_id' => $student->academic_session_id,
                    'total_amount' => $structure->amount,
                    'discount' => 0.00,
                    'paid_amount' => 0.00,
                    'due_amount' => $structure->amount,
                    'status' => 'Unpaid',
                ]
            );
        }

        $student->load(['schoolClass', 'section', 'academicSession']);

        return response()->json([
            'success' => true,
            'message' => "Student {$student->full_name} enrolled successfully with Admission No: {$student->admission_no}.",
            'data' => $student,
        ], 201);
    }

    /**
     * Show single student full profile with fees & attendance
     */
    public function show(Request $request, $id)
    {
        $schoolId = $request->user()->school_id ?? 1;

        $student = Student::where('school_id', $schoolId)
            ->with([
                'schoolClass.subjects',
                'section',
                'academicSession',
                'fees.feeStructure.feeType',
                'fees.payments',
                'marks.examination',
                'marks.subject',
            ])
            ->findOrFail($id);

        // Attendance stats
        $totalDays = $student->attendances()->count();
        $presentDays = $student->attendances()->where('status', 'Present')->count();
        $absentDays = $student->attendances()->where('status', 'Absent')->count();
        $attendanceRate = $totalDays > 0 ? round(($presentDays / $totalDays) * 100, 1) : 100;

        return response()->json([
            'success' => true,
            'data' => [
                'student' => $student,
                'attendance_summary' => [
                    'total_days' => $totalDays,
                    'present_days' => $presentDays,
                    'absent_days' => $absentDays,
                    'attendance_rate' => $attendanceRate,
                ],
            ],
        ]);
    }

    /**
     * Update student details
     */
    public function update(Request $request, $id)
    {
        $schoolId = $request->user()->school_id ?? 1;
        $student = Student::where('school_id', $schoolId)->findOrFail($id);

        $validated = $request->validate([
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'class_id' => 'required|exists:school_classes,id',
            'section_id' => 'nullable|exists:sections,id',
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'gender' => 'required|in:Male,Female,Other',
            'date_of_birth' => 'required|date',
            'blood_group' => 'nullable|string|max:10',
            'religion' => 'nullable|string|max:50',
            'nationality' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:150',
            'phone' => 'nullable|string|max:30',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'pincode' => 'nullable|string|max:20',
            'admission_date' => 'required|date',
            'previous_school' => 'nullable|string|max:150',
            'parent_name' => 'required|string|max:150',
            'parent_relation' => 'nullable|string|max:50',
            'parent_phone' => 'required|string|max:30',
            'parent_email' => 'nullable|email|max:150',
            'parent_occupation' => 'nullable|string|max:100',
            'emergency_contact' => 'nullable|string|max:30',
            'roll_no' => 'nullable|string|max:30',
            'status' => 'required|in:Active,Inactive,Alumni,Suspended',
        ]);

        $student->update($validated);
        $student->load(['schoolClass', 'section', 'academicSession']);

        return response()->json([
            'success' => true,
            'message' => 'Student record updated successfully.',
            'data' => $student,
        ]);
    }

    /**
     * Delete student
     */
    public function destroy(Request $request, $id)
    {
        $schoolId = $request->user()->school_id ?? 1;
        $student = Student::where('school_id', $schoolId)->findOrFail($id);
        $student->delete();

        return response()->json([
            'success' => true,
            'message' => 'Student record deleted successfully.',
        ]);
    }

    /**
     * Helper endpoint for Admission & Filter dropdowns
     */
    public function formOptions(Request $request)
    {
        $schoolId = $request->user()->school_id ?? 1;

        $sessions = AcademicSession::where('school_id', $schoolId)->orderBy('id', 'desc')->get();
        $classes = SchoolClass::where('school_id', $schoolId)->with('sections')->orderBy('numeric_grade')->get();
        $sections = Section::where('school_id', $schoolId)->orderBy('section_name')->get();

        return response()->json([
            'success' => true,
            'data' => [
                'sessions' => $sessions,
                'classes' => $classes,
                'sections' => $sections,
                'blood_groups' => ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
                'genders' => ['Male', 'Female', 'Other'],
                'statuses' => ['Active', 'Inactive', 'Alumni', 'Suspended'],
            ],
        ]);
    }
}
