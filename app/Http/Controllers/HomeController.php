<?php

namespace App\Http\Controllers;

use App\Models\Program;
use App\Models\Slot;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * Show the main public landing page.
     */
    public function index(Request $request): Response
    {
        $programs = Program::all();

        $teachers = User::where('role', 'teacher')
            ->with('teacherProfile')
            ->get();

        // Fetch available slots from today onwards
        $availableSlots = Slot::where('is_booked', false)
            ->where('start_time', '>=', now())
            ->with('teacher')
            ->orderBy('start_time')
            ->get();

        return Inertia::render('welcome', [
            'programs' => $programs,
            'teachers' => $teachers,
            'availableSlots' => $availableSlots,
        ]);
    }

    /**
     * Redirect authenticated users to their correct dashboard portal based on role.
     */
    public function dashboard(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        if ($user->isTeacher()) {
            return redirect()->route('teacher.dashboard');
        }

        return redirect()->route('student.dashboard');
    }
}
