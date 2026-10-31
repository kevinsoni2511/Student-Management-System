<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Vehicle;
use App\Models\Route;
use App\Models\RouteStop;
use App\Models\StudentTransport;
use App\Models\Student;

class TransportPortalController extends Controller
{
    public function dashboard(Request $request)
    {
        $schoolId = $request->user()->school_id;

        $totalVehicles = Vehicle::where('school_id', $schoolId)->count();
        $activeRoutes = Route::where('school_id', $schoolId)->where('status', 'Active')->count();
        $allocatedStudents = StudentTransport::where('school_id', $schoolId)->where('status', 'Active')->count();
        $totalCapacity = Vehicle::where('school_id', $schoolId)->sum('capacity');

        $vehicles = Vehicle::where('school_id', $schoolId)->get();
        $routes = Route::where('school_id', $schoolId)->with(['vehicle', 'stops'])->get();
        $recentAllocations = StudentTransport::where('school_id', $schoolId)
            ->with(['student.schoolClass', 'route', 'stop'])
            ->latest()
            ->take(6)
            ->get();

        return response()->json([
            'success' => true,
            'statistics' => [
                'total_vehicles' => $totalVehicles,
                'active_routes' => $activeRoutes,
                'allocated_students' => $allocatedStudents,
                'total_bus_capacity' => (int)$totalCapacity,
                'occupancy_rate' => $totalCapacity > 0 ? round(($allocatedStudents / $totalCapacity) * 100, 1) : 0,
            ],
            'vehicles' => $vehicles,
            'routes' => $routes,
            'recent_allocations' => $recentAllocations,
        ]);
    }

    public function vehicles(Request $request)
    {
        $schoolId = $request->user()->school_id;
        return response()->json([
            'success' => true,
            'vehicles' => Vehicle::where('school_id', $schoolId)->latest()->get(),
        ]);
    }

    public function storeVehicle(Request $request)
    {
        $schoolId = $request->user()->school_id;
        $validated = $request->validate([
            'vehicle_no' => 'required|string|max:50',
            'vehicle_model' => 'required|string|max:100',
            'capacity' => 'required|integer|min:1',
            'driver_name' => 'required|string|max:100',
            'driver_phone' => 'required|string|max:30',
            'driver_license' => 'nullable|string|max:100',
        ]);

        $vehicle = Vehicle::create(array_merge($validated, [
            'school_id' => $schoolId,
            'status' => 'Active',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Vehicle registered successfully.',
            'vehicle' => $vehicle,
        ], 201);
    }

    public function routes(Request $request)
    {
        $schoolId = $request->user()->school_id;
        return response()->json([
            'success' => true,
            'routes' => Route::where('school_id', $schoolId)->with(['vehicle', 'stops'])->get(),
        ]);
    }

    public function storeRoute(Request $request)
    {
        $schoolId = $request->user()->school_id;
        $validated = $request->validate([
            'route_name' => 'required|string|max:100',
            'start_point' => 'required|string|max:100',
            'end_point' => 'required|string|max:100',
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'monthly_fare' => 'required|numeric|min:0',
        ]);

        $route = Route::create(array_merge($validated, [
            'school_id' => $schoolId,
            'status' => 'Active',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Route registered successfully.',
            'route' => $route,
        ], 201);
    }

    public function allocateStudent(Request $request)
    {
        $schoolId = $request->user()->school_id;
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'route_id' => 'required|exists:routes,id',
            'stop_id' => 'nullable|exists:route_stops,id',
        ]);

        $alloc = StudentTransport::updateOrCreate(
            ['school_id' => $schoolId, 'student_id' => $validated['student_id']],
            [
                'route_id' => $validated['route_id'],
                'stop_id' => $validated['stop_id'] ?? null,
                'status' => 'Active',
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Student allocated to transport route successfully.',
            'allocation' => $alloc,
        ]);
    }
}
