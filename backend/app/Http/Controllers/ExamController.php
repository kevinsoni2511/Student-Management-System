<?php

namespace App\Http\Controllers;

use App\Models\Examination;
use App\Models\ExamMark;
use App\Models\Student;
use App\Models\Subject;
use App\Models\School;
use Illuminate\Http\Request;

class ExamController extends Controller
{
    /**
     * List all examinations
     */
    public function index(Request $request)
    {
        $schoolId = $request->user()->school_id ?? 1;

        $exams = Examination::where('school_id', $schoolId)
            ->with('academicSession')
            ->orderBy('start_date', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $exams,
        ]);
    }

    /**
     * Create examination
     */
    public function store(Request $request)
    {
        $schoolId = $request->user()->school_id ?? 1;

        $validated = $request->validate([
            'academic_session_id' => 'required|exists:academic_sessions,id',
            'exam_name' => 'required|string|max:150',
            'exam_type' => 'required|in:Terminal,Unit Test,Mid-Term,Final,Practical',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'status' => 'required|in:Scheduled,Ongoing,Completed',
        ]);

        $exam = Examination::create([
            ...$validated,
            'school_id' => $schoolId,
        ]);

        $exam->load('academicSession');

        return response()->json([
            'success' => true,
            'message' => 'Examination scheduled successfully.',
            'data' => $exam,
        ], 201);
    }

    /**
     * Get marks sheet for an exam, class, section, and subject
     */
    public function marksSheet(Request $request)
    {
        $schoolId = $request->user()->school_id ?? 1;

        $request->validate([
            'examination_id' => 'required|exists:examinations,id',
            'class_id' => 'required|exists:school_classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'section_id' => 'nullable|exists:sections,id',
        ]);

        $examId = $request->input('examination_id');
        $classId = $request->input('class_id');
        $subjectId = $request->input('subject_id');
        $sectionId = $request->input('section_id');

        $studentsQuery = Student::where('school_id', $schoolId)
            ->where('class_id', $classId)
            ->where('status', 'Active');

        if ($sectionId) {
            $studentsQuery->where('section_id', $sectionId);
        }

        $students = $studentsQuery->orderBy('roll_no', 'asc')->orderBy('first_name', 'asc')->get();

        $existingMarks = ExamMark::where('school_id', $schoolId)
            ->where('examination_id', $examId)
            ->where('subject_id', $subjectId)
            ->get()
            ->keyBy('student_id');

        $rows = $students->map(function ($stu) use ($existingMarks) {
            $mark = $existingMarks->get($stu->id);
            return [
                'student_id' => $stu->id,
                'admission_no' => $stu->admission_no,
                'roll_no' => $stu->roll_no,
                'student_name' => $stu->full_name,
                'marks_obtained' => $mark ? (float) $mark->marks_obtained : null,
                'max_marks' => $mark ? (float) $mark->max_marks : 100,
                'grade' => $mark ? $mark->grade : null,
                'is_absent' => $mark ? (bool) $mark->is_absent : false,
                'remarks' => $mark ? $mark->remarks : '',
                'is_saved' => $mark !== null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'examination_id' => (int) $examId,
                'subject_id' => (int) $subjectId,
                'class_id' => (int) $classId,
                'section_id' => $sectionId ? (int) $sectionId : null,
                'students' => $rows,
            ],
        ]);
    }

    /**
     * Save marks entry sheet
     */
    public function saveMarks(Request $request)
    {
        $schoolId = $request->user()->school_id ?? 1;

        $validated = $request->validate([
            'examination_id' => 'required|exists:examinations,id',
            'subject_id' => 'required|exists:subjects,id',
            'max_marks' => 'nullable|numeric|min:10|max:500',
            'records' => 'required|array|min:1',
            'records.*.student_id' => 'required|exists:students,id',
            'records.*.marks_obtained' => 'nullable|numeric|min:0',
            'records.*.is_absent' => 'nullable|boolean',
            'records.*.remarks' => 'nullable|string|max:255',
        ]);

        $maxMarks = $validated['max_marks'] ?? 100;

        foreach ($validated['records'] as $rec) {
            $isAbsent = !empty($rec['is_absent']);
            $marksObtained = $isAbsent ? 0.00 : (isset($rec['marks_obtained']) ? (float) $rec['marks_obtained'] : 0.00);

            // Grade calculation
            $percentage = $maxMarks > 0 ? ($marksObtained / $maxMarks) * 100 : 0;
            $grade = $this->calculateGrade($percentage, $isAbsent);

            $student = Student::find($rec['student_id']);
            $classId = $student ? $student->class_id : 1;

            ExamMark::updateOrCreate(
                [
                    'school_id' => $schoolId,
                    'examination_id' => $validated['examination_id'],
                    'student_id' => $rec['student_id'],
                    'subject_id' => $validated['subject_id'],
                ],
                [
                    'class_id' => $classId,
                    'max_marks' => $maxMarks,
                    'passing_marks' => round($maxMarks * 0.35, 2),
                    'obtained_marks' => $marksObtained,
                    'grade' => $grade,
                    'remarks' => $rec['remarks'] ?? null,
                ]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Examination marks saved successfully for ' . count($validated['records']) . ' students.',
        ]);
    }

    /**
     * Generate student report card
     */
    public function reportCard(Request $request, $studentId)
    {
        $schoolId = $request->user()->school_id ?? 1;

        $student = Student::where('school_id', $schoolId)
            ->with(['schoolClass', 'section', 'academicSession'])
            ->findOrFail($studentId);

        $examQuery = Examination::where('school_id', $schoolId);
        if ($examId = $request->input('examination_id')) {
            $examQuery->where('id', $examId);
        }
        $exam = $examQuery->latest('id')->first();

        if (!$exam) {
            return response()->json([
                'success' => false,
                'message' => 'No examination found to generate report card.',
            ], 404);
        }

        $marks = ExamMark::where('school_id', $schoolId)
            ->where('examination_id', $exam->id)
            ->where('student_id', $student->id)
            ->with('subject')
            ->get();

        $totalMax = 0;
        $totalObtained = 0;
        $subjectsSummary = [];

        foreach ($marks as $m) {
            $totalMax += $m->max_marks;
            $totalObtained += $m->marks_obtained;
            $subjectsSummary[] = [
                'subject_name' => $m->subject->subject_name ?? 'Subject',
                'subject_code' => $m->subject->subject_code ?? '',
                'subject_type' => $m->subject->subject_type ?? 'Theory',
                'max_marks' => (float) $m->max_marks,
                'marks_obtained' => (float) $m->marks_obtained,
                'grade' => $m->grade,
                'is_absent' => (bool) $m->is_absent,
            ];
        }

        $aggregatePercentage = $totalMax > 0 ? round(($totalObtained / $totalMax) * 100, 2) : 0;
        $overallGrade = $this->calculateGrade($aggregatePercentage, false);

        $school = School::find($schoolId);

        return response()->json([
            'success' => true,
            'data' => [
                'school' => [
                    'name' => $school->school_name ?? 'Greenwood High School',
                    'affiliation' => $school->affiliation_no ?? 'CBSE Affiliation # 2026/8941',
                    'address' => $school->address ?? 'Institutional Area, Sector 21',
                    'phone' => $school->phone ?? '+91 80 2345 6789',
                ],
                'exam' => [
                    'id' => $exam->id,
                    'name' => $exam->exam_name,
                    'type' => $exam->exam_type,
                    'session' => $student->academicSession->session_name ?? '2026-2027',
                ],
                'student' => [
                    'id' => $student->id,
                    'name' => $student->full_name,
                    'admission_no' => $student->admission_no,
                    'roll_no' => $student->roll_no,
                    'class' => $student->schoolClass->class_name ?? 'N/A',
                    'section' => $student->section->section_name ?? 'A',
                    'parent_name' => $student->parent_name,
                ],
                'subjects' => $subjectsSummary,
                'totals' => [
                    'total_max' => (float) $totalMax,
                    'total_obtained' => (float) $totalObtained,
                    'percentage' => $aggregatePercentage,
                    'grade' => $overallGrade,
                    'result' => $aggregatePercentage >= 40 ? 'PASS' : 'NEEDS IMPROVEMENT',
                ],
            ],
        ]);
    }

    private function calculateGrade($percentage, $isAbsent)
    {
        if ($isAbsent) return 'AB';
        if ($percentage >= 90) return 'A+';
        if ($percentage >= 80) return 'A';
        if ($percentage >= 70) return 'B+';
        if ($percentage >= 60) return 'B';
        if ($percentage >= 50) return 'C';
        if ($percentage >= 40) return 'D';
        return 'F';
    }
}
