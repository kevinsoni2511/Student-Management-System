<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamMark extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'examination_id',
        'student_id',
        'class_id',
        'subject_id',
        'max_marks',
        'passing_marks',
        'obtained_marks',
        'grade',
        'remarks',
    ];

    protected $casts = [
        'max_marks' => 'decimal:2',
        'passing_marks' => 'decimal:2',
        'obtained_marks' => 'decimal:2',
    ];

    protected $appends = ['marks_obtained'];

    public function getMarksObtainedAttribute()
    {
        return $this->obtained_marks;
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function examination()
    {
        return $this->belongsTo(Examination::class);
    }
}
