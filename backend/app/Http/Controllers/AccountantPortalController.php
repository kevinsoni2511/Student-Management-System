<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\FeePayment;
use App\Models\StudentFee;
use App\Models\Student;
use App\Models\FeeStructure;
use App\Models\FeeType;
use Carbon\Carbon;

class AccountantPortalController extends Controller
{
    public function dashboard(Request $request)
    {
        $schoolId = $request->user()->school_id;
        $today = Carbon::today()->toDateString();
        $thisMonth = Carbon::now()->month;
        $thisYear = Carbon::now()->year;

        $totalBilled = StudentFee::where('school_id', $schoolId)->sum('total_amount');
        $totalCollected = StudentFee::where('school_id', $schoolId)->sum('paid_amount');
        $totalPending = StudentFee::where('school_id', $schoolId)->sum('due_amount');
        $totalDiscounts = StudentFee::where('school_id', $schoolId)->sum('discount');

        $todayCollected = FeePayment::where('school_id', $schoolId)
            ->whereDate('payment_date', $today)
            ->sum('amount_paid');

        $recentPayments = FeePayment::where('school_id', $schoolId)
            ->with(['student.schoolClass'])
            ->latest()
            ->take(8)
            ->get();

        $feeStructures = FeeStructure::where('school_id', $schoolId)
            ->with(['schoolClass', 'feeType'])
            ->get();

        return response()->json([
            'success' => true,
            'statistics' => [
                'total_billed' => (float)$totalBilled,
                'total_collected' => (float)$totalCollected,
                'total_pending' => (float)$totalPending,
                'total_discounts' => (float)$totalDiscounts,
                'today_collected' => (float)$todayCollected,
                'collection_rate' => $totalBilled > 0 ? round(($totalCollected / $totalBilled) * 100, 1) : 0,
            ],
            'recent_payments' => $recentPayments,
            'fee_structures' => $feeStructures,
        ]);
    }

    public function pendingDues(Request $request)
    {
        $schoolId = $request->user()->school_id;
        $pending = StudentFee::where('school_id', $schoolId)
            ->where('due_amount', '>', 0)
            ->with(['student.schoolClass', 'feeStructure.feeType'])
            ->paginate(15);

        return response()->json([
            'success' => true,
            'pending_records' => $pending,
        ]);
    }
}
