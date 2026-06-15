<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Class Booking
 *
 * @property int $id
 * @property int $student_id
 * @property int $slot_id
 * @property int $program_id
 * @property string $status
 * @property string|null $video_platform
 * @property string|null $video_url
 * @property string|null $teacher_feedback
 * @property string|null $student_notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class Booking extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'student_id',
        'slot_id',
        'program_id',
        'status',
        'video_platform',
        'video_url',
        'teacher_feedback',
        'student_notes',
    ];

    /**
     * The model's boot method.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::created(function (Booking $booking) {
            $booking->slot->update(['is_booked' => true]);
        });

        static::updated(function (Booking $booking) {
            if ($booking->isDirty('status')) {
                if ($booking->status === 'cancelled') {
                    $booking->slot->update(['is_booked' => false]);
                } else {
                    $booking->slot->update(['is_booked' => true]);
                }
            }
        });

        static::deleted(function (Booking $booking) {
            $booking->slot->update(['is_booked' => false]);
        });
    }

    /**
     * Get the student (User) who made the booking.
     *
     * @return BelongsTo<User, $this>
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the slot associated with this booking.
     *
     * @return BelongsTo<Slot, $this>
     */
    public function slot(): BelongsTo
    {
        return $this->belongsTo(Slot::class);
    }

    /**
     * Get the program associated with this booking.
     *
     * @return BelongsTo<Program, $this>
     */
    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }

    /**
     * Automatically cancel all bookings where the slot's end time is in the past
     * and the status is still confirmed or pending.
     */
    public static function cancelMissed(): int
    {
        $missedBookings = self::whereIn('status', ['confirmed', 'pending'])
            ->whereHas('slot', function ($query) {
                $query->where('end_time', '<', now());
            })
            ->get();

        $count = 0;
        foreach ($missedBookings as $booking) {
            $booking->update(['status' => 'cancelled']);
            $count++;
        }

        return $count;
    }
}
