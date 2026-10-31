<?php

namespace App\Http\Controllers;

use App\Models\AcademicSession;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Subject;
use Illuminate\Http\Request;

class AcademicController extends Controller
{
    /**
     * Get Academic Sessions
     */
    public function sessions(Request $request)
    {
        $schoolId = $request->user()->school_id ?? 1;
        $sessions = AcademicSession::where('school_id', $schoolId)
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $sessions,
        ]);
    }

    /**
     * List all classes with sections and subjects
     */
    public function classes(Request $request)
    {
        $schoolId = $request->user()->school_id ?? 1;
        $classes = SchoolClass::where('school_id', $schoolId)
            ->with(['sections', 'subjects'])
            ->withCount(['students', 'sections'])
            ->orderBy('numeric_grade', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $classes,
        ]);
    }

    /**
     * Create a new class
     */
    public function storeClass(Request $request)
    {
        $schoolId = $request->user()->school_id ?? 1;

        $validated = $request->validate([
            'class_name' => 'required|string|max:100',
            'numeric_grade' => 'required|integer',
            'status' => 'required|in:Active,Inactive',
            'section_names' => 'nullable|array', // e.g. ['A', 'B']
        ]);

        $class = SchoolClass::create([
            'school_id' => $schoolId,
            'class_name' => $validated['class_name'],
            'numeric_grade' => $validated['numeric_grade'],
            'status' => $validated['status'],
        ]);

        // Auto-create sections if provided
        $sectionNames = $request->input('section_names', ['A']);
        foreach ($sectionNames as $sName) {
            Section::create([
                'school_id' => $schoolId,
                'class_id' => $class->id,
                'section_name' => trim($sName),
                'capacity' => 40,
            ]);
        }

        $class->load(['sections', 'subjects'])->loadCount(['students', 'sections']);

        return response()->json([
            'success' => true,
            'message' => 'Class created successfully.',
            'data' => $class,
        ], 201);
    }

    /**
     * Update class
     */
    public function updateClass(Request $request, $id)
    {
        $schoolId = $request->user()->school_id ?? 1;
        $class = SchoolClass::where('school_id', $schoolId)->findOrFail($id);

        $validated = $request->validate([
            'class_name' => 'required|string|max:100',
            'numeric_grade' => 'required|integer',
            'status' => 'required|in:Active,Inactive',
        ]);

        $class->update($validated);
        $class->load(['sections', 'subjects'])->loadCount(['students', 'sections']);

        return response()->json([
            'success' => true,
            'message' => 'Class updated successfully.',
            'data' => $class,
        ]);
    }

    /**
     * Delete class
     */
    public function deleteClass(Request $request, $id)
    {
        $schoolId = $request->user()->school_id ?? 1;
        $class = SchoolClass::where('school_id', $schoolId)->findOrFail($id);
        $class->delete();

        return response()->json([
            'success' => true,
            'message' => 'Class deleted successfully.',
        ]);
    }

    /**
     * List sections (optionally filter by class_id)
     */
    public function sections(Request $request)
    {
        $schoolId = $request->user()->school_id ?? 1;
        $query = Section::where('school_id', $schoolId)->with('schoolClass');

        if ($classId = $request->input('class_id')) {
            $query->where('class_id', $classId);
        }

        $sections = $query->orderBy('class_id')->orderBy('section_name')->get();

        return response()->json([
            'success' => true,
            'data' => $sections,
        ]);
    }

    /**
     * Create Section
     */
    public function storeSection(Request $request)
    {
        $schoolId = $request->user()->school_id ?? 1;

        $validated = $request->validate([
            'class_id' => 'required|exists:school_classes,id',
            'section_name' => 'required|string|max:50',
            'capacity' => 'nullable|integer|min:1|max:200',
        ]);

        $section = Section::create([
            'school_id' => $schoolId,
            'class_id' => $validated['class_id'],
            'section_name' => strtoupper(trim($validated['section_name'])),
            'capacity' => $validated['capacity'] ?? 40,
        ]);

        $section->load('schoolClass');

        return response()->json([
            'success' => true,
            'message' => 'Section created successfully.',
            'data' => $section,
        ], 201);
    }

    /**
     * List subjects
     */
    public function subjects(Request $request)
    {
        $schoolId = $request->user()->school_id ?? 1;
        $query = Subject::where('school_id', $schoolId)->with('classes');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('subject_name', 'like', "%{$search}%")
                  ->orWhere('subject_code', 'like', "%{$search}%");
            });
        }

        $subjects = $query->orderBy('subject_name')->get();

        return response()->json([
            'success' => true,
            'data' => $subjects,
        ]);
    }

    /**
     * Create subject
     */
    public function storeSubject(Request $request)
    {
        $schoolId = $request->user()->school_id ?? 1;

        $validated = $request->validate([
            'subject_name' => 'required|string|max:150',
            'subject_code' => 'required|string|max:50',
            'subject_type' => 'required|in:Theory,Practical,Both',
            'status' => 'required|in:Active,Inactive',
            'class_ids' => 'nullable|array',
        ]);

        $subject = Subject::create([
            'school_id' => $schoolId,
            'subject_name' => $validated['subject_name'],
            'subject_code' => strtoupper(trim($validated['subject_code'])),
            'subject_type' => $validated['subject_type'],
            'status' => $validated['status'],
        ]);

        if (!empty($validated['class_ids'])) {
            $syncData = [];
            foreach ($validated['class_ids'] as $cid) {
                $syncData[$cid] = ['school_id' => $schoolId];
            }
            $subject->classes()->sync($syncData);
        }

        $subject->load('classes');

        return response()->json([
            'success' => true,
            'message' => 'Subject created successfully.',
            'data' => $subject,
        ], 201);
    }

    /**
     * Update subject
     */
    public function updateSubject(Request $request, $id)
    {
        $schoolId = $request->user()->school_id ?? 1;
        $subject = Subject::where('school_id', $schoolId)->findOrFail($id);

        $validated = $request->validate([
            'subject_name' => 'required|string|max:150',
            'subject_code' => 'required|string|max:50',
            'subject_type' => 'required|in:Theory,Practical,Both',
            'status' => 'required|in:Active,Inactive',
            'class_ids' => 'nullable|array',
        ]);

        $subject->update([
            'subject_name' => $validated['subject_name'],
            'subject_code' => strtoupper(trim($validated['subject_code'])),
            'subject_type' => $validated['subject_type'],
            'status' => $validated['status'],
        ]);

        if (isset($validated['class_ids'])) {
            $syncData = [];
            foreach ($validated['class_ids'] as $cid) {
                $syncData[$cid] = ['school_id' => $schoolId];
            }
            $subject->classes()->sync($syncData);
        }

        $subject->load('classes');

        return response()->json([
            'success' => true,
            'message' => 'Subject updated successfully.',
            'data' => $subject,
        ]);
    }

    /**
     * Delete subject
     */
    public function deleteSubject(Request $request, $id)
    {
        $schoolId = $request->user()->school_id ?? 1;
        $subject = Subject::where('school_id', $schoolId)->findOrFail($id);
        $subject->delete();

        return response()->json([
            'success' => true,
            'message' => 'Subject deleted successfully.',
        ]);
    }
}
