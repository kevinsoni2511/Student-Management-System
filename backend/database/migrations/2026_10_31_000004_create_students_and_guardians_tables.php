<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('academic_session_id')->constrained('academic_sessions')->cascadeOnDelete();
            $table->foreignId('class_id')->constrained('school_classes')->cascadeOnDelete();
            $table->foreignId('section_id')->nullable()->constrained('sections')->nullOnDelete();

            // Admission & Identity
            $table->string('admission_no', 50);
            $table->string('roll_no', 30)->nullable();
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->enum('gender', ['Male', 'Female', 'Other'])->default('Male');
            $table->date('date_of_birth');
            $table->string('blood_group', 10)->nullable();
            $table->string('religion', 50)->nullable();
            $table->string('nationality', 50)->default('Indian');

            // Contact
            $table->string('email', 150)->nullable();
            $table->string('phone', 30)->nullable();
            $table->text('address')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('state', 100)->nullable();
            $table->string('pincode', 20)->nullable();

            // Academic Enrollment
            $table->date('admission_date');
            $table->string('previous_school', 150)->nullable();

            // Parent / Guardian Information
            $table->string('parent_name', 150);
            $table->string('parent_relation', 50)->default('Father');
            $table->string('parent_phone', 30);
            $table->string('parent_email', 150)->nullable();
            $table->string('parent_occupation', 100)->nullable();
            $table->string('emergency_contact', 30)->nullable();

            // Media & Status
            $table->string('profile_photo', 255)->nullable();
            $table->enum('status', ['Active', 'Inactive', 'Alumni', 'Suspended'])->default('Active');
            $table->timestamps();

            // Indexes & Constraints
            $table->unique(['school_id', 'admission_no']);
            $table->index(['school_id', 'class_id', 'section_id']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
