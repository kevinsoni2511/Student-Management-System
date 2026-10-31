<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentTransport extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'student_id',
        'route_id',
        'stop_id',
        'status',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function route()
    {
        return $this->belongsTo(Route::class);
    }

    public function stop()
    {
        return $this->belongsTo(RouteStop::class, 'stop_id');
    }
}
