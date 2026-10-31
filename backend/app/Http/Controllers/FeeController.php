<?php

namespace App\Http\Controllers;

use App\Models\FeeType;
use App\Models\FeeStructure;
use App\Models\StudentFee;
use App\Models\FeePayment;
use App\Models\Student;
use App\Models\School;
use Illuminate\Http\Request;
use Carbon\Carbon;

class FeeController extends Controller
{
    /**
     * List all fee structures by class & session
     */
    public function structures(Request $request)
    {
        $schoolId = $request->user()->school_id ?? 1;

        $structures = FeeStructure::where('school_id', $schoolId)
            ->with(['feeType', 'schoolClass', 'academicSession'])
            ->orderBy('class_id')
            ->get();

        $feeTypes = FeeType::where('school_id', $schoolId)->get();

        return response()->json([
            'success' => true,
            'data' => [
                'structures' => $structures,
                'fee_types' => $feeTypes,
            ],
        ]);
    }

    /**
     * Store new Fee Structure
     */
    public function storeStructure(Request $request)
    {
        $schoolId = $request->user()->school_id ?? 1;

        $validated = $request->validate([
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'class_id' => 'required|exists:school_classes,id',
            'fee_type_id' => 'required|exists:fee_types,id',
            'amount' => 'required|numeric|min:1',
            'due_date' => 'required|date',
            'frequency' => 'required|in:Annual,Monthly,Term-wise,One-Time',
        ]);

        $structure = FeeStructure::create([
            ...$validated,
            'school_id' => $schoolId,
        ]);

        $structure->load(['feeType', 'schoolClass', 'academicSession']);

        return response()->json([
            'success' => true,
            'message' => 'Fee structure established successfully.',
            'data' => $structure,
        ], 201);
    }

    /**
     * List Student Fee accounts with search, class filter, and payment status
     */
    public function studentFees(Request $request)
    {
        $schoolId = $request->user()->school_id ?? 1;

        $query = StudentFee::where('school_id', $schoolId)
            ->with([
                'student:id,admission_no,first_name,last_name,roll_no,phone,class_id,section_id',
                'student.schoolClass:id,class_name',
                'student.section:id,section_name',
                'feeStructure.feeType',
                'payments',
            ]);

        // Filter by class
        if ($classId = $request->input('class_id')) {
            $query->whereHas('student', function ($q) use ($classId) {
                $q->where('class_id', $classId);
            });
        }

        // Filter by status (Unpaid, Partial, Paid)
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Search by student name or admission number
        if ($search = $request->input('search')) {
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('admission_no', 'like', "%{$search}%");
            });
        }

        $records = $query->orderBy('id', 'desc')->paginate(15);

        // Overall stats
        $totalBilled = StudentFee::where('school_id', $schoolId)->sum('total_amount');
        $totalPaid = StudentFee::where('school_id', $schoolId)->sum('paid_amount');
        $totalDue = StudentFee::where('school_id', $schoolId)->sum('due_amount');

        return response()->json([
            'success' => true,
            'data' => $records->items(),
            'meta' => [
                'current_page' => $records->currentPage(),
                'last_page' => $records->lastPage(),
                'total' => $records->total(),
            ],
            'summary' => [
                'total_billed' => (float) $totalBilled,
                'total_paid' => (float) $totalPaid,
                'total_due' => (float) $totalDue,
            ],
        ]);
    }

    /**
     * Collect fee payment and generate printable receipt
     */
    public function collectPayment(Request $request)
    {
        $schoolId = $request->user()->school_id ?? 1;
        $userId = $request->user()->id ?? null;

        $validated = $request->validate([
            'student_fee_id' => 'required|exists:student_fees,id',
            'amount_paid' => 'required|numeric|min:1',
            'payment_method' => 'required|in:Cash,Online,UPI,Cheque,Bank Transfer',
            'transaction_ref' => 'nullable|string|max:100',
            'remarks' => 'nullable|string|max:255',
            'payment_date' => 'nullable|date',
        ]);

        $feeAccount = StudentFee::where('school_id', $schoolId)->findOrFail($validated['student_fee_id']);

        if ($validated['amount_paid'] > $feeAccount->due_amount) {
            return response()->json([
                'success' => false,
                'message' => "Payment amount ($" . number_format($validated['amount_paid'], 2) . ") exceeds current outstanding dues ($" . number_format($feeAccount->due_amount, 2) . ").",
            ], 422);
        }

        // Generate unique receipt number: REC-YYYYMMDD-XXXX
        $datePrefix = Carbon::now()->format('Ymd');
        $receiptCount = FeePayment::where('school_id', $schoolId)->count() + 1;
        $receiptNo = sprintf('REC-%s-%04d', $datePrefix, $receiptCount);

        $payment = FeePayment::create([
            'school_id' => $schoolId,
            'student_fee_id' => $feeAccount->id,
            'student_id' => $feeAccount->student_id,
            'receipt_no' => $receiptNo,
            'amount_paid' => $validated['amount_paid'],
            'payment_method' => $validated['payment_method'],
            'payment_date' => $validated['payment_date'] ?? Carbon::today()->toDateString(),
            'transaction_ref' => $validated['transaction_ref'] ?? null,
            'remarks' => $validated['remarks'] ?? 'Fee collection',
            'received_by' => $userId,
        ]);

        // Update fee balance & status
        $newPaidAmount = $feeAccount->paid_amount + $validated['amount_paid'];
        $newDueAmount = max(0, $feeAccount->due_amount - $validated['amount_paid']);
        $newStatus = $newDueAmount == 0 ? 'Paid' : 'Partial';

        $feeAccount->update([
            'paid_amount' => $newPaidAmount,
            'due_amount' => $newDueAmount,
            'status' => $newStatus,
        ]);

        $receiptData = $this->formatReceipt($payment);

        return response()->json([
            'success' => true,
            'message' => "Payment of $" . number_format($validated['amount_paid'], 2) . " processed successfully. Receipt: {$receiptNo}.",
            'data' => $receiptData,
        ], 201);
    }

    /**
     * List payment transactions
     */
    public function payments(Request $request)
    {
        $schoolId = $request->user()->school_id ?? 1;

        $payments = FeePayment::where('school_id', $schoolId)
            ->with(['student.schoolClass', 'studentFee.feeStructure.feeType', 'receivedBy:id,name'])
            ->orderBy('id', 'desc')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $payments->items(),
            'meta' => [
                'current_page' => $payments->currentPage(),
                'last_page' => $payments->lastPage(),
                'total' => $payments->total(),
            ],
        ]);
    }

    /**
     * Get specific receipt for viewing or printing
     */
    public function receipt(Request $request, $receiptNo)
    {
        $schoolId = $request->user()->school_id ?? 1;

        $payment = FeePayment::where('school_id', $schoolId)
            ->where('receipt_no', $receiptNo)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $this->formatReceipt($payment),
        ]);
    }

    /**
     * Helper to prepare receipt payload with school, student, and payment details
     */
    private function formatReceipt(FeePayment $payment)
    {
        $payment->load([
            'student.schoolClass',
            'student.section',
            'studentFee.feeStructure.feeType',
            'receivedBy:id,name',
        ]);

        $school = School::find($payment->school_id);

        return [
            'receipt_no' => $payment->receipt_no,
            'payment_date' => $payment->payment_date->format('Y-m-d'),
            'payment_method' => $payment->payment_method,
            'transaction_ref' => $payment->transaction_ref,
            'remarks' => $payment->remarks,
            'amount_paid' => (float) $payment->amount_paid,
            'school' => [
                'name' => $school->school_name ?? 'Greenwood High International School',
                'address' => $school->address ?? 'Sector 21, Institutional Area',
                'city' => $school->city ?? 'Bangalore',
                'phone' => $school->phone ?? '+91 80 2345 6789',
                'email' => $school->email ?? 'info@greenwoodhigh.edu',
            ],
            'student' => [
                'id' => $payment->student->id,
                'name' => $payment->student->full_name,
                'admission_no' => $payment->student->admission_no,
                'roll_no' => $payment->student->roll_no,
                'class' => $payment->student->schoolClass->class_name ?? 'N/A',
                'section' => $payment->student->section->section_name ?? 'A',
                'parent_name' => $payment->student->parent_name,
                'phone' => $payment->student->phone,
            ],
            'fee_details' => [
                'fee_type' => $payment->studentFee->feeStructure->feeType->fee_name ?? 'Tuition Fee',
                'total_amount' => (float) $payment->studentFee->total_amount,
                'paid_to_date' => (float) $payment->studentFee->paid_amount,
                'remaining_due' => (float) $payment->studentFee->due_amount,
                'status' => $payment->studentFee->status,
            ],
            'cashier' => $payment->receivedBy->name ?? 'Accounts Office',
        ];
    }
}
