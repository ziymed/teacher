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
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'bio_translation',
    ];

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
            'bio' => 'array',
            'specializations_json' => 'array',
        ];
    }

    /**
     * Get the translated bio based on current locale.
     */
    public function getBioTranslationAttribute(): string
    {
        $value = $this->bio;
        if (is_array($value)) {
            $locale = app()->getLocale();

            return $value[$locale] ?? $value['id'] ?? $value['en'] ?? array_values($value)[0] ?? '';
        }

        return (string) ($value ?? '');
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
