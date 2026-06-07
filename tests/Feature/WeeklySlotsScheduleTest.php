<?php

use App\Models\Slot;
use App\Models\User;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;

uses(RefreshDatabase::class);

test('weekly slots generator creates slots for upcoming week', function () {
    // Create two teachers
    $teacher1 = User::create([
        'name' => 'Ustaz Ali',
        'email' => 'ali@example.com',
        'password' => bcrypt('password'),
        'role' => 'teacher',
    ]);

    $teacher2 = User::create([
        'name' => 'Ustaz Anas',
        'email' => 'anas@example.com',
        'password' => bcrypt('password'),
        'role' => 'teacher',
    ]);

    // Freeze time to a Saturday: 2026-06-06
    Carbon::setTestNow(Carbon::parse('2026-06-06 12:00:00'));

    // Call command
    $this->artisan('slots:generate-weekly')
        ->assertExitCode(0);

    // Each teacher should get 8 slots per day for 5 days (Mon-Fri)
    // Total: 8 * 5 = 40 slots per teacher
    // Two teachers: 80 slots total
    expect(Slot::count())->toBe(80);

    // Monday (upcoming week starts on Monday 2026-06-08)
    // Let's assert database has slots for both teachers on Monday 2026-06-08
    $this->assertDatabaseHas('slots', [
        'teacher_id' => $teacher1->id,
        'start_time' => '2026-06-08 08:00:00',
        'end_time' => '2026-06-08 09:00:00',
    ]);

    $this->assertDatabaseHas('slots', [
        'teacher_id' => $teacher2->id,
        'start_time' => '2026-06-08 17:00:00',
        'end_time' => '2026-06-08 18:00:00',
    ]);

    // Assert that no slots exist on Saturday (2026-06-13) or Sunday (2026-06-14)
    $weekendSlots = Slot::whereDate('start_time', '2026-06-13')
        ->orWhereDate('start_time', '2026-06-14')
        ->count();

    expect($weekendSlots)->toBe(0);

    Carbon::setTestNow();
});

test('weekly slots generator skips existing slots to prevent overlap', function () {
    $teacher = User::create([
        'name' => 'Ustaz Ali',
        'email' => 'ali@example.com',
        'password' => bcrypt('password'),
        'role' => 'teacher',
    ]);

    // Freeze time to Saturday 2026-06-06
    Carbon::setTestNow(Carbon::parse('2026-06-06 12:00:00'));

    // Create an existing slot on upcoming Monday 2026-06-08 from 08:00 to 09:00
    Slot::create([
        'teacher_id' => $teacher->id,
        'start_time' => '2026-06-08 08:00:00',
        'end_time' => '2026-06-08 09:00:00',
        'is_booked' => false,
    ]);

    // Call command
    $this->artisan('slots:generate-weekly')
        ->assertExitCode(0);

    // Normally it generates 40 slots. Since 1 already exists and overlap is skipped,
    // the total slots for the teacher should still be 40 (1 existing + 39 newly created)
    expect(Slot::count())->toBe(40);

    Carbon::setTestNow();
});

test('weekly slots command schedule is registered', function () {
    $schedule = app()->make(Schedule::class);

    $events = collect($schedule->events())->filter(function ($event) {
        return str_contains($event->command, 'slots:generate-weekly');
    });

    expect($events->count())->toBeGreaterThan(0);
    expect($events->first()->expression)->toBe('0 0 * * 0'); // weekly on Sundays at midnight
});
