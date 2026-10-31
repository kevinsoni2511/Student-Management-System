<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\RolePermission;

class PermissionController extends Controller
{
    public function index(Request $request)
    {
        $schoolId = $request->user()->school_id;

        $defaultPermissions = [
            'admin' => ['manage_students' => true, 'manage_teachers' => true, 'manage_academics' => true, 'manage_fees' => true, 'manage_exams' => true, 'view_reports' => true, 'system_settings' => true],
            'principal' => ['manage_students' => true, 'manage_teachers' => true, 'manage_academics' => true, 'manage_fees' => false, 'manage_exams' => true, 'view_reports' => true, 'system_settings' => false],
            'teacher' => ['mark_attendance' => true, 'enter_marks' => true, 'assign_homework' => true, 'view_assigned_students' => true, 'manage_fees' => false, 'admin_settings' => false],
            'accountant' => ['manage_fees' => true, 'collect_fees' => true, 'generate_receipts' => true, 'view_financial_reports' => true, 'modify_grades' => false],
            'receptionist' => ['manage_enquiries' => true, 'register_admission' => true, 'search_directory' => true, 'view_finances' => false],
            'librarian' => ['manage_books' => true, 'issue_books' => true, 'collect_fines' => true, 'delete_students' => false],
            'transport_manager' => ['manage_vehicles' => true, 'manage_routes' => true, 'allocate_transport' => true, 'view_academic_grades' => false],
            'parent' => ['view_own_children' => true, 'view_attendance' => true, 'view_marks' => true, 'pay_fees' => true, 'view_other_students' => false],
            'student' => ['view_own_timetable' => true, 'view_own_attendance' => true, 'submit_homework' => true, 'view_own_marks' => true, 'edit_records' => false],
        ];

        $custom = RolePermission::where('school_id', $schoolId)->get();

        return response()->json([
            'success' => true,
            'permissions_matrix' => $defaultPermissions,
            'custom_overrides' => $custom,
        ]);
    }

    public function togglePermission(Request $request)
    {
        $schoolId = $request->user()->school_id;
        $validated = $request->validate([
            'role' => 'required|string',
            'permission_key' => 'required|string',
            'is_allowed' => 'required|boolean',
        ]);

        $perm = RolePermission::updateOrCreate(
            [
                'school_id' => $schoolId,
                'role' => $validated['role'],
                'permission_key' => $validated['permission_key'],
            ],
            [
                'is_allowed' => $validated['is_allowed'],
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Permission updated successfully.',
            'permission' => $perm,
        ]);
    }
}
