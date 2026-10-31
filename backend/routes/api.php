<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\AttendanceController;

/*
|--------------------------------------------------------------------------
| API Routes - Student Management System
|--------------------------------------------------------------------------
*/

// Public Authentication Endpoints
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected Administrator Endpoints (Laravel Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    // Auth Session
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Dashboard Analytics
    Route::get('/dashboard/statistics', [DashboardController::class, 'statistics']);
    Route::get('/dashboard/recent-students', [DashboardController::class, 'recentStudents']);
    Route::get('/dashboard/attendance-summary', [DashboardController::class, 'attendanceSummary']);

    // Student CRUD
    Route::apiResource('students', StudentController::class);

    // Course CRUD
    Route::apiResource('courses', CourseController::class);

    // Attendance Management
    Route::get('/attendance', [AttendanceController::class, 'index']);
    Route::post('/attendance', [AttendanceController::class, 'store']);
    Route::get('/attendance/summary', [AttendanceController::class, 'summary']);
});
