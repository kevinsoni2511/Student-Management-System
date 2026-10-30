<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignId('course_id')->nullable()->constrained('courses')->nullOnDelete();
            $table->date('attendance_date');
            $table->enum('status', ['Present', 'Absent', 'Late'])->default('Present');
            $table->string('remarks', 255)->nullable();
            $table->timestamps();

            // Business rule: Student cannot have duplicate attendance for the same date
            $table->unique(['student_id', 'attendance_date'], 'uniq_student_attendance_date');
            $table->index('attendance_date');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
