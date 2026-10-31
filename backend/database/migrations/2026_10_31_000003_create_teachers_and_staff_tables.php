<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Teachers Table
        Schema::create('teachers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('employee_id', 50);
            $table->string('name', 150);
            $table->string('email', 150)->nullable();
            $table->string('phone', 30);
            $table->enum('gender', ['Male', 'Female', 'Other'])->default('Male');
            $table->date('date_of_birth')->nullable();
            $table->string('qualification', 150)->nullable();
            $table->string('experience', 100)->nullable();
            $table->date('joining_date');
            $table->decimal('salary', 10, 2)->default(0.00);
            $table->enum('status', ['Active', 'Inactive', 'On Leave'])->default('Active');
            $table->string('avatar', 255)->nullable();
            $table->timestamps();

            $table->unique(['school_id', 'employee_id']);
            $table->index('status');
        });

        // 2. Non-Teaching Staff Table
        Schema::create('staff', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('employee_id', 50);
            $table->string('name', 150);
            $table->string('department', 100);
            $table->string('designation', 100);
            $table->string('email', 150)->nullable();
            $table->string('phone', 30);
            $table->date('joining_date');
            $table->decimal('salary', 10, 2)->default(0.00);
            $table->enum('status', ['Active', 'Inactive', 'On Leave'])->default('Active');
            $table->timestamps();

            $table->unique(['school_id', 'employee_id']);
            $table->index('department');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staff');
        Schema::dropIfExists('teachers');
    }
};
