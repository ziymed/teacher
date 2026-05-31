<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Class Certificate
 *
 * @property int $id
 * @property int $student_id
 * @property int $program_id
 * @property string $verification_hash
 * @property Carbon $issued_at
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class Certificate extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'student_id',
        'program_id',
        'verification_hash',
        'issued_at',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'issued_at' => 'datetime',
        ];
    }

    /**
     * The model's boot method.
     */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Certificate $certificate) {
            $certificate->verification_hash = bin2hex(random_bytes(16));
            $certificate->issued_at = now();
        });
    }

    /**
     * Get the student (User) who owns the certificate.
     *
     * @return BelongsTo<User, $this>
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the program for which the certificate was issued.
     *
     * @return BelongsTo<Program, $this>
     */
    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class);
    }
}
