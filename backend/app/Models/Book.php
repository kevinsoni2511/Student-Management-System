<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'title',
        'author',
        'isbn',
        'category',
        'publisher',
        'rack_no',
        'total_copies',
        'available_copies',
        'status',
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function issues()
    {
        return $this->hasMany(BookIssue::class);
    }
}
