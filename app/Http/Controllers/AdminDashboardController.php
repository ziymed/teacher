<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Certificate;
use App\Models\Program;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    /**
     * Show the admin dashboard panel.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        if (! $user->isAdmin()) {
            abort(403, 'Unauthorized dashboard access.');
        }

        // 1. Analytical Summary Metrics
        $totalBookings = Booking::count();
        $completedBookings = Booking::where('status', 'completed')->count();
        $activeStudentsCount = User::where('role', 'student')->count();
        $activeTeachersCount = User::where('role', 'teacher')->count();
        $totalCertificatesCount = Certificate::count();

        // 2. Grids and Lists
        $students = User::where('role', 'student')
            ->withCount('studentBookings')
            ->get();

        $teachers = User::where('role', 'teacher')
            ->with('teacherProfile')
            ->withCount('slots')
            ->get();

        $bookings = Booking::with(['student', 'slot.teacher', 'program'])
            ->latest()
            ->take(10)
            ->get();

        $certificates = Certificate::with(['student', 'program'])
            ->latest()
            ->get();

        $programs = Program::all();

        return Inertia::render('admin/dashboard', [
            'metrics' => [
                'totalBookings' => $totalBookings,
                'completedBookings' => $completedBookings,
                'activeStudentsCount' => $activeStudentsCount,
                'activeTeachersCount' => $activeTeachersCount,
                'totalCertificatesCount' => $totalCertificatesCount,
            ],
            'students' => $students,
            'teachers' => $teachers,
            'bookings' => $bookings,
            'certificates' => $certificates,
            'programs' => $programs,
        ]);
    }

    /**
     * Issue an official certificate to a student from the admin panel.
     */
    public function issueCertificate(Request $request): RedirectResponse
    {
        $request->validate([
            'student_id' => ['required', 'exists:users,id'],
            'program_id' => ['required', 'exists:programs,id'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $user = $request->user();

        if (! $user->isAdmin()) {
            return back()->withErrors(['error' => 'Unauthorized. Only admins can issue official certificates.']);
        }

        // Prevent duplicates
        $exists = Certificate::where('student_id', $request->student_id)
            ->where('program_id', $request->program_id)
            ->exists();

        if ($exists) {
            return back()->withErrors(['error' => 'This student has already been awarded a certificate for this program.']);
        }

        Certificate::create([
            'student_id' => $request->student_id,
            'program_id' => $request->program_id,
            'notes' => $request->notes ?? 'Official Al-Quran & Arabic Certification awarded by the platform administration.',
        ]);

        return back()->with('success', 'Official learning certificate has been successfully issued!');
    }
}
