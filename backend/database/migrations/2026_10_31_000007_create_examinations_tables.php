<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Examination Cycles
        Schema::create('examinations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->foreignId('academic_session_id')->constrained('academic_sessions')->cascadeOnDelete();
            $table->string('exam_name', 150);
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['Scheduled', 'Ongoing', 'Completed'])->default('Scheduled');
            $table->timestamps();

            $table->unique(['school_id', 'academic_session_id', 'exam_name']);
        });

        // 2. Student Examination Marks & Grades
        Schema::create('exam_marks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->foreignId('examination_id')->constrained('examinations')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignId('class_id')->constrained('school_classes')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
            $table->decimal('max_marks', 6, 2)->default(100.00);
            $table->decimal('passing_marks', 6, 2)->default(35.00);
            $table->decimal('obtained_marks', 6, 2);
            $table->string('grade', 10)->nullable();
            $table->string('remarks', 255)->nullable();
            $table->timestamps();

            $table->unique(['school_id', 'examination_id', 'student_id', 'subject_id'], 'uniq_student_exam_subject_mark');
            $table->index(['school_id', 'examination_id', 'class_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_marks');
        Schema::dropIfExists('examinations');
    }
};
