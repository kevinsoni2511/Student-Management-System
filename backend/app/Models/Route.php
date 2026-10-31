<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Route extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'route_name',
        'start_point',
        'end_point',
        'vehicle_id',
        'monthly_fare',
        'status',
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function stops()
    {
        return $this->hasMany(RouteStop::class);
    }

    public function studentTransports()
    {
        return $this->hasMany(StudentTransport::class);
    }
}
