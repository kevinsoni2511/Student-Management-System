<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FeePayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'student_fee_id',
        'student_id',
        'receipt_no',
        'amount_paid',
        'payment_method',
        'payment_date',
        'transaction_ref',
        'remarks',
        'received_by',
    ];

    protected $casts = [
        'amount_paid' => 'decimal:2',
        'payment_date' => 'date:Y-m-d',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function studentFee()
    {
        return $this->belongsTo(StudentFee::class);
    }

    public function receivedBy()
    {
        return $this->belongsTo(User::class, 'received_by');
    }
}
