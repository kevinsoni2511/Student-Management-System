<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdmissionEnquiry extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'student_name',
        'parent_name',
        'phone',
        'email',
        'class_seeking',
        'enquiry_date',
        'status',
        'notes',
        'assigned_to',
    ];

    protected $casts = [
        'enquiry_date' => 'date:Y-m-d',
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
