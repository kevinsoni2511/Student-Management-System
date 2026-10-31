<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{
    /**
     * Get attendance register for a specific date and course.
     * Returns all active students in the course merged with their attendance status.
     */
    public function index(Request $request)
    {
        $date = $request->input('date', date('Y-m-d'));
        $courseId = $request->input('course_id');

        // Query active students in course
        $studentsQuery = Student::where('status', 'Active')->with('course:id,course_name,course_code');

        if ($courseId) {
            $studentsQuery->where('course_id', $courseId);
        }

        $students = $studentsQuery->orderBy('full_name', 'asc')->get();

        // Fetch attendance entries for this date
        $attendances = Attendance::where('attendance_date', $date)
            ->whereIn('student_id', $students->pluck('id'))
            ->get()
            ->keyBy('student_id');

        // Merge status with student objects
        $records = $students->map(function ($st) use ($attendances) {
            $att = $attendances->get($st->id);
            return [
                'student_id' => $st->id,
                'student_code' => $st->student_code,
                'full_name' => $st->full_name,
                'course_name' => $st->course?->course_name ?? 'N/A',
                'status' => $att?->status ?? 'Present', // default to Present if not yet marked
                'remarks' => $att?->remarks ?? '',
                'is_recorded' => $att !== null,
            ];
        });

        return response()->json([
            'success' => true,
            'date' => $date,
            'course_id' => $courseId,
            'data' => $records,
        ]);
    }

    /**
     * Bulk save or update attendance for a date.
     * Uses DB transaction and prevents duplicate entries via updateOrCreate.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'attendance_date' => 'required|date',
            'course_id' => 'nullable|exists:courses,id',
            'records' => 'required|array|min:1',
            'records.*.student_id' => 'required|exists:students,id',
            'records.*.status' => 'required|in:Present,Absent,Late',
            'records.*.remarks' => 'nullable|string|max:255',
        ]);

        $date = $validated['attendance_date'];
        $courseId = $validated['course_id'] ?? null;

        DB::transaction(function () use ($validated, $date, $courseId) {
            foreach ($validated['records'] as $record) {
                Attendance::updateOrCreate(
                    [
                        'student_id' => $record['student_id'],
                        'attendance_date' => $date,
                    ],
                    [
                        'course_id' => $courseId,
                        'status' => $record['status'],
                        'remarks' => $record['remarks'] ?? null,
                    ]
                );
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Attendance recorded successfully.',
        ]);
    }

    /**
     * Get attendance metrics and individual student attendance percentages.
     */
    public function summary(Request $request)
    {
        $courseId = $request->input('course_id');

        $studentsQuery = Student::where('status', 'Active');
        if ($courseId) {
            $studentsQuery->where('course_id', $courseId);
        }

        $students = $studentsQuery->withCount([
            'attendances as total_sessions',
            'attendances as present_sessions' => function ($q) {
                $q->where('status', 'Present');
            },
            'attendances as late_sessions' => function ($q) {
                $q->where('status', 'Late');
            },
            'attendances as absent_sessions' => function ($q) {
                $q->where('status', 'Absent');
            },
        ])->get();

        $studentStats = $students->map(function ($st) {
            $percentage = $st->total_sessions > 0
                ? round(($st->present_sessions / $st->total_sessions) * 100, 1)
                : 100;

            return [
                'id' => $st->id,
                'student_code' => $st->student_code,
                'full_name' => $st->full_name,
                'total_sessions' => $st->total_sessions,
                'present_sessions' => $st->present_sessions,
                'late_sessions' => $st->late_sessions,
                'absent_sessions' => $st->absent_sessions,
                'percentage' => $percentage,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $studentStats,
        ]);
    }
}
