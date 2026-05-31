<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * Class Slot
 *
 * @property int $id
 * @property int $teacher_id
 * @property Carbon $start_time
 * @property Carbon $end_time
 * @property bool $is_booked
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class Slot extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'teacher_id',
        'start_time',
        'end_time',
        'is_booked',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_time' => 'datetime',
            'end_time' => 'datetime',
            'is_booked' => 'boolean',
        ];
    }

    /**
     * Get the teacher (User) that owns the slot.
     *
     * @return BelongsTo<User, $this>
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    /**
     * Get the booking associated with this slot.
     *
     * @return HasOne<Booking, $this>
     */
    public function booking(): HasOne
    {
        return $this->hasOne(Booking::class);
    }
}
