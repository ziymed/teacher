<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Certificate;
use App\Models\Program;
use App\Models\Slot;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class TeacherDashboardController extends Controller
{
    /**
     * Show the teacher workspace.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Enforce teacher check
        if (! $user->isTeacher()) {
            abort(403, 'Unauthorized dashboard access.');
        }

        // Fetch teacher's slots
        $slots = Slot::where('teacher_id', $user->id)
            ->orderBy('start_time')
            ->get();

        // Fetch bookings for this teacher's slots
        $bookings = Booking::whereHas('slot', function ($q) use ($user) {
            $q->where('teacher_id', $user->id);
        })
            ->with(['student', 'slot', 'program'])
            ->get()
            ->sortBy(function ($booking) {
                return $booking->slot->start_time;
            })
            ->values();

        $programs = Program::all();

        return Inertia::render('teacher/dashboard', [
            'slots' => $slots,
            'bookings' => $bookings,
            'programs' => $programs,
        ]);
    }

    /**
     * Create/Open a new teaching hour slot.
     */
    public function storeSlot(Request $request): RedirectResponse
    {
        $request->validate([
            'start_time' => ['required', 'date', 'after:now'],
        ]);

        $user = $request->user();

        if (! $user->isTeacher()) {
            return back()->withErrors(['error' => 'Only teachers can configure available hours.']);
        }

        $startTime = Carbon::parse($request->start_time);
        $endTime = $startTime->copy()->addHour(); // each slot is 1 hour

        // Artificially check overlap
        $overlap = Slot::where('teacher_id', $user->id)
            ->where(function ($query) use ($startTime, $endTime) {
                $query->whereBetween('start_time', [$startTime, $endTime->copy()->subSecond()])
                    ->orWhereBetween('end_time', [$startTime->copy()->addSecond(), $endTime]);
            })
            ->exists();

        if ($overlap) {
            return back()->withErrors(['error' => 'You already have an open slot that overlaps with this time.']);
        }

        Slot::create([
            'teacher_id' => $user->id,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'is_booked' => false,
        ]);

        return back()->with('success', 'Teaching hour opened successfully!');
    }

    /**
     * Close an unbooked hour slot.
     */
    public function destroySlot(Slot $slot, Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($slot->teacher_id !== $user->id && ! $user->isAdmin()) {
            return back()->withErrors(['error' => 'Unauthorized.']);
        }

        if ($slot->is_booked) {
            return back()->withErrors(['error' => 'Cannot close a slot that has already been booked by a student. Please cancel the booking first.']);
        }

        $slot->delete();

        return back()->with('success', 'Hour slot closed successfully.');
    }

    /**
     * Complete a class session, save teacher feedback, and optionally issue a certificate.
     */
    public function completeBooking(Booking $booking, Request $request): RedirectResponse
    {
        $request->validate([
            'teacher_feedback' => ['required', 'string', 'min:10', 'max:2000'],
            'issue_certificate' => ['boolean'],
        ]);

        $user = $request->user();

        if ($booking->slot->teacher_id !== $user->id) {
            return back()->withErrors(['error' => 'You are not the assigned teacher for this session.']);
        }

        $booking->update([
            'status' => 'completed',
            'teacher_feedback' => $request->teacher_feedback,
        ]);

        // Issue certificate if requested
        if ($request->issue_certificate) {
            // Check if certificate already exists to avoid duplication
            $exists = Certificate::where('student_id', $booking->student_id)
                ->where('program_id', $booking->program_id)
                ->exists();

            if (! $exists) {
                Certificate::create([
                    'student_id' => $booking->student_id,
                    'program_id' => $booking->program_id,
                    'notes' => 'Issued by '.$user->name.' upon completing the program requirements with excellent recitation and tajweed.',
                ]);
            }
        }

        return back()->with('success', 'Class marked as completed! Feedback has been shared with the student.');
    }
}
