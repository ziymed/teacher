<?php

use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\Auth\SocialController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\StudentDashboardController;
use App\Http\Controllers\TeacherDashboardController;
use App\Http\Middleware\HandleAppearance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public Routes
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/certificates/verify/{hash}', [CertificateController::class, 'verify'])->name('certificates.verify');
Route::post('/locale', function (Request $request) {
    $request->validate([
        'locale' => ['required', 'string', 'in:id,ar,en'],
    ]);
    $request->session()->put('locale', $request->locale);

    return back();
})->name('locale.update');

// Social Authentication Routes
Route::get('/auth/{provider}/redirect', [SocialController::class, 'redirectToProvider'])
    ->name('auth.social.redirect');
Route::get('/auth/{provider}/callback', [SocialController::class, 'handleProviderCallback'])
    ->name('auth.social.callback');

// Authenticated Routes
Route::middleware(['auth', 'verified'])->group(function () {
    // Universal Dashboard Portal (redirects based on role)
    Route::get('/dashboard', [HomeController::class, 'dashboard'])->name('dashboard');
    Route::post('/dashboard/layout', [HomeController::class, 'updateLayout'])->name('dashboard.layout.update');

    // Student Dashboard & Booking Actions
    Route::middleware([HandleAppearance::class])->group(function () {
        Route::get('/student/dashboard', [StudentDashboardController::class, 'index'])
            ->name('student.dashboard');

        Route::post('/bookings', [BookingController::class, 'store'])
            ->name('bookings.store');
        Route::delete('/bookings/{booking}', [BookingController::class, 'destroy'])
            ->name('bookings.destroy');

        // Teacher Dashboard & Actions
        Route::get('/teacher/dashboard', [TeacherDashboardController::class, 'index'])
            ->name('teacher.dashboard');
        Route::put('/teacher/profile', [TeacherDashboardController::class, 'updateProfile'])
            ->name('teacher.profile.update');
        Route::post('/teacher/slots', [TeacherDashboardController::class, 'storeSlot'])
            ->name('teacher.slots.store');
        Route::post('/teacher/slots/batch', [TeacherDashboardController::class, 'batchStoreSlots'])
            ->name('teacher.slots.batch');
        Route::delete('/teacher/slots/{slot}', [TeacherDashboardController::class, 'destroySlot'])
            ->name('teacher.slots.destroy');
        Route::put('/teacher/slots/{slot}', [TeacherDashboardController::class, 'updateSlot'])
            ->name('teacher.slots.update');
        Route::post('/teacher/bookings/{booking}/complete', [TeacherDashboardController::class, 'completeBooking'])
            ->name('teacher.bookings.complete');
        Route::post('/teacher/bookings/{booking}/cancel', [TeacherDashboardController::class, 'cancelBooking'])
            ->name('teacher.bookings.cancel');
        Route::post('/teacher/bookings/{booking}/reschedule', [TeacherDashboardController::class, 'rescheduleBooking'])
            ->name('teacher.bookings.reschedule');

        // Admin Dashboard & Actions
        Route::get('/admin/dashboard', [AdminDashboardController::class, 'index'])
            ->name('admin.dashboard');
        Route::get('/admin/certificates', [AdminDashboardController::class, 'certificatesIndex'])
            ->name('admin.certificates.index');
        Route::post('/admin/certificates', [AdminDashboardController::class, 'issueCertificate'])
            ->name('admin.certificates.store');
        Route::put('/admin/certificates/{certificate}', [AdminDashboardController::class, 'updateCertificate'])
            ->name('admin.certificates.update');
        Route::delete('/admin/certificates/{certificate}', [AdminDashboardController::class, 'destroyCertificate'])
            ->name('admin.certificates.destroy');

        Route::get('/admin/programs', [AdminDashboardController::class, 'programsIndex'])
            ->name('admin.programs.index');
        Route::post('/admin/programs', [AdminDashboardController::class, 'storeProgram'])
            ->name('admin.programs.store');
        Route::put('/admin/programs/{program}', [AdminDashboardController::class, 'updateProgram'])
            ->name('admin.programs.update');
        Route::patch('/admin/programs/{program}/toggle-visibility', [AdminDashboardController::class, 'toggleProgramVisibility'])
            ->name('admin.programs.toggle-visibility');
        Route::delete('/admin/programs/{program}', [AdminDashboardController::class, 'destroyProgram'])
            ->name('admin.programs.destroy');

        Route::get('/admin/teachers', [AdminDashboardController::class, 'teachersIndex'])
            ->name('admin.teachers.index');
        Route::post('/admin/teachers', [AdminDashboardController::class, 'storeTeacher'])
            ->name('admin.teachers.store');
        Route::put('/admin/teachers/{teacher}', [AdminDashboardController::class, 'updateTeacher'])
            ->name('admin.teachers.update');
        Route::delete('/admin/teachers/{teacher}', [AdminDashboardController::class, 'destroyTeacher'])
            ->name('admin.teachers.destroy');

        Route::get('/admin/students', [AdminDashboardController::class, 'studentsIndex'])
            ->name('admin.students.index');
        Route::post('/admin/students', [AdminDashboardController::class, 'storeStudent'])
            ->name('admin.students.store');
        Route::put('/admin/students/{student}', [AdminDashboardController::class, 'updateStudent'])
            ->name('admin.students.update');
        Route::delete('/admin/students/{student}', [AdminDashboardController::class, 'destroyStudent'])
            ->name('admin.students.destroy');
        Route::post('/admin/students/{student}/promote', [AdminDashboardController::class, 'promoteStudent'])
            ->name('admin.students.promote');

        Route::post('/admin/slots', [AdminDashboardController::class, 'storeSlot'])
            ->name('admin.slots.store');
        Route::delete('/admin/slots/bulk', [AdminDashboardController::class, 'bulkDestroySlots'])
            ->name('admin.slots.bulk-destroy');
        Route::delete('/admin/slots/all', [AdminDashboardController::class, 'clearAllSlots'])
            ->name('admin.slots.clear-all');
    });
});

require __DIR__.'/settings.php';
