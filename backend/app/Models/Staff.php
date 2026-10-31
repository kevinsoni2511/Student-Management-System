<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    use HasFactory;

    protected $table = 'staff';

    protected $fillable = [
        'school_id',
        'user_id',
        'employee_id',
        'name',
        'department',
        'designation',
        'email',
        'phone',
        'joining_date',
        'salary',
        'status',
    ];

    protected $casts = [
        'joining_date' => 'date:Y-m-d',
        'salary' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
