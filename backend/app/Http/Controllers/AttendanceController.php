<?php

namespace App\Http\Controllers;

use App\Models\StudentAttendance;
use App\Models\EmployeeAttendance;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\Staff;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    /**
     * Get attendance sheet for a class & section on a given date.
     * Pre-populates all enrolled students with existing attendance or 'Present' by default.
     */
    public function studentSheet(Request $request)
    {
        $schoolId = $request->user()->school_id ?? 1;

        $request->validate([
            'class_id' => 'required|exists:school_classes,id',
            'section_id' => 'nullable|exists:sections,id',
            'date' => 'nullable|date',
        ]);

        $classId = $request->input('class_id');
        $sectionId = $request->input('section_id');
        $date = $request->input('date', Carbon::today()->toDateString());

        // Fetch students in this class/section
        $studentsQuery = Student::where('school_id', $schoolId)
            ->where('class_id', $classId)
            ->where('status', 'Active');

        if ($sectionId) {
            $studentsQuery->where('section_id', $sectionId);
        }

        $students = $studentsQuery->orderBy('roll_no', 'asc')->orderBy('first_name', 'asc')->get();

        // Fetch existing attendance records for this date
        $existingRecords = StudentAttendance::where('school_id', $schoolId)
            ->where('class_id', $classId)
            ->where('attendance_date', $date)
            ->get()
            ->keyBy('student_id');

        $sheet = $students->map(function ($stu) use ($existingRecords) {
            $record = $existingRecords->get($stu->id);
            return [
                'student_id' => $stu->id,
                'admission_no' => $stu->admission_no,
                'roll_no' => $stu->roll_no,
                'student_name' => $stu->full_name,
                'gender' => $stu->gender,
                'status' => $record ? $record->status : 'Present',
                'remarks' => $record ? $record->remarks : '',
                'is_saved' => $record !== null,
            ];
        });

        $totalEnrolled = $students->count();
        $isAlreadySubmitted = $existingRecords->isNotEmpty();
        $presentCount = $sheet->where('status', 'Present')->count();
        $absentCount = $sheet->where('status', 'Absent')->count();
        $lateCount = $sheet->where('status', 'Late')->count();
        $halfDayCount = $sheet->where('status', 'Half Day')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'date' => $date,
                'class_id' => (int) $classId,
                'section_id' => $sectionId ? (int) $sectionId : null,
                'is_submitted' => $isAlreadySubmitted,
                'total_enrolled' => $totalEnrolled,
                'stats' => [
                    'present' => $presentCount,
                    'absent' => $absentCount,
                    'late' => $lateCount,
                    'half_day' => $halfDayCount,
                ],
                'students' => $sheet,
            ],
        ]);
    }

    /**
     * Bulk save or update class attendance
     */
    public function bulkSaveStudent(Request $request)
    {
        $schoolId = $request->user()->school_id ?? 1;
        $userId = $request->user()->id ?? null;

        $validated = $request->validate([
            'class_id' => 'required|exists:school_classes,id',
            'section_id' => 'nullable|exists:sections,id',
            'attendance_date' => 'required|date',
            'records' => 'required|array|min:1',
            'records.*.student_id' => 'required|exists:students,id',
            'records.*.status' => 'required|in:Present,Absent,Late,Half Day',
            'records.*.remarks' => 'nullable|string|max:255',
        ]);

        $date = $validated['attendance_date'];
        $classId = $validated['class_id'];
        $sectionId = $validated['section_id'] ?? null;

        foreach ($validated['records'] as $rec) {
            $student = Student::find($rec['student_id']);
            if (!$student) continue;

            StudentAttendance::updateOrCreate(
                [
                    'school_id' => $schoolId,
                    'student_id' => $rec['student_id'],
                    'attendance_date' => $date,
                ],
                [
                    'class_id' => $classId,
                    'section_id' => $student->section_id ?? $sectionId,
                    'academic_session_id' => $student->academic_session_id,
                    'status' => $rec['status'],
                    'remarks' => $rec['remarks'] ?? null,
                    'marked_by' => $userId,
                ]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Attendance recorded successfully for ' . count($validated['records']) . ' students.',
        ]);
    }

    /**
     * Class-level or school-level attendance summary
     */
    public function studentSummary(Request $request)
    {
        $schoolId = $request->user()->school_id ?? 1;
        $today = Carbon::today()->toDateString();

        $totalRecordsToday = StudentAttendance::where('school_id', $schoolId)
            ->where('attendance_date', $today)
            ->count();

        $presentToday = StudentAttendance::where('school_id', $schoolId)
            ->where('attendance_date', $today)
            ->where('status', 'Present')
            ->count();

        $absentToday = StudentAttendance::where('school_id', $schoolId)
            ->where('attendance_date', $today)
            ->where('status', 'Absent')
            ->count();

        // Overall monthly stats
        $startOfMonth = Carbon::now()->startOfMonth()->toDateString();
        $totalMonthRecords = StudentAttendance::where('school_id', $schoolId)
            ->where('attendance_date', '>=', $startOfMonth)
            ->count();

        $presentMonthRecords = StudentAttendance::where('school_id', $schoolId)
            ->where('attendance_date', '>=', $startOfMonth)
            ->where('status', 'Present')
            ->count();

        $monthlyRate = $totalMonthRecords > 0 ? round(($presentMonthRecords / $totalMonthRecords) * 100, 1) : 95.0;

        return response()->json([
            'success' => true,
            'data' => [
                'today' => [
                    'date' => $today,
                    'total_marked' => $totalRecordsToday,
                    'present' => $presentToday,
                    'absent' => $absentToday,
                    'attendance_rate' => $totalRecordsToday > 0 ? round(($presentToday / $totalRecordsToday) * 100, 1) : 0,
                ],
                'month' => [
                    'total_records' => $totalMonthRecords,
                    'present_count' => $presentMonthRecords,
                    'average_rate' => $monthlyRate,
                ],
            ],
        ]);
    }
}
