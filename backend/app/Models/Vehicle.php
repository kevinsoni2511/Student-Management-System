<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'vehicle_no',
        'vehicle_model',
        'capacity',
        'driver_name',
        'driver_phone',
        'driver_license',
        'status',
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function routes()
    {
        return $this->hasMany(Route::class);
    }
}
