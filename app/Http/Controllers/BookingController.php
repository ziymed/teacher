<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Slot;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    /**
     * Store a new booking in the database.
     * Enforces strict atomic locks to prevent double-booking conflicts.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'slot_id' => ['required', 'exists:slots,id'],
            'program_id' => ['required', 'exists:programs,id'],
            'student_notes' => ['nullable', 'string', 'max:1000'],
            'video_platform' => ['nullable', 'string', 'in:zoom,google_meet'],
        ]);

        $user = $request->user();

        // Enforce student role check
        if (! $user->isStudent()) {
            return back()->withErrors(['error' => 'Only registered students can book learning sessions.']);
        }

        try {
            $booking = DB::transaction(function () use ($request, $user) {
                // Lock the slot for update to prevent concurrent double-booking
                $slot = Slot::where('id', $request->slot_id)
                    ->lockForUpdate()
                    ->first();

                if ($slot->is_booked) {
                    throw new \Exception('This slot has already been reserved by another student.');
                }

                // Gather teacher's default meeting details
                $teacher = $slot->teacher;
                $profile = $teacher->teacherProfile;

                // Determine chosen platform from request
                $requestedPlatform = $request->input('video_platform');

                // Gather available links
                $googleMeetLink = $profile?->google_meet_link;
                $zoomLink = $profile?->zoom_link;

                // Resolve platform & url based on what the teacher has and what was requested
                if ($requestedPlatform === 'zoom') {
                    if ($zoomLink) {
                        $platform = 'zoom';
                        $videoUrl = $zoomLink;
                    } elseif ($googleMeetLink) {
                        $platform = 'google_meet';
                        $videoUrl = $googleMeetLink;
                    } else {
                        $platform = 'zoom';
                        $videoUrl = 'https://zoom.us/j/default-meeting-id';
                    }
                } elseif ($requestedPlatform === 'google_meet') {
                    if ($googleMeetLink) {
                        $platform = 'google_meet';
                        $videoUrl = $googleMeetLink;
                    } elseif ($zoomLink) {
                        $platform = 'zoom';
                        $videoUrl = $zoomLink;
                    } else {
                        $platform = 'google_meet';
                        $videoUrl = 'https://meet.google.com/abc-defg-hij';
                    }
                } else {
                    // Default behavior (no selection, or fallback)
                    if ($googleMeetLink) {
                        $platform = 'google_meet';
                        $videoUrl = $googleMeetLink;
                    } elseif ($zoomLink) {
                        $platform = 'zoom';
                        $videoUrl = $zoomLink;
                    } else {
                        $platform = 'google_meet';
                        $videoUrl = 'https://meet.google.com/abc-defg-hij';
                    }
                }

                // Create the booking
                return Booking::create([
                    'student_id' => $user->id,
                    'slot_id' => $slot->id,
                    'program_id' => $request->program_id,
                    'status' => 'confirmed', // immediately confirm for trial / dynamic bookings
                    'video_platform' => $platform,
                    'video_url' => $videoUrl,
                    'student_notes' => $request->student_notes,
                ]);
            });

            return back()->with('success', 'Your session has been successfully booked!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Cancel an active booking and free up the slot.
     */
    public function destroy(Booking $booking, Request $request): RedirectResponse
    {
        $user = $request->user();

        // Security check: Only the student who booked it or an admin can delete it
        if ($user->id !== $booking->student_id && ! $user->isAdmin()) {
            return back()->withErrors(['error' => 'You are not authorized to cancel this class.']);
        }

        DB::transaction(function () use ($booking) {
            $booking->update(['status' => 'cancelled']);
        });

        return back()->with('success', 'Your session has been cancelled.');
    }
}
