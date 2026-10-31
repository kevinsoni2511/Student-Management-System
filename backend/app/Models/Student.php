<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'user_id',
        'academic_session_id',
        'class_id',
        'section_id',
        'admission_no',
        'roll_no',
        'first_name',
        'last_name',
        'gender',
        'date_of_birth',
        'blood_group',
        'religion',
        'nationality',
        'email',
        'phone',
        'address',
        'city',
        'state',
        'pincode',
        'admission_date',
        'previous_school',
        'parent_name',
        'parent_relation',
        'parent_phone',
        'parent_email',
        'parent_occupation',
        'emergency_contact',
        'profile_photo',
        'status',
    ];

    protected $casts = [
        'date_of_birth' => 'date:Y-m-d',
        'admission_date' => 'date:Y-m-d',
    ];

    protected $appends = ['full_name'];

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function section()
    {
        return $this->belongsTo(Section::class, 'section_id');
    }

    public function academicSession()
    {
        return $this->belongsTo(AcademicSession::class, 'academic_session_id');
    }

    public function attendances()
    {
        return $this->hasMany(StudentAttendance::class, 'student_id');
    }

    public function fees()
    {
        return $this->hasMany(StudentFee::class, 'student_id');
    }

    public function marks()
    {
        return $this->hasMany(ExamMark::class, 'student_id');
    }
}
