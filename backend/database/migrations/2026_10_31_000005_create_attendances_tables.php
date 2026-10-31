<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Student Daily Attendance
        Schema::create('student_attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignId('class_id')->constrained('school_classes')->cascadeOnDelete();
            $table->foreignId('section_id')->nullable()->constrained('sections')->nullOnDelete();
            $table->foreignId('academic_session_id')->nullable()->constrained('academic_sessions')->nullOnDelete();
            $table->date('attendance_date');
            $table->enum('status', ['Present', 'Absent', 'Late', 'Half-day'])->default('Present');
            $table->string('remarks', 255)->nullable();
            $table->foreignId('marked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['school_id', 'student_id', 'attendance_date'], 'uniq_student_daily_att');
            $table->index(['school_id', 'class_id', 'attendance_date']);
            $table->index('status');
        });

        // 2. Teacher & Staff Employee Attendance
        Schema::create('employee_attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->date('attendance_date');
            $table->enum('status', ['Present', 'Absent', 'Late', 'Half-day', 'On Leave'])->default('Present');
            $table->time('check_in')->nullable();
            $table->time('check_out')->nullable();
            $table->string('remarks', 255)->nullable();
            $table->timestamps();

            $table->unique(['school_id', 'user_id', 'attendance_date'], 'uniq_employee_daily_att');
            $table->index(['school_id', 'attendance_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_attendances');
        Schema::dropIfExists('student_attendances');
    }
};
