<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Certificate;
use App\Models\Program;
use App\Models\Slot;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TeacherDashboardController extends Controller
{
    /**
     * Show the teacher workspace.
     */
    public function index(Request $request): Response
    {
        Booking::cancelMissed();

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

        $programs = Program::where('is_hidden', false)->get();

        $user->load('teacherProfile');

        return Inertia::render('teacher/dashboard', [
            'slots' => $slots,
            'bookings' => $bookings,
            'programs' => $programs,
            'teacherProfile' => $user->teacherProfile,
        ]);
    }

    /**
     * Create/Open a new teaching hour slot.
     */
    public function storeSlot(Request $request): RedirectResponse
    {
        $request->validate([
            'start_time' => ['required', 'date', 'after:now'],
            'duration' => ['nullable', 'integer', 'in:30,45,60,90,120'],
        ]);

        $user = $request->user();

        if (! $user->isTeacher()) {
            return back()->withErrors(['error' => 'Only teachers can configure available hours.']);
        }

        $duration = (int) $request->input('duration', 60);
        $startTime = Carbon::parse($request->start_time);
        $endTime = $startTime->copy()->addMinutes($duration);

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
     * Create weekend slots (Saturdays and Sundays) from 8:00 AM to 6:00 PM for a date range.
     */
    public function batchStoreSlots(Request $request): RedirectResponse
    {
        $request->validate([
            'start_date' => ['required', 'date', 'after_or_equal:today'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'duration' => ['nullable', 'integer', 'in:30,45,60,90,120'],
        ]);

        $user = $request->user();

        if (! $user->isTeacher()) {
            return back()->withErrors(['error' => 'Only teachers can configure available hours.']);
        }

        $duration = (int) $request->input('duration', 60);
        $current = Carbon::parse($request->start_date)->startOfDay();
        $end = Carbon::parse($request->end_date)->endOfDay();
        $createdCount = 0;

        while ($current->lessThanOrEqualTo($end)) {
            if ($current->isSaturday() || $current->isSunday()) {
                $slotStart = $current->copy()->setTime(8, 0, 0);
                $dayEnd = $current->copy()->setTime(18, 0, 0);

                while ($slotStart->copy()->addMinutes($duration)->lessThanOrEqualTo($dayEnd)) {
                    $slotEnd = $slotStart->copy()->addMinutes($duration);

                    if ($slotStart->isAfter(Carbon::now())) {
                        // Check for overlap
                        $overlap = Slot::where('teacher_id', $user->id)
                            ->where(function ($query) use ($slotStart, $slotEnd) {
                                $query->whereBetween('start_time', [$slotStart, $slotEnd->copy()->subSecond()])
                                    ->orWhereBetween('end_time', [$slotStart->copy()->addSecond(), $slotEnd]);
                            })
                            ->exists();

                        if (! $overlap) {
                            Slot::create([
                                'teacher_id' => $user->id,
                                'start_time' => $slotStart,
                                'end_time' => $slotEnd,
                                'is_booked' => false,
                            ]);
                            $createdCount++;
                        }
                    }

                    $slotStart = $slotEnd;
                }
            }
            $current->addDay();
        }

        return back()->with('success', "Alhamdulillah! Generated {$createdCount} weekend slots successfully.");
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
     * Update an unbooked teaching hour slot.
     */
    public function updateSlot(Slot $slot, Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($slot->teacher_id !== $user->id && ! $user->isAdmin()) {
            return back()->withErrors(['error' => 'Unauthorized.']);
        }

        if ($slot->is_booked) {
            return back()->withErrors(['error' => 'Cannot edit a slot that has already been booked by a student.']);
        }

        $request->validate([
            'start_time' => ['required', 'date', 'after:now'],
            'duration' => ['nullable', 'integer', 'in:30,45,60,90,120'],
        ]);

        $duration = (int) $request->input('duration', 60);
        $startTime = Carbon::parse($request->start_time);
        $endTime = $startTime->copy()->addMinutes($duration);

        // Check for overlap excluding this slot
        $overlap = Slot::where('teacher_id', $slot->teacher_id)
            ->where('id', '!=', $slot->id)
            ->where(function ($query) use ($startTime, $endTime) {
                $query->whereBetween('start_time', [$startTime, $endTime->copy()->subSecond()])
                    ->orWhereBetween('end_time', [$startTime->copy()->addSecond(), $endTime]);
            })
            ->exists();

        if ($overlap) {
            return back()->withErrors(['error' => 'This time overlaps with another open slot for the teacher.']);
        }

        $slot->update([
            'start_time' => $startTime,
            'end_time' => $endTime,
        ]);

        return back()->with('success', 'Teaching hour updated successfully.');
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

    /**
     * Update the teacher's profile details and meeting rooms.
     */
    public function updateProfile(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (! $user->isTeacher()) {
            abort(403, 'Unauthorized profile access.');
        }

        $request->validate([
            'bio' => ['required', 'array'],
            'bio.id' => ['required', 'string', 'min:10', 'max:5000'],
            'bio.ar' => ['required', 'string', 'min:10', 'max:5000'],
            'bio.en' => ['required', 'string', 'min:10', 'max:5000'],
            'whatsapp_number' => ['required', 'string', 'max:255'],
            'zoom_link' => ['nullable', 'url', 'max:255'],
            'google_meet_link' => ['nullable', 'url', 'max:255'],
            'specializations_json' => ['nullable', 'string'],
        ]);

        $specializations = [];
        if ($request->filled('specializations_json')) {
            $specializations = array_filter(array_map('trim', explode(',', $request->specializations_json)));
        }

        $user->teacherProfile()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'bio' => $request->bio,
                'whatsapp_number' => $request->whatsapp_number,
                'zoom_link' => $request->zoom_link,
                'google_meet_link' => $request->google_meet_link,
                'specializations_json' => $specializations,
            ]
        );

        return back()->with('success', 'Profile and meeting rooms updated successfully!');
    }

    /**
     * Cancel a booked slot.
     */
    public function cancelBooking(Booking $booking, Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($booking->slot->teacher_id !== $user->id) {
            return back()->withErrors(['error' => 'You are not the assigned teacher for this session.']);
        }

        if ($booking->status === 'cancelled') {
            return back()->withErrors(['error' => 'This session is already cancelled.']);
        }

        $booking->update([
            'status' => 'cancelled',
        ]);

        return back()->with('success', 'Class session cancelled successfully.');
    }

    /**
     * Reschedule a booking to another available slot.
     */
    public function rescheduleBooking(Booking $booking, Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($booking->slot->teacher_id !== $user->id) {
            return back()->withErrors(['error' => 'You are not the assigned teacher for this session.']);
        }

        if ($booking->status === 'cancelled') {
            return back()->withErrors(['error' => 'Cannot reschedule a cancelled session.']);
        }

        $request->validate([
            'slot_id' => ['required', 'integer', 'exists:slots,id'],
        ]);

        $newSlotId = (int) $request->slot_id;
        $newSlot = Slot::findOrFail($newSlotId);

        if ($newSlot->teacher_id !== $user->id) {
            return back()->withErrors(['error' => 'The requested slot does not belong to you.']);
        }

        if ($newSlot->is_booked) {
            return back()->withErrors(['error' => 'The requested slot is already booked.']);
        }

        if ($newSlot->start_time->isPast()) {
            return back()->withErrors(['error' => 'Cannot reschedule to a slot in the past.']);
        }

        DB::transaction(function () use ($booking, $newSlot) {
            $oldSlot = $booking->slot;

            $oldSlot->update(['is_booked' => false]);
            $newSlot->update(['is_booked' => true]);

            $booking->update([
                'slot_id' => $newSlot->id,
            ]);
        });

        return back()->with('success', 'Class session rescheduled successfully.');
    }
}
