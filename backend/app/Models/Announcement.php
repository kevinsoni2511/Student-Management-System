<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'title',
        'content',
        'target_role',
        'publish_date',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'publish_date' => 'date:Y-m-d',
        'is_active' => 'boolean',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
