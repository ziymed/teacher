<?php

use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\StudentDashboardController;
use App\Http\Controllers\TeacherDashboardController;
use App\Http\Middleware\HandleAppearance;
use Illuminate\Support\Facades\Route;

// Public Routes
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/certificates/verify/{hash}', [CertificateController::class, 'verify'])->name('certificates.verify');

// Authenticated Routes
Route::middleware(['auth', 'verified'])->group(function () {
    // Universal Dashboard Portal (redirects based on role)
    Route::get('/dashboard', [HomeController::class, 'dashboard'])->name('dashboard');

    // Student Dashboard & Booking Actions
    Route::middleware([HandleAppearance::class])->group(function () {
        Route::get('/student/dashboard', [StudentDashboardController::class, 'index'])
            ->name('student.dashboard');

        // Subscription Billing & Pricing Plans
        Route::get('/subscription', [\App\Http\Controllers\SubscriptionController::class, 'index'])
            ->name('subscription.index');
        Route::post('/subscription/checkout', [\App\Http\Controllers\SubscriptionController::class, 'subscribe'])
            ->name('subscription.checkout');
        Route::post('/subscription/cancel', [\App\Http\Controllers\SubscriptionController::class, 'cancel'])
            ->name('subscription.cancel');

        Route::post('/bookings', [BookingController::class, 'store'])
            ->name('bookings.store');
        Route::delete('/bookings/{booking}', [BookingController::class, 'destroy'])
            ->name('bookings.destroy');

        // Teacher Dashboard & Actions
        Route::get('/teacher/dashboard', [TeacherDashboardController::class, 'index'])
            ->name('teacher.dashboard');
        Route::post('/teacher/slots', [TeacherDashboardController::class, 'storeSlot'])
            ->name('teacher.slots.store');
        Route::delete('/teacher/slots/{slot}', [TeacherDashboardController::class, 'destroySlot'])
            ->name('teacher.slots.destroy');
        Route::post('/teacher/bookings/{booking}/complete', [TeacherDashboardController::class, 'completeBooking'])
            ->name('teacher.bookings.complete');

        // Admin Dashboard & Actions
        Route::get('/admin/dashboard', [AdminDashboardController::class, 'index'])
            ->name('admin.dashboard');
        Route::post('/admin/certificates', [AdminDashboardController::class, 'issueCertificate'])
            ->name('admin.certificates.store');
    });
});

require __DIR__.'/settings.php';
