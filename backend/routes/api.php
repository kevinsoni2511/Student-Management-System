<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AcademicController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\FeeController;
use App\Http\Controllers\ExamController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\SuperAdminController;
use App\Http\Controllers\PrincipalController;
use App\Http\Controllers\TeacherPortalController;
use App\Http\Controllers\AccountantPortalController;
use App\Http\Controllers\ReceptionistPortalController;
use App\Http\Controllers\LibrarianPortalController;
use App\Http\Controllers\TransportPortalController;
use App\Http\Controllers\ParentPortalController;
use App\Http\Controllers\StudentPortalController;
use App\Http\Controllers\PermissionController;

/*
|--------------------------------------------------------------------------
| Public Authentication Endpoints
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->name('login');

/*
|--------------------------------------------------------------------------
| Protected ERP Endpoints (Sanctum Authenticated)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    // Session State & Notices
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/announcements', [AnnouncementController::class, 'index']);

    // ----------------------------------------------------------------------
    // 1. Super Admin Panel Endpoints (Strictly role:super_admin)
    // ----------------------------------------------------------------------
    Route::middleware('role:super_admin')->prefix('super-admin')->group(function () {
        Route::get('/overview', [SuperAdminController::class, 'overview']);
        Route::get('/schools', [SuperAdminController::class, 'schools']);
        Route::post('/schools', [SuperAdminController::class, 'storeSchool']);
        Route::put('/schools/{id}', [SuperAdminController::class, 'updateSchool']);
    });

    // ----------------------------------------------------------------------
    // 2. School Admin Panel Endpoints (Strictly role:admin,super_admin)
    // ----------------------------------------------------------------------
    Route::middleware('role:admin,super_admin')->group(function () {
        Route::get('/dashboard/statistics', [DashboardController::class, 'statistics']);

        // Academic Structure
        Route::prefix('academic')->group(function () {
            Route::get('/sessions', [AcademicController::class, 'sessions']);
            Route::get('/classes', [AcademicController::class, 'classes']);
            Route::post('/classes', [AcademicController::class, 'storeClass']);
            Route::put('/classes/{id}', [AcademicController::class, 'updateClass']);
            Route::delete('/classes/{id}', [AcademicController::class, 'deleteClass']);
            Route::get('/sections', [AcademicController::class, 'sections']);
            Route::post('/sections', [AcademicController::class, 'storeSection']);
            Route::get('/subjects', [AcademicController::class, 'subjects']);
            Route::post('/subjects', [AcademicController::class, 'storeSubject']);
            Route::put('/subjects/{id}', [AcademicController::class, 'updateSubject']);
            Route::delete('/subjects/{id}', [AcademicController::class, 'deleteSubject']);
        });

        // Student Lifecycle
        Route::get('/students/form-options', [StudentController::class, 'formOptions']);
        Route::apiResource('students', StudentController::class);

        // Faculty Management
        Route::apiResource('teachers', TeacherController::class);

        // School Admin Announcement Management
        Route::post('/announcements', [AnnouncementController::class, 'store']);
        Route::delete('/announcements/{id}', [AnnouncementController::class, 'destroy']);

        // Dynamic Role & Permission Management
        Route::get('/admin/permissions', [PermissionController::class, 'index']);
        Route::post('/admin/permissions', [PermissionController::class, 'togglePermission']);
    });

    // ----------------------------------------------------------------------
    // 3. Principal Panel Endpoints (role:principal,admin,super_admin)
    // ----------------------------------------------------------------------
    Route::middleware('role:principal,admin,super_admin')->prefix('principal')->group(function () {
        Route::get('/overview', [PrincipalController::class, 'overview']);
        Route::post('/approvals/{id}', [PrincipalController::class, 'approveRequest']);
    });

    // ----------------------------------------------------------------------
    // 4. Teacher Panel Endpoints (role:teacher,admin,super_admin)
    // ----------------------------------------------------------------------
    Route::middleware('role:teacher,admin,super_admin')->prefix('teacher')->group(function () {
        Route::get('/dashboard-data', [TeacherPortalController::class, 'dashboard']);
        Route::get('/my-students', [TeacherPortalController::class, 'myStudents']);
        Route::get('/homework', [TeacherPortalController::class, 'homeworkList']);
        Route::post('/homework', [TeacherPortalController::class, 'createHomework']);
    });

    // Attendance endpoints (accessible by teachers and admins)
    Route::middleware('role:teacher,admin,principal,super_admin')->prefix('attendance')->group(function () {
        Route::get('/student-sheet', [AttendanceController::class, 'studentSheet']);
        Route::post('/student-bulk', [AttendanceController::class, 'bulkSaveStudent']);
        Route::get('/student-summary', [AttendanceController::class, 'studentSummary']);
    });

    // Examination Marks entry & schedule (accessible by teachers, principals, admins)
    Route::middleware('role:teacher,principal,admin,super_admin')->prefix('exams')->group(function () {
        Route::get('/', [ExamController::class, 'index']);
        Route::post('/', [ExamController::class, 'store']);
        Route::get('/marks-sheet', [ExamController::class, 'marksSheet']);
        Route::post('/save-marks', [ExamController::class, 'saveMarks']);
        Route::get('/report-card/{studentId}', [ExamController::class, 'reportCard']);
    });

    // ----------------------------------------------------------------------
    // 5. Accountant Panel Endpoints (role:accountant,admin,super_admin)
    // ----------------------------------------------------------------------
    Route::middleware('role:accountant,admin,super_admin')->group(function () {
        Route::get('/accountant/dashboard-data', [AccountantPortalController::class, 'dashboard']);
        Route::get('/accountant/pending-dues', [AccountantPortalController::class, 'pendingDues']);

        // Fees Management
        Route::prefix('fees')->group(function () {
            Route::get('/structures', [FeeController::class, 'structures']);
            Route::post('/structures', [FeeController::class, 'storeStructure']);
            Route::get('/student-fees', [FeeController::class, 'studentFees']);
            Route::post('/collect', [FeeController::class, 'collectPayment']);
            Route::get('/payments', [FeeController::class, 'payments']);
            Route::get('/receipt/{receiptNo}', [FeeController::class, 'receipt']);
        });
    });

    // ----------------------------------------------------------------------
    // 6. Receptionist Panel Endpoints (role:receptionist,admin,super_admin)
    // ----------------------------------------------------------------------
    Route::middleware('role:receptionist,admin,super_admin')->prefix('receptionist')->group(function () {
        Route::get('/dashboard-data', [ReceptionistPortalController::class, 'dashboard']);
        Route::get('/enquiries', [ReceptionistPortalController::class, 'enquiries']);
        Route::post('/enquiries', [ReceptionistPortalController::class, 'storeEnquiry']);
        Route::put('/enquiries/{id}', [ReceptionistPortalController::class, 'updateEnquiryStatus']);
        Route::get('/search-student', [ReceptionistPortalController::class, 'searchStudent']);
    });

    // ----------------------------------------------------------------------
    // 7. Librarian Panel Endpoints (role:librarian,admin,super_admin)
    // ----------------------------------------------------------------------
    Route::middleware('role:librarian,admin,super_admin')->prefix('librarian')->group(function () {
        Route::get('/dashboard-data', [LibrarianPortalController::class, 'dashboard']);
        Route::get('/books', [LibrarianPortalController::class, 'books']);
        Route::post('/books', [LibrarianPortalController::class, 'storeBook']);
        Route::post('/issue-book', [LibrarianPortalController::class, 'issueBook']);
        Route::post('/return-book/{id}', [LibrarianPortalController::class, 'returnBook']);
    });

    // ----------------------------------------------------------------------
    // 8. Transport Manager Panel Endpoints (role:transport_manager,admin,super_admin)
    // ----------------------------------------------------------------------
    Route::middleware('role:transport_manager,admin,super_admin')->prefix('transport')->group(function () {
        Route::get('/dashboard-data', [TransportPortalController::class, 'dashboard']);
        Route::get('/vehicles', [TransportPortalController::class, 'vehicles']);
        Route::post('/vehicles', [TransportPortalController::class, 'storeVehicle']);
        Route::get('/routes', [TransportPortalController::class, 'routes']);
        Route::post('/routes', [TransportPortalController::class, 'storeRoute']);
        Route::post('/allocate-student', [TransportPortalController::class, 'allocateStudent']);
    });

    // ----------------------------------------------------------------------
    // 9. Parent Portal Endpoints (Strictly role:parent with ownership verification)
    // ----------------------------------------------------------------------
    Route::middleware('role:parent')->prefix('parent')->group(function () {
        Route::get('/dashboard-data', [ParentPortalController::class, 'dashboard']);
        Route::get('/child/{studentId}', [ParentPortalController::class, 'childOverview']);
    });

    // ----------------------------------------------------------------------
    // 10. Student Portal Endpoints (Strictly role:student with self-record verification)
    // ----------------------------------------------------------------------
    Route::middleware('role:student')->prefix('student')->group(function () {
        Route::get('/dashboard-data', [StudentPortalController::class, 'dashboard']);
        Route::post('/homework/{homeworkId}/submit', [StudentPortalController::class, 'submitHomework']);
    });
});
