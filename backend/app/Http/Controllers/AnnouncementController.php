<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AnnouncementController extends Controller
{
    /**
     * List active announcements
     */
    public function index(Request $request)
    {
        $schoolId = $request->user()->school_id ?? 1;

        $query = Announcement::where('school_id', $schoolId)
            ->with('author:id,name');

        if ($target = $request->input('target')) {
            $query->where(function ($q) use ($target) {
                $q->where('target_role', 'All')
                  ->orWhere('target_role', $target);
            });
        }

        $announcements = $query->orderBy('publish_date', 'desc')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $announcements,
        ]);
    }

    /**
     * Create announcement
     */
    public function store(Request $request)
    {
        $schoolId = $request->user()->school_id ?? 1;
        $userId = $request->user()->id ?? null;

        $validated = $request->validate([
            'title' => 'required|string|max:200',
            'content' => 'required|string',
            'target_role' => 'required|in:All,Teachers,Staff,Students,Parents',
            'publish_date' => 'required|date',
            'is_active' => 'nullable|boolean',
        ]);

        $announcement = Announcement::create([
            ...$validated,
            'school_id' => $schoolId,
            'created_by' => $userId,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        $announcement->load('author:id,name');

        return response()->json([
            'success' => true,
            'message' => 'Announcement published successfully.',
            'data' => $announcement,
        ], 201);
    }

    /**
     * Delete announcement
     */
    public function destroy(Request $request, $id)
    {
        $schoolId = $request->user()->school_id ?? 1;
        $announcement = Announcement::where('school_id', $schoolId)->findOrFail($id);
        $announcement->delete();

        return response()->json([
            'success' => true,
            'message' => 'Announcement removed successfully.',
        ]);
    }
}
