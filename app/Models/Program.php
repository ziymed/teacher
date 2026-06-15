<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * Class Program
 *
 * @property int $id
 * @property string $name
 * @property string $description
 * @property string|null $details_json
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class Program extends Model
{
    use HasFactory;

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'name_translation',
        'description_translation',
        'details_translation',
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'details_json',
        'is_hidden',
        'type',
        'prices_json',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'name' => 'array',
            'description' => 'array',
            'details_json' => 'array',
            'is_hidden' => 'boolean',
            'prices_json' => 'array',
        ];
    }

    /**
     * Get the translated name based on current locale.
     */
    public function getNameTranslationAttribute(): string
    {
        return $this->getTranslationValue($this->name);
    }

    /**
     * Get the translated description based on current locale.
     */
    public function getDescriptionTranslationAttribute(): string
    {
        return $this->getTranslationValue($this->description);
    }

    /**
     * Get the translated details list based on current locale.
     */
    public function getDetailsTranslationAttribute(): array
    {
        $details = $this->details_json;
        if (! is_array($details)) {
            return [];
        }

        $locale = app()->getLocale();
        if (isset($details[$locale])) {
            return $details[$locale];
        }
        if (isset($details['id'])) {
            return $details['id'];
        }
        if (isset($details['en'])) {
            return $details['en'];
        }
        // If it's a flat list, return it directly
        if (! isset($details['id']) && ! isset($details['ar']) && ! isset($details['en'])) {
            return $details;
        }

        return [];
    }

    /**
     * Helper to retrieve translated value or fallback.
     */
    protected function getTranslationValue(mixed $value): string
    {
        if (is_array($value)) {
            $locale = app()->getLocale();

            return $value[$locale] ?? $value['id'] ?? $value['en'] ?? array_values($value)[0] ?? '';
        }

        return (string) ($value ?? '');
    }

    /**
     * Get all bookings associated with the program.
     *
     * @return HasMany<Booking, $this>
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Get all certificates issued for this program.
     *
     * @return HasMany<Certificate, $this>
     */
    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class);
    }
}
