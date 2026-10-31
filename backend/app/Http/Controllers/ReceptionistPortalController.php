<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AdmissionEnquiry;
use App\Models\Student;
use App\Models\SchoolClass;
use Carbon\Carbon;

class ReceptionistPortalController extends Controller
{
    public function dashboard(Request $request)
    {
        $schoolId = $request->user()->school_id;
        $today = Carbon::today()->toDateString();

        $totalEnquiries = AdmissionEnquiry::where('school_id', $schoolId)->count();
        $pendingEnquiries = AdmissionEnquiry::where('school_id', $schoolId)->where('status', 'Pending')->count();
        $approvedAdmissions = AdmissionEnquiry::where('school_id', $schoolId)->where('status', 'Approved')->count();
        $todayEnquiries = AdmissionEnquiry::where('school_id', $schoolId)->whereDate('enquiry_date', $today)->count();

        $recentEnquiries = AdmissionEnquiry::where('school_id', $schoolId)
            ->latest()
            ->take(8)
            ->get();

        $classes = SchoolClass::where('school_id', $schoolId)->where('status', 'Active')->get();

        return response()->json([
            'success' => true,
            'statistics' => [
                'total_enquiries' => $totalEnquiries,
                'pending_follow_ups' => $pendingEnquiries,
                'approved_admissions' => $approvedAdmissions,
                'today_enquiries' => $todayEnquiries,
            ],
            'recent_enquiries' => $recentEnquiries,
            'classes' => $classes,
        ]);
    }

    public function enquiries(Request $request)
    {
        $schoolId = $request->user()->school_id;
        $status = $request->query('status');

        $query = AdmissionEnquiry::where('school_id', $schoolId)->latest();
        if ($status) {
            $query->where('status', $status);
        }

        return response()->json([
            'success' => true,
            'enquiries' => $query->get(),
        ]);
    }

    public function storeEnquiry(Request $request)
    {
        $schoolId = $request->user()->school_id;
        $validated = $request->validate([
            'student_name' => 'required|string|max:100',
            'parent_name' => 'required|string|max:100',
            'phone' => 'required|string|max:30',
            'email' => 'nullable|email|max:100',
            'class_seeking' => 'required|string|max:50',
            'notes' => 'nullable|string',
        ]);

        $enquiry = AdmissionEnquiry::create([
            'school_id' => $schoolId,
            'student_name' => $validated['student_name'],
            'parent_name' => $validated['parent_name'],
            'phone' => $validated['phone'],
            'email' => $validated['email'] ?? null,
            'class_seeking' => $validated['class_seeking'],
            'enquiry_date' => Carbon::today()->toDateString(),
            'status' => 'Pending',
            'notes' => $validated['notes'] ?? null,
            'assigned_to' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Admission Enquiry registered successfully.',
            'enquiry' => $enquiry,
        ], 201);
    }

    public function updateEnquiryStatus(Request $request, $id)
    {
        $schoolId = $request->user()->school_id;
        $enquiry = AdmissionEnquiry::where('school_id', $schoolId)->findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:Pending,Follow Up,Approved,Rejected',
            'notes' => 'nullable|string',
        ]);

        $enquiry->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Enquiry status updated successfully.',
            'enquiry' => $enquiry,
        ]);
    }

    public function searchStudent(Request $request)
    {
        $schoolId = $request->user()->school_id;
        $q = $request->query('q', '');

        $students = Student::where('school_id', $schoolId)
            ->where(function ($query) use ($q) {
                $query->where('first_name', 'like', "%{$q}%")
                      ->orWhere('last_name', 'like', "%{$q}%")
                      ->orWhere('admission_no', 'like', "%{$q}%")
                      ->orWhere('phone', 'like', "%{$q}%")
                      ->orWhere('parent_name', 'like', "%{$q}%");
            })
            ->with(['schoolClass', 'section'])
            ->take(15)
            ->get();

        return response()->json([
            'success' => true,
            'students' => $students,
        ]);
    }
}
