<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\School;
use App\Models\User;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\FeePayment;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class SuperAdminController extends Controller
{
    public function overview()
    {
        $totalSchools = School::count();
        $activeSchools = School::where('status', 'Active')->count();
        $totalStudents = Student::count();
        $totalTeachers = Teacher::count();
        $totalRevenue = FeePayment::sum('amount_paid');

        $schools = School::withCount(['students', 'teachers', 'users'])
            ->latest()
            ->take(5)
            ->get();

        $recentSchools = $schools->map(function ($s) {
            return [
                'id' => $s->id,
                'name' => $s->name,
                'code' => $s->code,
                'city' => $s->city,
                'status' => $s->status,
                'students_count' => $s->students_count,
                'teachers_count' => $s->teachers_count,
                'created_at' => $s->created_at->format('Y-m-d'),
            ];
        });

        return response()->json([
            'success' => true,
            'statistics' => [
                'total_schools' => $totalSchools,
                'active_schools' => $activeSchools,
                'total_students' => $totalStudents,
                'total_teachers' => $totalTeachers,
                'total_platform_revenue' => (float)$totalRevenue,
                'server_status' => 'Healthy',
                'active_subscription_plan' => 'Enterprise Multi-Tenant',
                'database_version' => 'MySQL 8.0',
            ],
            'recent_schools' => $recentSchools,
        ]);
    }

    public function schools()
    {
        $schools = School::withCount(['students', 'teachers', 'users'])->latest()->get();
        return response()->json([
            'success' => true,
            'schools' => $schools,
        ]);
    }

    public function storeSchool(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:schools,code',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:30',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'currency_code' => 'nullable|string|max:10',
            'admin_name' => 'required|string|max:100',
            'admin_email' => 'required|email|unique:users,email',
            'admin_password' => 'required|string|min:6',
        ]);

        return DB::transaction(function () use ($validated) {
            $school = School::create([
                'name' => $validated['name'],
                'code' => strtoupper($validated['code']),
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'address' => $validated['address'],
                'city' => $validated['city'],
                'state' => $validated['state'],
                'currency' => '₹',
                'currency_code' => $validated['currency_code'] ?? 'INR',
                'status' => 'Active',
            ]);

            $admin = User::create([
                'school_id' => $school->id,
                'name' => $validated['admin_name'],
                'email' => $validated['admin_email'],
                'password' => Hash::make($validated['admin_password']),
                'role' => 'admin',
                'phone' => $validated['phone'],
                'status' => 'Active',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'New School Tenant and Admin Account created successfully.',
                'school' => $school,
                'admin' => $admin,
            ], 201);
        });
    }

    public function updateSchool(Request $request, $id)
    {
        $school = School::findOrFail($id);
        $school->update($request->only(['name', 'phone', 'address', 'city', 'state', 'status']));

        return response()->json([
            'success' => true,
            'message' => 'School updated successfully.',
            'school' => $school,
        ]);
    }
}
