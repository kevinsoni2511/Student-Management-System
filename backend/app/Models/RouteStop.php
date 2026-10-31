<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RouteStop extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'route_id',
        'stop_name',
        'pickup_time',
        'drop_time',
        'fare',
    ];

    public function route()
    {
        return $this->belongsTo(Route::class);
    }
}
