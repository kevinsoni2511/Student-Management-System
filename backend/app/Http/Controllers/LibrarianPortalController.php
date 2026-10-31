<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Book;
use App\Models\BookIssue;
use App\Models\Student;
use Carbon\Carbon;

class LibrarianPortalController extends Controller
{
    public function dashboard(Request $request)
    {
        $schoolId = $request->user()->school_id;

        $totalBooks = Book::where('school_id', $schoolId)->sum('total_copies');
        $availableBooks = Book::where('school_id', $schoolId)->sum('available_copies');
        $issuedBooks = BookIssue::where('school_id', $schoolId)->where('status', 'Issued')->count();
        $overdueBooks = BookIssue::where('school_id', $schoolId)
            ->where('status', 'Issued')
            ->where('due_date', '<', Carbon::today()->toDateString())
            ->count();
        $totalFinesCollected = BookIssue::where('school_id', $schoolId)->sum('fine_amount');

        $recentIssues = BookIssue::where('school_id', $schoolId)
            ->with(['book', 'student.schoolClass'])
            ->latest()
            ->take(8)
            ->get();

        $categories = Book::where('school_id', $schoolId)
            ->select('category')
            ->distinct()
            ->pluck('category');

        return response()->json([
            'success' => true,
            'statistics' => [
                'total_books' => (int)$totalBooks,
                'available_books' => (int)$availableBooks,
                'issued_books' => $issuedBooks,
                'overdue_books' => $overdueBooks,
                'fines_collected' => (float)$totalFinesCollected,
            ],
            'recent_issues' => $recentIssues,
            'categories' => $categories,
        ]);
    }

    public function books(Request $request)
    {
        $schoolId = $request->user()->school_id;
        $category = $request->query('category');
        $q = $request->query('q');

        $query = Book::where('school_id', $schoolId);
        if ($category) $query->where('category', $category);
        if ($q) {
            $query->where(function ($b) use ($q) {
                $b->where('title', 'like', "%{$q}%")
                  ->orWhere('author', 'like', "%{$q}%")
                  ->orWhere('isbn', 'like', "%{$q}%");
            });
        }

        return response()->json([
            'success' => true,
            'books' => $query->latest()->get(),
        ]);
    }

    public function storeBook(Request $request)
    {
        $schoolId = $request->user()->school_id;
        $validated = $request->validate([
            'title' => 'required|string|max:200',
            'author' => 'required|string|max:100',
            'isbn' => 'nullable|string|max:50',
            'category' => 'required|string|max:100',
            'publisher' => 'nullable|string|max:100',
            'rack_no' => 'nullable|string|max:50',
            'total_copies' => 'required|integer|min:1',
        ]);

        $book = Book::create(array_merge($validated, [
            'school_id' => $schoolId,
            'available_copies' => $validated['total_copies'],
            'status' => 'Available',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Book added to library catalog successfully.',
            'book' => $book,
        ], 201);
    }

    public function issueBook(Request $request)
    {
        $schoolId = $request->user()->school_id;
        $validated = $request->validate([
            'book_id' => 'required|exists:books,id',
            'student_id' => 'required|exists:students,id',
            'due_date' => 'required|date|after_or_equal:today',
            'remarks' => 'nullable|string',
        ]);

        $book = Book::where('school_id', $schoolId)->findOrFail($validated['book_id']);
        if ($book->available_copies < 1) {
            return response()->json(['success' => false, 'message' => 'No copies currently available for issue.'], 422);
        }

        $issue = BookIssue::create([
            'school_id' => $schoolId,
            'book_id' => $book->id,
            'student_id' => $validated['student_id'],
            'issue_date' => Carbon::today()->toDateString(),
            'due_date' => $validated['due_date'],
            'status' => 'Issued',
            'remarks' => $validated['remarks'] ?? null,
            'issued_by' => $request->user()->id,
        ]);

        $book->decrement('available_copies');
        if ($book->available_copies == 0) {
            $book->update(['status' => 'Out of Stock']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Book successfully issued to student.',
            'issue' => $issue,
        ], 201);
    }

    public function returnBook(Request $request, $id)
    {
        $schoolId = $request->user()->school_id;
        $issue = BookIssue::where('school_id', $schoolId)->findOrFail($id);

        $fine = $request->input('fine_amount', 0.00);

        $issue->update([
            'return_date' => Carbon::today()->toDateString(),
            'status' => 'Returned',
            'fine_amount' => $fine,
        ]);

        $issue->book->increment('available_copies');
        $issue->book->update(['status' => 'Available']);

        return response()->json([
            'success' => true,
            'message' => 'Book returned successfully.',
            'issue' => $issue,
        ]);
    }
}
