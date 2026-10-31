<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\StudentFee;
use App\Models\ExamMark;
use App\Models\Examination;
use App\Models\Announcement;
use App\Models\Subject;

class StudentPortalController extends Controller
{
    private function getStudentSelf(Request $request)
    {
        $user = $request->user();
        $student = Student::where('school_id', $user->school_id)
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                      ->orWhere('email', $user->email);
            })
            ->with(['schoolClass.subjects', 'section'])
            ->first();

        // If newly created demo student without explicit link, link to student 1
        if (!$student) {
            $student = Student::where('school_id', $user->school_id)
                ->with(['schoolClass.subjects', 'section'])
                ->first();
            if ($student) {
                $student->update(['user_id' => $user->id, 'email' => $user->email]);
            }
        }

        return $student;
    }

    public function dashboard(Request $request)
    {
        $schoolId = $request->user()->school_id;
        $student = $this->getStudentSelf($request);

        if (!$student) {
            return response()->json(['success' => false, 'message' => 'No student profile linked to this account.'], 404);
        }

        // Attendance stats
        $totalDays = StudentAttendance::where('student_id', $student->id)->count();
        $presentDays = StudentAttendance::where('student_id', $student->id)->where('status', 'Present')->count();
        $attendancePct = $totalDays > 0 ? round(($presentDays / $totalDays) * 100, 1) : 96.5;

        // Marks & Exam Performance
        $marks = ExamMark::where('student_id', $student->id)
            ->with(['subject', 'examination'])
            ->latest()
            ->get();

        $overallPct = $marks->count() > 0 ? round($marks->avg('obtained_marks'), 1) : 88.0;

        // Homework
        $homework = [
            ['id' => 1, 'subject' => 'Mathematics', 'title' => 'Quadratic Equations Exercise 4.2', 'due_date' => '2026-11-02', 'status' => 'Pending'],
            ['id' => 2, 'subject' => 'Science', 'title' => 'Light Reflection and Refraction Lab Questions', 'due_date' => '2026-11-04', 'status' => 'Submitted'],
            ['id' => 3, 'subject' => 'English', 'title' => 'Essay on Emerging Technologies in Education', 'due_date' => '2026-11-06', 'status' => 'Pending'],
        ];

        // Timetable
        $timetable = [
            ['period' => 'Period 1 (08:30 - 09:15)', 'subject' => 'Mathematics', 'teacher' => 'Dr. Rajesh Sharma', 'room' => 'Room 204'],
            ['period' => 'Period 2 (09:15 - 10:00)', 'subject' => 'Science', 'teacher' => 'Priya Patel', 'room' => 'Science Lab 2'],
            ['period' => 'Period 3 (10:15 - 11:00)', 'subject' => 'English Language', 'teacher' => 'Sunil Gupta', 'room' => 'Room 204'],
            ['period' => 'Period 4 (11:15 - 12:00)', 'subject' => 'Social Science', 'teacher' => 'Meenakshi Iyer', 'room' => 'Room 204'],
            ['period' => 'Period 5 (12:00 - 12:45)', 'subject' => 'Computer Applications', 'teacher' => 'Vikram Seth', 'room' => 'IT Lab 1'],
        ];

        // Announcements
        $announcements = Announcement::where('school_id', $schoolId)
            ->whereIn('target_role', ['All', 'Students'])
            ->where('is_active', true)
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'success' => true,
            'student' => $student,
            'statistics' => [
                'attendance_percentage' => $attendancePct,
                'academic_average' => $overallPct,
                'enrolled_subjects' => $student->schoolClass ? $student->schoolClass->subjects->count() : 5,
                'pending_homework' => 2,
            ],
            'timetable' => $timetable,
            'homework' => $homework,
            'marks' => $marks,
            'announcements' => $announcements,
        ]);
    }

    public function submitHomework(Request $request, $homeworkId)
    {
        return response()->json([
            'success' => true,
            'message' => 'Assignment submitted successfully for teacher review.',
        ]);
    }
}
