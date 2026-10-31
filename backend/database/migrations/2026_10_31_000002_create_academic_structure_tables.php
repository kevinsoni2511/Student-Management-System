<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Academic Sessions
        Schema::create('academic_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->string('session_name', 50); // e.g. "2026-2027"
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_active')->default(false);
            $table->timestamps();

            $table->unique(['school_id', 'session_name']);
        });

        // 2. School Classes
        Schema::create('school_classes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->string('class_name', 100);
            $table->integer('numeric_grade')->nullable();
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->timestamps();

            $table->unique(['school_id', 'class_name']);
        });

        // 3. Sections
        Schema::create('sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->foreignId('class_id')->constrained('school_classes')->cascadeOnDelete();
            $table->string('section_name', 50); // e.g. "A", "B", "Rose"
            $table->integer('capacity')->default(40);
            $table->timestamps();

            $table->unique(['school_id', 'class_id', 'section_name']);
        });

        // 4. Subjects
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->string('subject_name', 150);
            $table->string('subject_code', 50);
            $table->enum('subject_type', ['Theory', 'Practical', 'Both'])->default('Theory');
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->timestamps();

            $table->unique(['school_id', 'subject_code']);
        });

        // 5. Class Subjects Pivot
        Schema::create('class_subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->foreignId('class_id')->constrained('school_classes')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['school_id', 'class_id', 'subject_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('class_subjects');
        Schema::dropIfExists('subjects');
        Schema::dropIfExists('sections');
        Schema::dropIfExists('school_classes');
        Schema::dropIfExists('academic_sessions');
    }
};
