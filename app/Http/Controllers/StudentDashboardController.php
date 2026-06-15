<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Certificate;
use App\Models\Program;
use App\Models\Slot;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentDashboardController extends Controller
{
    /**
     * Render the student workspace.
     */
    public function index(Request $request): Response
    {
        Booking::cancelMissed();

        $user = $request->user();

        // Enforce student role
        if (! $user->isStudent()) {
            abort(403, 'Unauthorized dashboard access.');
        }

        // Upcoming confirmed bookings
        $upcomingBookings = Booking::where('student_id', $user->id)
            ->whereIn('status', ['confirmed', 'pending'])
            ->whereHas('slot', function ($query) {
                $query->where('start_time', '>=', now());
            })
            ->with(['slot.teacher.teacherProfile', 'program'])
            ->get()
            ->sortBy(function ($booking) {
                return $booking->slot->start_time;
            })
            ->values();

        // Previous classes & feedback log
        $pastBookings = Booking::where('student_id', $user->id)
            ->where(function ($query) {
                $query->where('status', 'completed')
                    ->orWhereHas('slot', function ($q) {
                        $q->where('start_time', '<', now());
                    });
            })
            ->with(['slot.teacher.teacherProfile', 'program'])
            ->get()
            ->sortByDesc(function ($booking) {
                return $booking->slot->start_time;
            })
            ->values();

        // Certificates earned by the student
        $certificates = Certificate::where('student_id', $user->id)
            ->with('program')
            ->orderBy('issued_at', 'desc')
            ->get();

        // Fetch available slots from today onwards so they can book from dashboard
        $availableSlots = Slot::where('is_booked', false)
            ->where('start_time', '>=', now())
            ->with('teacher.teacherProfile')
            ->orderBy('start_time')
            ->get();

        $programs = Program::where('is_hidden', false)->get();

        return Inertia::render('student/dashboard', [
            'upcomingBookings' => $upcomingBookings,
            'pastBookings' => $pastBookings,
            'certificates' => $certificates,
            'availableSlots' => $availableSlots,
            'programs' => $programs,
        ]);
    }
}
