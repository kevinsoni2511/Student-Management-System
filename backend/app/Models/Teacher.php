<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Teacher extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'user_id',
        'employee_id',
        'name',
        'email',
        'phone',
        'gender',
        'date_of_birth',
        'qualification',
        'experience',
        'joining_date',
        'salary',
        'status',
        'avatar',
    ];

    protected $casts = [
        'date_of_birth' => 'date:Y-m-d',
        'joining_date' => 'date:Y-m-d',
        'salary' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function school()
    {
        return $this->belongsTo(School::class);
    }
}
