<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Class TeacherProfile
 *
 * @property int $id
 * @property int $user_id
 * @property string $bio
 * @property string $whatsapp_number
 * @property string|null $zoom_link
 * @property string|null $google_meet_link
 * @property string|null $specializations_json
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class TeacherProfile extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'bio',
        'whatsapp_number',
        'zoom_link',
        'google_meet_link',
        'specializations_json',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'specializations_json' => 'array',
        ];
    }

    /**
     * Get the user that owns the teacher profile.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
