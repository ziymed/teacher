<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

#[Fillable(['name', 'email', 'password', 'role', 'avatar', 'subscription_plan', 'subscription_status', 'subscription_ends_at'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'subscription_ends_at' => 'datetime',
        ];
    }

    /**
     * Check if the user is an admin.
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if the user is a teacher.
     */
    public function isTeacher(): bool
    {
        return $this->role === 'teacher';
    }

    /**
     * Check if the user is a student.
     */
    public function isStudent(): bool
    {
        return $this->role === 'student';
    }

    /**
     * Get the teacher profile associated with the user.
     *
     * @return HasOne<TeacherProfile, $this>
     */
    public function teacherProfile(): HasOne
    {
        return $this->hasOne(TeacherProfile::class);
    }

    /**
     * Get all teaching slots associated with the user (if teacher).
     *
     * @return HasMany<Slot, $this>
     */
    public function slots(): HasMany
    {
        return $this->hasMany(Slot::class, 'teacher_id');
    }

    /**
     * Get all bookings associated with the student.
     *
     * @return HasMany<Booking, $this>
     */
    public function studentBookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'student_id');
    }

    /**
     * Get all bookings associated with the teacher.
     *
     * @return HasManyThrough<Booking, Slot, $this>
     */
    public function teacherBookings(): HasManyThrough
    {
        return $this->hasManyThrough(Booking::class, Slot::class, 'teacher_id', 'slot_id', 'id', 'id');
    }

    /**
     * Get all certificates issued for the student.
     *
     * @return HasMany<Certificate, $this>
     */
    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class, 'student_id');
    }

    /**
     * Check if the user has an active subscription.
     */
    public function hasActiveSubscription(): bool
    {
        if ($this->subscription_plan === 'free') {
            return false;
        }

        if ($this->subscription_status === 'active') {
            return true;
        }

        if ($this->subscription_ends_at && $this->subscription_ends_at->isFuture()) {
            return true;
        }

        return false;
    }

    /**
     * Get the student's booking limit based on their subscription plan.
     */
    public function getBookingLimit(): int
    {
        if ($this->subscription_plan === 'pro') {
            return 8;
        }

        if ($this->subscription_plan === 'premium') {
            return 99999;
        }

        return 1;
    }
}
