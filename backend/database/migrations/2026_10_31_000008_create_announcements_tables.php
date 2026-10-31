<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
            $table->string('title', 200);
            $table->text('content');
            $table->enum('target_role', ['All', 'Teachers', 'Staff', 'Students', 'Parents'])->default('All');
            $table->date('publish_date');
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['school_id', 'is_active', 'publish_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};
