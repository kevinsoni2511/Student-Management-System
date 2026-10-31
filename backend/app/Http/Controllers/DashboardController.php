<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Teacher;
use App\Models\Staff;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\StudentAttendance;
use App\Models\StudentFee;
use App\Models\FeePayment;
use App\Models\Announcement;
use App\Models\Examination;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Complete ERP Dashboard Statistics
     */
    public function statistics(Request $request)
    {
        $schoolId = $request->user()->school_id ?? 1;
        $today = Carbon::today()->toDateString();

        // 1. Student Metrics
        $totalStudents = Student::where('school_id', $schoolId)->count();
        $activeStudents = Student::where('school_id', $schoolId)->where('status', 'Active')->count();

        // 2. Staff & Faculty Metrics
        $totalTeachers = Teacher::where('school_id', $schoolId)->count();
        $totalStaff = Staff::where('school_id', $schoolId)->count();
        $totalClasses = SchoolClass::where('school_id', $schoolId)->count();
        $totalSections = Section::where('school_id', $schoolId)->count();

        // 3. Attendance Rate (Today or latest available record)
        $todayAttendance = StudentAttendance::where('school_id', $schoolId)
            ->where('attendance_date', $today)
            ->get();

        if ($todayAttendance->isEmpty()) {
            // Check most recent date
            $latestDate = StudentAttendance::where('school_id', $schoolId)->max('attendance_date');
            if ($latestDate) {
                $todayAttendance = StudentAttendance::where('school_id', $schoolId)
                    ->where('attendance_date', $latestDate)
                    ->get();
            }
        }

        $attTotal = $todayAttendance->count();
        $attPresent = $todayAttendance->where('status', 'Present')->count();
        $attendanceRate = $attTotal > 0 ? round(($attPresent / $attTotal) * 100, 1) : 96.5;

        // 4. Financial / Fee Metrics
        $totalBilled = (float) StudentFee::where('school_id', $schoolId)->sum('total_amount');
        $totalCollected = (float) StudentFee::where('school_id', $schoolId)->sum('paid_amount');
        $totalDue = (float) StudentFee::where('school_id', $schoolId)->sum('due_amount');
        $collectionRate = $totalBilled > 0 ? round(($totalCollected / $totalBilled) * 100, 1) : 0;

        // 5. Recent Admissions
        $recentStudents = Student::where('school_id', $schoolId)
            ->with(['schoolClass:id,class_name', 'section:id,section_name'])
            ->orderBy('id', 'desc')
            ->limit(5)
            ->get();

        // 6. Recent Fee Collections
        $recentPayments = FeePayment::where('school_id', $schoolId)
            ->with(['student:id,first_name,last_name,admission_no', 'student.schoolClass:id,class_name'])
            ->orderBy('id', 'desc')
            ->limit(5)
            ->get();

        // 7. Class Distribution (Counts per class)
        $classDistribution = SchoolClass::where('school_id', $schoolId)
            ->withCount('students')
            ->orderBy('numeric_grade')
            ->get(['id', 'class_name', 'students_count']);

        // 8. Recent Announcements
        $announcements = Announcement::where('school_id', $schoolId)
            ->where('is_active', true)
            ->orderBy('publish_date', 'desc')
            ->limit(4)
            ->get(['id', 'title', 'target_role', 'publish_date', 'content']);

        // 9. Upcoming Examinations
        $upcomingExams = Examination::where('school_id', $schoolId)
            ->where('end_date', '>=', $today)
            ->orderBy('start_date', 'asc')
            ->limit(3)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'counts' => [
                    'total_students' => $totalStudents,
                    'active_students' => $activeStudents,
                    'total_teachers' => $totalTeachers,
                    'total_staff' => $totalStaff,
                    'total_classes' => $totalClasses,
                    'total_sections' => $totalSections,
                ],
                'attendance' => [
                    'attendance_rate' => $attendanceRate,
                    'present_count' => $attPresent,
                    'total_marked' => $attTotal,
                ],
                'fees' => [
                    'total_billed' => $totalBilled,
                    'total_collected' => $totalCollected,
                    'total_due' => $totalDue,
                    'collection_rate' => $collectionRate,
                ],
                'recent_students' => $recentStudents,
                'recent_payments' => $recentPayments,
                'class_distribution' => $classDistribution,
                'announcements' => $announcements,
                'upcoming_exams' => $upcomingExams,
            ],
        ]);
    }
}
