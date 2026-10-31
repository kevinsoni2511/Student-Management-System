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

/*
|--------------------------------------------------------------------------
| API Routes - Enterprise School Management ERP
|--------------------------------------------------------------------------
*/

// Public Authentication
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->name('login');

// Protected ERP Endpoints (Laravel Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    // Auth Session
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Dashboard Analytics
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

    // Student Lifecycle & Admissions
    Route::get('/students/form-options', [StudentController::class, 'formOptions']);
    Route::apiResource('students', StudentController::class);

    // Faculty (Teachers)
    Route::apiResource('teachers', TeacherController::class);

    // Daily Attendance Management
    Route::prefix('attendance')->group(function () {
        Route::get('/student-sheet', [AttendanceController::class, 'studentSheet']);
        Route::post('/student-bulk', [AttendanceController::class, 'bulkSaveStudent']);
        Route::get('/student-summary', [AttendanceController::class, 'studentSummary']);
    });

    // Fee Management & Collection
    Route::prefix('fees')->group(function () {
        Route::get('/structures', [FeeController::class, 'structures']);
        Route::post('/structures', [FeeController::class, 'storeStructure']);
        Route::get('/student-fees', [FeeController::class, 'studentFees']);
        Route::post('/collect', [FeeController::class, 'collectPayment']);
        Route::get('/payments', [FeeController::class, 'payments']);
        Route::get('/receipt/{receiptNo}', [FeeController::class, 'receipt']);
    });

    // Examinations & Report Cards
    Route::prefix('exams')->group(function () {
        Route::get('/', [ExamController::class, 'index']);
        Route::post('/', [ExamController::class, 'store']);
        Route::get('/marks-sheet', [ExamController::class, 'marksSheet']);
        Route::post('/save-marks', [ExamController::class, 'saveMarks']);
        Route::get('/report-card/{studentId}', [ExamController::class, 'reportCard']);
    });

    // Announcements / Noticeboard
    Route::apiResource('announcements', AnnouncementController::class)->only(['index', 'store', 'destroy']);
});
