<?php

use App\Models\Booking;
use App\Models\Program;
use App\Models\Slot;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;

uses(RefreshDatabase::class);

test('non-admin cannot access teachers management', function () {
    $student = User::create([
        'name' => 'Student User',
        'email' => 'student-test@example.com',
        'password' => bcrypt('password'),
        'role' => 'student',
    ]);

    $response = $this->actingAs($student)->get(route('admin.teachers.index'));
    $response->assertStatus(403);
});

test('admin can access the teachers index page', function () {
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin-test@example.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
    ]);

    $teacher = User::create([
        'name' => 'Ustaz Ali',
        'email' => 'ali@example.com',
        'password' => bcrypt('password'),
        'role' => 'teacher',
    ]);

    $response = $this->actingAs($admin)->get(route('admin.teachers.index'));
    $response->assertOk();
    $response->assertSee('Ustaz Ali');
});

test('admin can create a teacher and profile is initialized', function () {
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin-test@example.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
    ]);

    $response = $this->actingAs($admin)
        ->post(route('admin.teachers.store'), [
            'name' => 'Ustaz Anas',
            'email' => 'anas-new@example.com',
            'password' => 'password123',
            'bio' => 'An expert tajweed teacher from Morocco.',
            'whatsapp_number' => '+212612345678',
            'zoom_link' => 'https://zoom.us/j/anas-class',
            'google_meet_link' => 'https://meet.google.com/anas-meet',
            'specializations_json' => 'Tajweed, Makhraj',
        ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('users', [
        'name' => 'Ustaz Anas',
        'email' => 'anas-new@example.com',
        'role' => 'teacher',
    ]);

    $teacher = User::where('email', 'anas-new@example.com')->first();
    expect($teacher->teacherProfile)->not->toBeNull();
    expect($teacher->teacherProfile->bio)->toBe('An expert tajweed teacher from Morocco.');
    expect($teacher->teacherProfile->specializations_json)->toBe(['Tajweed', 'Makhraj']);
});

test('admin can update a teacher profile', function () {
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin-test@example.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
    ]);

    $teacher = User::create([
        'name' => 'Ustaz Anas',
        'email' => 'anas-edit@example.com',
        'password' => bcrypt('password'),
        'role' => 'teacher',
    ]);

    $profile = TeacherProfile::create([
        'user_id' => $teacher->id,
        'bio' => 'Old bio',
        'whatsapp_number' => '+212612345678',
        'zoom_link' => 'https://zoom.us/old',
        'specializations_json' => ['Tajweed'],
    ]);

    $response = $this->actingAs($admin)
        ->put(route('admin.teachers.update', $teacher), [
            'name' => 'Ustaz Anas Updated',
            'email' => 'anas-edit@example.com', // same email
            'bio' => 'Brand new biography',
            'whatsapp_number' => '+212699999999',
            'zoom_link' => 'https://zoom.us/new',
            'google_meet_link' => 'https://meet.google.com/new',
            'specializations_json' => 'Tajweed, Talqin',
        ]);

    $response->assertRedirect();

    $teacher->refresh();
    expect($teacher->name)->toBe('Ustaz Anas Updated');
    expect($teacher->teacherProfile->bio)->toBe('Brand new biography');
    expect($teacher->teacherProfile->whatsapp_number)->toBe('+212699999999');
    expect($teacher->teacherProfile->zoom_link)->toBe('https://zoom.us/new');
    expect($teacher->teacherProfile->google_meet_link)->toBe('https://meet.google.com/new');
    expect($teacher->teacherProfile->specializations_json)->toBe(['Tajweed', 'Talqin']);
});

test('admin can delete a teacher if no student bookings exist', function () {
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin-test@example.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
    ]);

    $teacher = User::create([
        'name' => 'Ustaz Anas',
        'email' => 'anas-delete@example.com',
        'password' => bcrypt('password'),
        'role' => 'teacher',
    ]);

    $profile = TeacherProfile::create([
        'user_id' => $teacher->id,
        'bio' => 'Biography content',
        'whatsapp_number' => '+212612345678',
    ]);

    $response = $this->actingAs($admin)
        ->delete(route('admin.teachers.destroy', $teacher));

    $response->assertRedirect();
    $this->assertDatabaseMissing('users', ['id' => $teacher->id]);
    $this->assertDatabaseMissing('teacher_profiles', ['id' => $profile->id]);
});

test('admin cannot delete a teacher if they have active student bookings', function () {
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin-test@example.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
    ]);

    $teacher = User::create([
        'name' => 'Ustaz Anas',
        'email' => 'anas-delete-fail@example.com',
        'password' => bcrypt('password'),
        'role' => 'teacher',
    ]);

    $profile = TeacherProfile::create([
        'user_id' => $teacher->id,
        'bio' => 'Biography content',
        'whatsapp_number' => '+212612345678',
    ]);

    $student = User::create([
        'name' => 'Ahmad Student',
        'email' => 'ahmad@example.com',
        'password' => bcrypt('password'),
        'role' => 'student',
    ]);

    $slot = Slot::create([
        'teacher_id' => $teacher->id,
        'start_time' => now()->addDay(),
        'end_time' => now()->addDay()->addHour(),
        'is_booked' => true,
    ]);

    $program = Program::create([
        'name' => 'Test Program',
        'description' => 'Test description',
        'details_json' => [],
    ]);

    $booking = Booking::create([
        'student_id' => $student->id,
        'slot_id' => $slot->id,
        'program_id' => $program->id,
        'status' => 'confirmed',
        'video_platform' => 'zoom',
        'video_url' => 'https://zoom.us/class',
    ]);

    $response = $this->actingAs($admin)
        ->delete(route('admin.teachers.destroy', $teacher));

    $response->assertSessionHasErrors();
    $this->assertDatabaseHas('users', ['id' => $teacher->id]);
});

test('teacher can edit their own unbooked slot time', function () {
    $teacher = User::create([
        'name' => 'Ustaz Ali',
        'email' => 'ali@example.com',
        'password' => bcrypt('password'),
        'role' => 'teacher',
    ]);

    $slot = Slot::create([
        'teacher_id' => $teacher->id,
        'start_time' => Carbon::now()->addDay()->startOfHour()->toDateTimeString(),
        'end_time' => Carbon::now()->addDay()->startOfHour()->addHour()->toDateTimeString(),
        'is_booked' => false,
    ]);

    $newTime = Carbon::now()->addDays(2)->startOfHour();

    $response = $this->actingAs($teacher)
        ->put(route('teacher.slots.update', $slot), [
            'start_time' => $newTime->toDateTimeString(),
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('slots', [
        'id' => $slot->id,
        'start_time' => $newTime->toDateTimeString(),
        'end_time' => $newTime->copy()->addHour()->toDateTimeString(),
    ]);
});

test('teacher cannot edit a booked slot', function () {
    $teacher = User::create([
        'name' => 'Ustaz Ali',
        'email' => 'ali@example.com',
        'password' => bcrypt('password'),
        'role' => 'teacher',
    ]);

    $slot = Slot::create([
        'teacher_id' => $teacher->id,
        'start_time' => Carbon::now()->addDay()->startOfHour()->toDateTimeString(),
        'end_time' => Carbon::now()->addDay()->startOfHour()->addHour()->toDateTimeString(),
        'is_booked' => true,
    ]);

    $newTime = Carbon::now()->addDays(2)->startOfHour();

    $response = $this->actingAs($teacher)
        ->put(route('teacher.slots.update', $slot), [
            'start_time' => $newTime->toDateTimeString(),
        ]);

    $response->assertSessionHasErrors();
    $slot->refresh();
    expect($slot->start_time)->not->toBe($newTime->toDateTimeString());
});

test('teacher can open a slot with a custom session duration', function () {
    $teacher = User::create([
        'name' => 'Ustaz Ali',
        'email' => 'ali@example.com',
        'password' => bcrypt('password'),
        'role' => 'teacher',
    ]);

    $startTime = Carbon::now()->addDays(3)->startOfHour();

    $response = $this->actingAs($teacher)
        ->post(route('teacher.slots.store'), [
            'start_time' => $startTime->toDateTimeString(),
            'duration' => 45,
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('slots', [
        'teacher_id' => $teacher->id,
        'start_time' => $startTime->toDateTimeString(),
        'end_time' => $startTime->copy()->addMinutes(45)->toDateTimeString(),
    ]);
});

test('teacher can update slot duration', function () {
    $teacher = User::create([
        'name' => 'Ustaz Ali',
        'email' => 'ali@example.com',
        'password' => bcrypt('password'),
        'role' => 'teacher',
    ]);

    $slot = Slot::create([
        'teacher_id' => $teacher->id,
        'start_time' => Carbon::now()->addDay()->startOfHour()->toDateTimeString(),
        'end_time' => Carbon::now()->addDay()->startOfHour()->addHour()->toDateTimeString(),
        'is_booked' => false,
    ]);

    $newTime = Carbon::now()->addDays(2)->startOfHour();

    $response = $this->actingAs($teacher)
        ->put(route('teacher.slots.update', $slot), [
            'start_time' => $newTime->toDateTimeString(),
            'duration' => 90,
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('slots', [
        'id' => $slot->id,
        'start_time' => $newTime->toDateTimeString(),
        'end_time' => $newTime->copy()->addMinutes(90)->toDateTimeString(),
    ]);
});

test('teacher can batch generate weekend slots', function () {
    $teacher = User::create([
        'name' => 'Ustaz Ali',
        'email' => 'ali@example.com',
        'password' => bcrypt('password'),
        'role' => 'teacher',
    ]);

    $startDate = '2026-06-06';
    $endDate = '2026-06-07';

    Carbon::setTestNow(Carbon::parse('2026-06-06 00:00:00'));

    $response = $this->actingAs($teacher)
        ->post(route('teacher.slots.batch'), [
            'start_date' => $startDate,
            'end_date' => $endDate,
            'duration' => 60,
        ]);

    $response->assertRedirect();
    $response->assertSessionHasNoErrors();

    // 8 AM to 6 PM with 60m duration on Sat & Sun:
    // Sat: 8-9, 9-10, 10-11, 11-12, 12-13, 13-14, 14-15, 15-16, 16-17, 17-18 -> 10 slots
    // Sun: 8-9, 9-10, 10-11, 11-12, 12-13, 13-14, 14-15, 15-16, 16-17, 17-18 -> 10 slots
    // Total 20 slots
    expect(Slot::count())->toBe(20);

    // Let's check that slots exist on Saturday 2026-06-06
    $this->assertDatabaseHas('slots', [
        'teacher_id' => $teacher->id,
        'start_time' => '2026-06-06 08:00:00',
        'end_time' => '2026-06-06 09:00:00',
    ]);

    // Let's check Sunday last slot ends at 18:00
    $this->assertDatabaseHas('slots', [
        'teacher_id' => $teacher->id,
        'start_time' => '2026-06-07 17:00:00',
        'end_time' => '2026-06-07 18:00:00',
    ]);

    Carbon::setTestNow();
});

test('teacher batch generate skips overlapping slots and past slots', function () {
    $teacher = User::create([
        'name' => 'Ustaz Ali',
        'email' => 'ali@example.com',
        'password' => bcrypt('password'),
        'role' => 'teacher',
    ]);

    // Freeze time to Saturday afternoon at 14:30
    Carbon::setTestNow(Carbon::parse('2026-06-06 14:30:00'));

    // Create an existing slot at Saturday 16:00 - 17:00 (overlaps)
    Slot::create([
        'teacher_id' => $teacher->id,
        'start_time' => '2026-06-06 16:00:00',
        'end_time' => '2026-06-06 17:00:00',
        'is_booked' => false,
    ]);

    $response = $this->actingAs($teacher)
        ->post(route('teacher.slots.batch'), [
            'start_date' => '2026-06-06',
            'end_date' => '2026-06-06',
            'duration' => 60,
        ]);

    $response->assertRedirect();

    // Sat slots: 8-9, 9-10, 10-11, 11-12, 12-13, 13-14, 14-15, 15-16, 16-17 (existing), 17-18
    // Slots in the past (before 14:30): 8-9, 9-10, 10-11, 11-12, 12-13, 13-14, 14-15. -> skipped because past.
    // Slots in the future: 15-16, 16-17 (existing), 17-18.
    // 16-17: overlaps with existing -> skipped.
    // So only 15-16 and 17-18 should be generated.
    // Total slots should be: 1 (existing) + 2 (generated) = 3
    expect(Slot::count())->toBe(3);

    $this->assertDatabaseHas('slots', [
        'teacher_id' => $teacher->id,
        'start_time' => '2026-06-06 15:00:00',
        'end_time' => '2026-06-06 16:00:00',
    ]);

    $this->assertDatabaseHas('slots', [
        'teacher_id' => $teacher->id,
        'start_time' => '2026-06-06 17:00:00',
        'end_time' => '2026-06-06 18:00:00',
    ]);

    Carbon::setTestNow();
});
