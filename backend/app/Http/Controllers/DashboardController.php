<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Student;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Aggregate Dashboard Metrics
     */
    public function statistics()
    {
        $totalStudents = Student::count();
        $activeStudents = Student::where('status', 'Active')->count();
        $inactiveStudents = Student::where('status', 'Inactive')->count();
        $graduatedStudents = Student::where('status', 'Graduated')->count();
        $totalCourses = Course::where('status', 'Active')->count();

        // New admissions within the past 30 days
        $thirtyDaysAgo = Carbon::now()->subDays(30)->toDateString();
        $newAdmissions = Student::where('admission_date', '>=', $thirtyDaysAgo)->count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_students' => $totalStudents,
                'active_students' => $activeStudents,
                'inactive_students' => $inactiveStudents,
                'graduated_students' => $graduatedStudents,
                'total_courses' => $totalCourses,
                'new_admissions' => $newAdmissions,
            ],
        ]);
    }

    /**
     * Recent Student Admissions
     */
    public function recentStudents()
    {
        $recent = Student::with('course:id,course_name,course_code')
            ->orderBy('id', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $recent,
        ]);
    }

    /**
     * High-Level Attendance Summary
     */
    public function attendanceSummary()
    {
        $total = Attendance::count();
        $present = Attendance::where('status', 'Present')->count();
        $absent = Attendance::where('status', 'Absent')->count();
        $late = Attendance::where('status', 'Late')->count();

        $percentage = $total > 0 ? round(($present / $total) * 100, 1) : 100;

        return response()->json([
            'success' => true,
            'data' => [
                'total_records' => $total,
                'present_count' => $present,
                'absent_count' => $absent,
                'late_count' => $late,
                'attendance_percentage' => $percentage,
            ],
        ]);
    }
}
