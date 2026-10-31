<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RolePermission extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'role',
        'permission_key',
        'is_allowed',
    ];

    protected $casts = [
        'is_allowed' => 'boolean',
    ];
}
