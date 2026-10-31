<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Library Books
        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->string('title');
            $table->string('author');
            $table->string('isbn', 50)->nullable();
            $table->string('category', 100);
            $table->string('publisher')->nullable();
            $table->string('rack_no', 50)->nullable();
            $table->unsignedInteger('total_copies')->default(1);
            $table->unsignedInteger('available_copies')->default(1);
            $table->enum('status', ['Available', 'Out of Stock'])->default('Available');
            $table->timestamps();
        });

        // 2. Book Issues / Borrows
        Schema::create('book_issues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->foreignId('book_id')->constrained('books')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->date('issue_date');
            $table->date('due_date');
            $table->date('return_date')->nullable();
            $table->decimal('fine_amount', 10, 2)->default(0.00);
            $table->enum('status', ['Issued', 'Returned', 'Overdue'])->default('Issued');
            $table->string('remarks')->nullable();
            $table->foreignId('issued_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // 3. Transport Vehicles
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->string('vehicle_no', 50);
            $table->string('vehicle_model', 100);
            $table->unsignedInteger('capacity');
            $table->string('driver_name', 100);
            $table->string('driver_phone', 30);
            $table->string('driver_license', 100)->nullable();
            $table->enum('status', ['Active', 'Maintenance', 'Inactive'])->default('Active');
            $table->timestamps();
        });

        // 4. Transport Routes
        Schema::create('routes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->string('route_name', 100);
            $table->string('start_point', 100);
            $table->string('end_point', 100);
            $table->foreignId('vehicle_id')->nullable()->constrained('vehicles')->nullOnDelete();
            $table->decimal('monthly_fare', 10, 2)->default(0.00);
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->timestamps();
        });

        // 5. Route Stops
        Schema::create('route_stops', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->foreignId('route_id')->constrained('routes')->cascadeOnDelete();
            $table->string('stop_name', 100);
            $table->time('pickup_time')->nullable();
            $table->time('drop_time')->nullable();
            $table->decimal('fare', 10, 2)->default(0.00);
            $table->timestamps();
        });

        // 6. Student Transport Allocations
        Schema::create('student_transports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignId('route_id')->constrained('routes')->cascadeOnDelete();
            $table->foreignId('stop_id')->nullable()->constrained('route_stops')->nullOnDelete();
            $table->enum('status', ['Active', 'Inactive'])->default('Active');
            $table->timestamps();
        });

        // 7. Receptionist Admission Enquiries
        Schema::create('admission_enquiries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->string('student_name', 100);
            $table->string('parent_name', 100);
            $table->string('phone', 30);
            $table->string('email', 100)->nullable();
            $table->string('class_seeking', 50);
            $table->date('enquiry_date');
            $table->enum('status', ['Pending', 'Follow Up', 'Approved', 'Rejected'])->default('Pending');
            $table->text('notes')->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // 8. Dynamic Permissions Matrix
        Schema::create('role_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()->constrained('schools')->cascadeOnDelete();
            $table->string('role', 50);
            $table->string('permission_key', 100);
            $table->boolean('is_allowed')->default(true);
            $table->timestamps();
            $table->unique(['school_id', 'role', 'permission_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('role_permissions');
        Schema::dropIfExists('admission_enquiries');
        Schema::dropIfExists('student_transports');
        Schema::dropIfExists('route_stops');
        Schema::dropIfExists('routes');
        Schema::dropIfExists('vehicles');
        Schema::dropIfExists('book_issues');
        Schema::dropIfExists('books');
    }
};
