<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Certificate;
use App\Models\Program;
use App\Models\Slot;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    /**
     * Show the admin dashboard panel.
     */
    public function index(Request $request): Response
    {
        Booking::cancelMissed();

        $user = $request->user();

        if (! $user->isAdmin()) {
            abort(403, 'Unauthorized dashboard access.');
        }

        // 1. Analytical Summary Metrics
        $totalBookings = Booking::count();
        $completedBookings = Booking::where('status', 'completed')->count();
        $activeStudentsCount = User::where('role', 'student')->count();
        $activeTeachersCount = User::where('role', 'teacher')->count();
        $totalCertificatesCount = Certificate::count();

        // 2. Grids and Lists
        $students = User::where('role', 'student')
            ->withCount('studentBookings')
            ->get();

        $teachers = User::where('role', 'teacher')
            ->with('teacherProfile')
            ->withCount('slots')
            ->get();

        $bookings = Booking::with(['student', 'slot.teacher', 'program'])
            ->latest()
            ->take(10)
            ->get();

        $certificates = Certificate::with(['student', 'program'])
            ->latest()
            ->get();

        $programs = Program::all();

        return Inertia::render('admin/dashboard', [
            'metrics' => [
                'totalBookings' => $totalBookings,
                'completedBookings' => $completedBookings,
                'activeStudentsCount' => $activeStudentsCount,
                'activeTeachersCount' => $activeTeachersCount,
                'totalCertificatesCount' => $totalCertificatesCount,
            ],
            'students' => $students,
            'teachers' => $teachers,
            'bookings' => $bookings,
            'certificates' => $certificates,
            'programs' => $programs,
        ]);
    }

    /**
     * Show the admin programs management panel.
     */
    public function programsIndex(Request $request): Response
    {
        $user = $request->user();

        if (! $user->isAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        $programs = Program::all();

        return Inertia::render('admin/programs', [
            'programs' => $programs,
        ]);
    }

    /**
     * Issue an official certificate to a student from the admin panel.
     */
    public function issueCertificate(Request $request): RedirectResponse
    {
        $request->validate([
            'student_id' => ['required', 'exists:users,id'],
            'program_id' => ['required', 'exists:programs,id'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $user = $request->user();

        if (! $user->isAdmin()) {
            return back()->withErrors(['error' => 'Unauthorized. Only admins can issue official certificates.']);
        }

        // Prevent duplicates
        $exists = Certificate::where('student_id', $request->student_id)
            ->where('program_id', $request->program_id)
            ->exists();

        if ($exists) {
            return back()->withErrors(['error' => 'This student has already been awarded a certificate for this program.']);
        }

        Certificate::create([
            'student_id' => $request->student_id,
            'program_id' => $request->program_id,
            'notes' => $request->notes ?? 'Official Al-Quran & Arabic Certification awarded by the platform administration.',
        ]);

        return back()->with('success', 'Official learning certificate has been successfully issued!');
    }

    /**
     * Store a newly created program.
     */
    public function storeProgram(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (! $user->isAdmin()) {
            return back()->withErrors(['error' => 'Unauthorized. Only admins can manage programs.']);
        }

        $request->validate([
            'name' => ['required', 'array'],
            'name.id' => ['required', 'string', 'max:255'],
            'name.ar' => ['required', 'string', 'max:255'],
            'name.en' => ['required', 'string', 'max:255'],
            'description' => ['required', 'array'],
            'description.id' => ['required', 'string'],
            'description.ar' => ['required', 'string'],
            'description.en' => ['required', 'string'],
            'details_json' => ['required', 'array'],
            'details_json.id' => ['nullable', 'string'],
            'details_json.ar' => ['nullable', 'string'],
            'details_json.en' => ['nullable', 'string'],
            'type' => ['required', 'string', 'in:private,group,both'],
            'prices_json' => ['required', 'array'],
            'prices_json.private.id.monthly' => ['required', 'numeric', 'min:0'],
            'prices_json.private.id.program' => ['required', 'numeric', 'min:0'],
            'prices_json.private.my.monthly' => ['required', 'numeric', 'min:0'],
            'prices_json.private.my.program' => ['required', 'numeric', 'min:0'],
            'prices_json.private.sg.monthly' => ['required', 'numeric', 'min:0'],
            'prices_json.private.sg.program' => ['required', 'numeric', 'min:0'],
            'prices_json.group.id.monthly' => ['required', 'numeric', 'min:0'],
            'prices_json.group.id.program' => ['required', 'numeric', 'min:0'],
            'prices_json.group.my.monthly' => ['required', 'numeric', 'min:0'],
            'prices_json.group.my.program' => ['required', 'numeric', 'min:0'],
            'prices_json.group.sg.monthly' => ['required', 'numeric', 'min:0'],
            'prices_json.group.sg.program' => ['required', 'numeric', 'min:0'],
        ]);

        $details = [];
        foreach (['id', 'ar', 'en'] as $lang) {
            $val = $request->input("details_json.{$lang}");
            $details[$lang] = ! empty($val)
                ? array_filter(array_map('trim', explode(',', $val)))
                : [];
        }

        Program::create([
            'name' => $request->name,
            'description' => $request->description,
            'details_json' => $details,
            'type' => $request->type,
            'prices_json' => $request->prices_json,
            'is_hidden' => false,
        ]);

        return back()->with('success', 'Quranic Program successfully added!');
    }

    /**
     * Update program details.
     */
    public function updateProgram(Request $request, Program $program): RedirectResponse
    {
        $user = $request->user();

        if (! $user->isAdmin()) {
            return back()->withErrors(['error' => 'Unauthorized. Only admins can manage programs.']);
        }

        $request->validate([
            'name' => ['required', 'array'],
            'name.id' => ['required', 'string', 'max:255'],
            'name.ar' => ['required', 'string', 'max:255'],
            'name.en' => ['required', 'string', 'max:255'],
            'description' => ['required', 'array'],
            'description.id' => ['required', 'string'],
            'description.ar' => ['required', 'string'],
            'description.en' => ['required', 'string'],
            'details_json' => ['required', 'array'],
            'details_json.id' => ['nullable', 'string'],
            'details_json.ar' => ['nullable', 'string'],
            'details_json.en' => ['nullable', 'string'],
            'type' => ['required', 'string', 'in:private,group,both'],
            'prices_json' => ['required', 'array'],
            'prices_json.private.id.monthly' => ['required', 'numeric', 'min:0'],
            'prices_json.private.id.program' => ['required', 'numeric', 'min:0'],
            'prices_json.private.my.monthly' => ['required', 'numeric', 'min:0'],
            'prices_json.private.my.program' => ['required', 'numeric', 'min:0'],
            'prices_json.private.sg.monthly' => ['required', 'numeric', 'min:0'],
            'prices_json.private.sg.program' => ['required', 'numeric', 'min:0'],
            'prices_json.group.id.monthly' => ['required', 'numeric', 'min:0'],
            'prices_json.group.id.program' => ['required', 'numeric', 'min:0'],
            'prices_json.group.my.monthly' => ['required', 'numeric', 'min:0'],
            'prices_json.group.my.program' => ['required', 'numeric', 'min:0'],
            'prices_json.group.sg.monthly' => ['required', 'numeric', 'min:0'],
            'prices_json.group.sg.program' => ['required', 'numeric', 'min:0'],
        ]);

        $details = [];
        foreach (['id', 'ar', 'en'] as $lang) {
            $val = $request->input("details_json.{$lang}");
            $details[$lang] = ! empty($val)
                ? array_filter(array_map('trim', explode(',', $val)))
                : [];
        }

        $program->update([
            'name' => $request->name,
            'description' => $request->description,
            'details_json' => $details,
            'type' => $request->type,
            'prices_json' => $request->prices_json,
        ]);

        return back()->with('success', 'Quranic Program successfully updated!');
    }

    /**
     * Toggle program visibility.
     */
    public function toggleProgramVisibility(Request $request, Program $program): RedirectResponse
    {
        $user = $request->user();

        if (! $user->isAdmin()) {
            return back()->withErrors(['error' => 'Unauthorized. Only admins can manage programs.']);
        }

        $program->update([
            'is_hidden' => ! $program->is_hidden,
        ]);

        $statusMessage = $program->is_hidden ? 'hidden' : 'made visible';

        return back()->with('success', "Quranic Program successfully {$statusMessage}!");
    }

    /**
     * Remove the specified program.
     */
    public function destroyProgram(Request $request, Program $program): RedirectResponse
    {
        $user = $request->user();

        if (! $user->isAdmin()) {
            return back()->withErrors(['error' => 'Unauthorized. Only admins can manage programs.']);
        }

        if ($program->bookings()->exists() || $program->certificates()->exists()) {
            return back()->withErrors(['error' => 'Cannot delete program associated with existing student bookings or certificates. You may hide it instead.']);
        }

        $program->delete();

        return back()->with('success', 'Quranic Program successfully deleted!');
    }

    /**
     * Show the admin teachers management panel.
     */
    public function teachersIndex(Request $request): Response
    {
        $user = $request->user();

        if (! $user->isAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        $teachers = User::where('role', 'teacher')
            ->with('teacherProfile')
            ->withCount('slots')
            ->get();

        $slots = Slot::with('teacher')
            ->orderBy('start_time', 'desc')
            ->get();

        return Inertia::render('admin/teachers', [
            'teachers' => $teachers,
            'slots' => $slots,
        ]);
    }

    /**
     * Store a newly created teacher.
     */
    public function storeTeacher(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (! $user->isAdmin()) {
            return back()->withErrors(['error' => 'Unauthorized. Only admins can manage teachers.']);
        }

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'bio' => ['required', 'array'],
            'bio.id' => ['required', 'string'],
            'bio.ar' => ['required', 'string'],
            'bio.en' => ['required', 'string'],
            'whatsapp_number' => ['required', 'string', 'max:255'],
            'zoom_link' => ['nullable', 'url', 'max:255'],
            'google_meet_link' => ['nullable', 'url', 'max:255'],
            'specializations_json' => ['nullable', 'string'],
        ]);

        $specializations = [];
        if ($request->filled('specializations_json')) {
            $specializations = array_filter(array_map('trim', explode(',', $request->specializations_json)));
        }

        $teacher = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'role' => 'teacher',
            'email_verified_at' => now(),
            'avatar' => 'https://ui-avatars.com/api/?name='.urlencode($request->name).'&background=4A3E3D&color=FDFBF7&size=200',
        ]);

        $teacher->teacherProfile()->create([
            'bio' => $request->bio,
            'whatsapp_number' => $request->whatsapp_number,
            'zoom_link' => $request->zoom_link,
            'google_meet_link' => $request->google_meet_link,
            'specializations_json' => $specializations,
        ]);

        return back()->with('success', 'Teacher successfully added!');
    }

    /**
     * Update teacher details.
     */
    public function updateTeacher(Request $request, User $teacher): RedirectResponse
    {
        $user = $request->user();

        if (! $user->isAdmin()) {
            return back()->withErrors(['error' => 'Unauthorized. Only admins can manage teachers.']);
        }

        if ($teacher->role !== 'teacher') {
            return back()->withErrors(['error' => 'Invalid user. Selected account is not a teacher.']);
        }

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,'.$teacher->id],
            'password' => ['nullable', 'string', 'min:8'],
            'bio' => ['required', 'array'],
            'bio.id' => ['required', 'string'],
            'bio.ar' => ['required', 'string'],
            'bio.en' => ['required', 'string'],
            'whatsapp_number' => ['required', 'string', 'max:255'],
            'zoom_link' => ['nullable', 'url', 'max:255'],
            'google_meet_link' => ['nullable', 'url', 'max:255'],
            'specializations_json' => ['nullable', 'string'],
        ]);

        $teacherData = [
            'name' => $request->name,
            'email' => $request->email,
        ];

        if ($request->filled('password')) {
            $teacherData['password'] = bcrypt($request->password);
        }

        $teacher->update($teacherData);

        $specializations = [];
        if ($request->filled('specializations_json')) {
            $specializations = array_filter(array_map('trim', explode(',', $request->specializations_json)));
        }

        $teacher->teacherProfile()->updateOrCreate(
            ['user_id' => $teacher->id],
            [
                'bio' => $request->bio,
                'whatsapp_number' => $request->whatsapp_number,
                'zoom_link' => $request->zoom_link,
                'google_meet_link' => $request->google_meet_link,
                'specializations_json' => $specializations,
            ]
        );

        return back()->with('success', 'Teacher successfully updated!');
    }

    /**
     * Remove the specified teacher.
     */
    public function destroyTeacher(Request $request, User $teacher): RedirectResponse
    {
        $user = $request->user();

        if (! $user->isAdmin()) {
            return back()->withErrors(['error' => 'Unauthorized. Only admins can manage teachers.']);
        }

        if ($teacher->role !== 'teacher') {
            return back()->withErrors(['error' => 'Invalid user. Selected account is not a teacher.']);
        }

        // Check if teacher has slots that are booked (has associated bookings)
        $hasBookedSlots = $teacher->slots()->where('is_booked', true)->exists();

        if ($hasBookedSlots) {
            return back()->withErrors(['error' => 'Cannot delete teacher with scheduled classes booked by students.']);
        }

        // Delete unbooked slots, profile, and user
        $teacher->slots()->delete();
        $teacher->teacherProfile()->delete();
        $teacher->delete();

        return back()->with('success', 'Teacher successfully deleted!');
    }

    /**
     * Store a newly created slot for a specific teacher.
     */
    public function storeSlot(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (! $user->isAdmin()) {
            abort(403, 'Unauthorized.');
        }

        $request->validate([
            'teacher_id' => ['required', 'exists:users,id'],
            'start_time' => ['required', 'date', 'after:now'],
            'duration' => ['nullable', 'integer', 'in:30,45,60,90,120'],
        ]);

        $teacher = User::findOrFail($request->teacher_id);
        if (! $teacher->isTeacher()) {
            return back()->withErrors(['error' => 'Selected user is not a teacher.']);
        }

        $duration = (int) $request->input('duration', 60);
        $startTime = Carbon::parse($request->start_time);
        $endTime = $startTime->copy()->addMinutes($duration);

        // Check for overlap robustly (Case 1: existing start inside new, Case 2: existing end inside new, Case 3: new completely inside existing)
        $overlap = Slot::where('teacher_id', $teacher->id)
            ->where(function ($query) use ($startTime, $endTime) {
                $query->where(function ($q) use ($startTime, $endTime) {
                    $q->where('start_time', '>=', $startTime)
                        ->where('start_time', '<', $endTime);
                })
                    ->orWhere(function ($q) use ($startTime, $endTime) {
                        $q->where('end_time', '>', $startTime)
                            ->where('end_time', '<=', $endTime);
                    })
                    ->orWhere(function ($q) use ($startTime, $endTime) {
                        $q->where('start_time', '<=', $startTime)
                            ->where('end_time', '>=', $endTime);
                    });
            })
            ->exists();

        if ($overlap) {
            return back()->withErrors(['error' => 'This teacher already has an open slot that overlaps with this time.']);
        }

        Slot::create([
            'teacher_id' => $teacher->id,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'is_booked' => false,
        ]);

        return back()->with('success', "Alhamdulillah! Teaching hour successfully opened for {$teacher->name}.");
    }

    /**
     * Bulk destroy selected unbooked slots.
     */
    public function bulkDestroySlots(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (! $user->isAdmin()) {
            abort(403, 'Unauthorized dashboard access.');
        }

        $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['required', 'integer', 'exists:slots,id'],
        ]);

        $deletedCount = Slot::whereIn('id', $request->ids)
            ->where('is_booked', false)
            ->delete();

        return back()->with('success', "Alhamdulillah! {$deletedCount} unbooked teaching slots successfully deleted.");
    }

    /**
     * Clear all unbooked slots.
     */
    public function clearAllSlots(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (! $user->isAdmin()) {
            abort(403, 'Unauthorized dashboard access.');
        }

        $deletedCount = Slot::where('is_booked', false)->delete();

        return back()->with('success', "Alhamdulillah! All {$deletedCount} unbooked teaching slots successfully cleared.");
    }

    /**
     * Show the admin students management panel.
     */
    public function studentsIndex(Request $request): Response
    {
        $user = $request->user();

        if (! $user->isAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        $students = User::where('role', 'student')
            ->withCount('studentBookings')
            ->get();

        return Inertia::render('admin/students', [
            'students' => $students,
        ]);
    }

    /**
     * Store a newly created student.
     */
    public function storeStudent(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (! $user->isAdmin()) {
            return back()->withErrors(['error' => 'Unauthorized. Only admins can manage students.']);
        }

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'role' => 'student',
            'email_verified_at' => now(),
            'avatar' => 'https://ui-avatars.com/api/?name='.urlencode($request->name).'&background=4A3E3D&color=FDFBF7&size=200',
        ]);

        return back()->with('success', 'Student successfully added!');
    }

    /**
     * Update student details.
     */
    public function updateStudent(Request $request, User $student): RedirectResponse
    {
        $user = $request->user();

        if (! $user->isAdmin()) {
            return back()->withErrors(['error' => 'Unauthorized. Only admins can manage students.']);
        }

        if ($student->role !== 'student') {
            return back()->withErrors(['error' => 'Invalid user. Selected account is not a student.']);
        }

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,'.$student->id],
            'password' => ['nullable', 'string', 'min:8'],
        ]);

        $studentData = [
            'name' => $request->name,
            'email' => $request->email,
        ];

        if ($request->filled('password')) {
            $studentData['password'] = bcrypt($request->password);
        }

        $student->update($studentData);

        return back()->with('success', 'Student successfully updated!');
    }

    /**
     * Remove the specified student.
     */
    public function destroyStudent(Request $request, User $student): RedirectResponse
    {
        $user = $request->user();

        if (! $user->isAdmin()) {
            return back()->withErrors(['error' => 'Unauthorized. Only admins can manage students.']);
        }

        if ($student->role !== 'student') {
            return back()->withErrors(['error' => 'Invalid user. Selected account is not a student.']);
        }

        // Check if student has active or confirmed bookings
        $hasActiveBookings = $student->studentBookings()->whereIn('status', ['pending', 'confirmed'])->exists();

        if ($hasActiveBookings) {
            return back()->withErrors(['error' => 'Cannot delete student with active or confirmed bookings.']);
        }

        $student->delete();

        return back()->with('success', 'Student successfully deleted!');
    }

    /**
     * Promote a student to a teacher.
     */
    public function promoteStudent(Request $request, User $student): RedirectResponse
    {
        $user = $request->user();

        if (! $user->isAdmin()) {
            abort(403, 'Unauthorized. Only admins can promote students.');
        }

        if ($student->role !== 'student') {
            return back()->withErrors(['error' => 'Invalid user. Selected account is not a student.']);
        }

        // Safety check: Cannot promote if active bookings exist
        $hasActiveBookings = $student->studentBookings()->whereIn('status', ['pending', 'confirmed'])->exists();
        if ($hasActiveBookings) {
            return back()->withErrors(['error' => 'Cannot promote student with active or confirmed bookings. Please cancel or complete bookings first.']);
        }

        $request->validate([
            'bio' => ['required', 'array'],
            'bio.id' => ['required', 'string'],
            'bio.ar' => ['required', 'string'],
            'bio.en' => ['required', 'string'],
            'whatsapp_number' => ['required', 'string', 'max:255'],
            'zoom_link' => ['nullable', 'url', 'max:255'],
            'google_meet_link' => ['nullable', 'url', 'max:255'],
            'specializations_json' => ['nullable', 'string'],
        ]);

        $specializations = [];
        if ($request->filled('specializations_json')) {
            $specializations = array_filter(array_map('trim', explode(',', $request->specializations_json)));
        }

        // Change role to teacher
        $student->update([
            'role' => 'teacher',
        ]);

        // Create the teacher profile
        $student->teacherProfile()->create([
            'bio' => $request->bio,
            'whatsapp_number' => $request->whatsapp_number,
            'zoom_link' => $request->zoom_link,
            'google_meet_link' => $request->google_meet_link,
            'specializations_json' => $specializations,
        ]);

        return back()->with('success', 'Student successfully promoted to Teacher!');
    }

    /**
     * Show the admin certificates management panel.
     */
    public function certificatesIndex(Request $request): Response
    {
        $user = $request->user();

        if (! $user->isAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        $certificates = Certificate::with(['student', 'program'])
            ->latest()
            ->get();

        $students = User::where('role', 'student')
            ->orderBy('name')
            ->get();

        $programs = Program::where('is_hidden', false)
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/certificates', [
            'certificates' => $certificates,
            'students' => $students,
            'programs' => $programs,
        ]);
    }

    /**
     * Update an existing certificate's notes.
     */
    public function updateCertificate(Request $request, Certificate $certificate): RedirectResponse
    {
        $user = $request->user();

        if (! $user->isAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        $request->validate([
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $certificate->update([
            'notes' => $request->notes,
        ]);

        return back()->with('success', 'Certificate notes successfully updated!');
    }

    /**
     * Delete/revoke an issued certificate.
     */
    public function destroyCertificate(Request $request, Certificate $certificate): RedirectResponse
    {
        $user = $request->user();

        if (! $user->isAdmin()) {
            abort(403, 'Unauthorized access.');
        }

        $certificate->delete();

        return back()->with('success', 'Certificate successfully revoked!');
    }
}
