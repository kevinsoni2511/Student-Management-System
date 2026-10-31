<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Fee Types (Tuition, Admission, Exam, Transport, etc.)
        Schema::create('fee_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->string('fee_name', 100);
            $table->text('description')->nullable();
            $table->timestamps();

            $table->unique(['school_id', 'fee_name']);
        });

        // 2. Fee Structures (Class-wise fee amounts)
        Schema::create('fee_structures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->foreignId('academic_session_id')->constrained('academic_sessions')->cascadeOnDelete();
            $table->foreignId('class_id')->constrained('school_classes')->cascadeOnDelete();
            $table->foreignId('fee_type_id')->constrained('fee_types')->cascadeOnDelete();
            $table->decimal('amount', 10, 2);
            $table->date('due_date')->nullable();
            $table->timestamps();

            $table->unique(['school_id', 'academic_session_id', 'class_id', 'fee_type_id'], 'uniq_fee_struct');
        });

        // 3. Student Assigned Fees
        Schema::create('student_fees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignId('fee_structure_id')->constrained('fee_structures')->cascadeOnDelete();
            $table->foreignId('academic_session_id')->constrained('academic_sessions')->cascadeOnDelete();
            $table->decimal('total_amount', 10, 2);
            $table->decimal('discount', 10, 2)->default(0.00);
            $table->decimal('paid_amount', 10, 2)->default(0.00);
            $table->decimal('due_amount', 10, 2);
            $table->enum('status', ['Paid', 'Partial', 'Unpaid'])->default('Unpaid');
            $table->timestamps();

            $table->unique(['school_id', 'student_id', 'fee_structure_id'], 'uniq_student_assigned_fee');
            $table->index(['school_id', 'status']);
        });

        // 4. Financial Payment Receipts
        Schema::create('fee_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->foreignId('student_fee_id')->constrained('student_fees')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->string('receipt_no', 50)->unique();
            $table->decimal('amount_paid', 10, 2);
            $table->enum('payment_method', ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Online'])->default('Cash');
            $table->date('payment_date');
            $table->string('transaction_ref', 100)->nullable();
            $table->string('remarks', 255)->nullable();
            $table->foreignId('received_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['school_id', 'payment_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fee_payments');
        Schema::dropIfExists('student_fees');
        Schema::dropIfExists('fee_structures');
        Schema::dropIfExists('fee_types');
    }
};
