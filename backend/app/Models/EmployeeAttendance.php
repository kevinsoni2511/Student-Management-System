<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeAttendance extends Model
{
    use HasFactory;

    protected $table = 'employee_attendances';

    protected $fillable = [
        'school_id',
        'user_id',
        'attendance_date',
        'status',
        'check_in',
        'check_out',
        'remarks',
    ];

    protected $casts = [
        'attendance_date' => 'date:Y-m-d',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
