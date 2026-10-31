<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Teacher;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\ExamMark;
use App\Models\Examination;
use App\Models\Announcement;
use Carbon\Carbon;

class TeacherPortalController extends Controller
{
    private function getTeacherRecord(Request $request)
    {
        $user = $request->user();
        return Teacher::where('user_id', $user->id)
            ->orWhere('email', $user->email)
            ->first();
    }

    public function dashboard(Request $request)
    {
        $schoolId = $request->user()->school_id;
        $teacher = $this->getTeacherRecord($request);

        // Fetch assigned classes
        $classes = SchoolClass::where('school_id', $schoolId)->with('sections')->get();
        $subjects = Subject::where('school_id', $schoolId)->get();

        // My total students in assigned classes
        $assignedClassIds = $classes->pluck('id')->toArray();
        $myStudentsCount = Student::where('school_id', $schoolId)
            ->whereIn('class_id', $assignedClassIds)
            ->count();

        // Today's attendance status
        $today = Carbon::today()->toDateString();
        $markedToday = StudentAttendance::where('school_id', $schoolId)
            ->whereDate('attendance_date', $today)
            ->exists();

        // Announcements for teachers
        $announcements = Announcement::where('school_id', $schoolId)
            ->whereIn('target_role', ['All', 'Teachers'])
            ->where('is_active', true)
            ->latest()
            ->take(5)
            ->get();

        // Mock timetable schedule for this teacher
        $timetable = [
            ['day' => 'Monday', 'period' => 'Period 1 (08:30 - 09:15)', 'class' => 'Class 10 - Section A', 'subject' => 'Mathematics', 'room' => 'Room 204'],
            ['day' => 'Monday', 'period' => 'Period 3 (10:15 - 11:00)', 'class' => 'Class 9 - Section A', 'subject' => 'Mathematics', 'room' => 'Room 102'],
            ['day' => 'Tuesday', 'period' => 'Period 2 (09:15 - 10:00)', 'class' => 'Class 10 - Section B', 'subject' => 'Mathematics', 'room' => 'Room 205'],
            ['day' => 'Wednesday', 'period' => 'Period 4 (11:15 - 12:00)', 'class' => 'Class 10 - Section A', 'subject' => 'Mathematics Lab', 'room' => 'Math Lab 1'],
            ['day' => 'Thursday', 'period' => 'Period 1 (08:30 - 09:15)', 'class' => 'Class 9 - Section A', 'subject' => 'Mathematics', 'room' => 'Room 102'],
            ['day' => 'Friday', 'period' => 'Period 5 (12:00 - 12:45)', 'class' => 'Class 10 - Section A', 'subject' => 'Mathematics Doubt Clearing', 'room' => 'Room 204'],
        ];

        return response()->json([
            'success' => true,
            'teacher' => $teacher,
            'statistics' => [
                'assigned_classes_count' => $classes->count(),
                'assigned_subjects_count' => $subjects->count(),
                'total_students' => $myStudentsCount,
                'attendance_marked_today' => $markedToday,
                'pending_homework_reviews' => 4,
            ],
            'classes' => $classes,
            'subjects' => $subjects,
            'timetable' => $timetable,
            'announcements' => $announcements,
        ]);
    }

    public function myStudents(Request $request)
    {
        $schoolId = $request->user()->school_id;
        $classId = $request->query('class_id');
        $sectionId = $request->query('section_id');

        $query = Student::where('school_id', $schoolId)->with(['schoolClass', 'section']);
        if ($classId) $query->where('class_id', $classId);
        if ($sectionId) $query->where('section_id', $sectionId);

        $students = $query->get();

        return response()->json([
            'success' => true,
            'students' => $students,
        ]);
    }

    public function homeworkList(Request $request)
    {
        // Return teacher's homework assignments
        $homework = [
            [
                'id' => 1,
                'title' => 'Quadratic Equations Practice Set 4.2',
                'class' => 'Class 10 - Section A',
                'subject' => 'Mathematics',
                'assigned_date' => '2026-10-28',
                'due_date' => '2026-11-02',
                'status' => 'Active',
                'submissions_count' => 38,
                'total_students' => 42,
            ],
            [
                'id' => 2,
                'title' => 'Polynomials Factorization Worksheet',
                'class' => 'Class 9 - Section A',
                'subject' => 'Mathematics',
                'assigned_date' => '2026-10-29',
                'due_date' => '2026-11-03',
                'status' => 'Active',
                'submissions_count' => 30,
                'total_students' => 35,
            ]
        ];

        return response()->json([
            'success' => true,
            'homework' => $homework,
        ]);
    }

    public function createHomework(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:200',
            'class_id' => 'required|exists:classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'due_date' => 'required|date',
            'description' => 'required|string',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Homework assigned successfully to students.',
            'data' => $validated,
        ], 201);
    }
}
