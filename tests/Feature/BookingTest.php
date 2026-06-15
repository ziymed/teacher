<?php

use App\Models\Booking;
use App\Models\Program;
use App\Models\Slot;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Support\Carbon;

beforeEach(function () {
    // Seed core programs for testing
    $this->program = Program::create([
        'name' => 'Talqin Test Program',
        'description' => 'Test description',
        'details_json' => ['Detail 1'],
    ]);

    // Create a student and a teacher
    $this->student = User::create([
        'name' => 'Test Student',
        'email' => 'student-test@example.com',
        'password' => bcrypt('password'),
        'role' => 'student',
    ]);

    $this->teacher = User::create([
        'name' => 'Test Teacher',
        'email' => 'teacher-test@example.com',
        'password' => bcrypt('password'),
        'role' => 'teacher',
    ]);

    // Create a profile for the teacher
    TeacherProfile::create([
        'user_id' => $this->teacher->id,
        'bio' => 'Test bio of Morocco teacher',
        'whatsapp_number' => '+6282251985570',
        'zoom_link' => 'https://zoom.us/j/teacher-zoom',
        'google_meet_link' => 'https://meet.google.com/abc-defg-hij',
        'specializations_json' => ['Talqin'],
    ]);

    // Create a time slot
    $this->slot = Slot::create([
        'teacher_id' => $this->teacher->id,
        'start_time' => Carbon::now()->addDays(2)->setHour(10)->setMinute(0),
        'end_time' => Carbon::now()->addDays(2)->setHour(11)->setMinute(0),
        'is_booked' => false,
    ]);
});

test('guest users cannot book sessions', function () {
    $response = $this->post(route('bookings.store'), [
        'slot_id' => $this->slot->id,
        'program_id' => $this->program->id,
    ]);

    $response->assertRedirect(route('login'));
});

test('students can successfully book an available session', function () {
    $this->actingAs($this->student);

    $response = $this->post(route('bookings.store'), [
        'slot_id' => $this->slot->id,
        'program_id' => $this->program->id,
        'student_notes' => 'Looking forward to it!',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    // Verify booking was created in DB
    $this->assertDatabaseHas('bookings', [
        'student_id' => $this->student->id,
        'slot_id' => $this->slot->id,
        'program_id' => $this->program->id,
        'status' => 'confirmed',
    ]);

    // Verify slot was marked as booked automatically by booking created boot hook
    $this->assertTrue($this->slot->fresh()->is_booked);
});

test('session double-booking is blocked', function () {
    // Pre-book the slot
    $this->slot->update(['is_booked' => true]);

    $this->actingAs($this->student);

    $response = $this->post(route('bookings.store'), [
        'slot_id' => $this->slot->id,
        'program_id' => $this->program->id,
    ]);

    // Should return validation/session errors for locked slot
    $response->assertSessionHasErrors(['error']);
});

test('student gets the real Google Meet link when they choose Google Meet', function () {
    $this->actingAs($this->student);

    $response = $this->post(route('bookings.store'), [
        'slot_id' => $this->slot->id,
        'program_id' => $this->program->id,
        'video_platform' => 'google_meet',
    ]);

    $response->assertSessionHasNoErrors();

    $booking = Booking::where('slot_id', $this->slot->id)->first();
    $this->assertEquals('google_meet', $booking->video_platform);
    $this->assertEquals('https://meet.google.com/abc-defg-hij', $booking->video_url);
});

test('student gets the real Zoom link when they choose Zoom', function () {
    $this->actingAs($this->student);

    $response = $this->post(route('bookings.store'), [
        'slot_id' => $this->slot->id,
        'program_id' => $this->program->id,
        'video_platform' => 'zoom',
    ]);

    $response->assertSessionHasNoErrors();

    $booking = Booking::where('slot_id', $this->slot->id)->first();
    $this->assertEquals('zoom', $booking->video_platform);
    $this->assertEquals('https://zoom.us/j/teacher-zoom', $booking->video_url);
});

test('booking falls back to available link if chosen link is missing', function () {
    $profile = $this->teacher->teacherProfile;
    $profile->update([
        'google_meet_link' => null,
        'zoom_link' => 'https://zoom.us/j/only-zoom-link',
    ]);

    $this->actingAs($this->student);

    $response = $this->post(route('bookings.store'), [
        'slot_id' => $this->slot->id,
        'program_id' => $this->program->id,
        'video_platform' => 'google_meet',
    ]);

    $response->assertSessionHasNoErrors();

    $booking = Booking::where('slot_id', $this->slot->id)->first();
    $this->assertEquals('zoom', $booking->video_platform);
    $this->assertEquals('https://zoom.us/j/only-zoom-link', $booking->video_url);
});

test('past bookings are automatically cancelled when slot end time is missed', function () {
    // Create a slot in the past
    $pastSlot = Slot::create([
        'teacher_id' => $this->teacher->id,
        'start_time' => Carbon::now()->subHours(2),
        'end_time' => Carbon::now()->subHour(),
        'is_booked' => true,
    ]);

    // Create a confirmed booking for the past slot
    $booking = Booking::create([
        'student_id' => $this->student->id,
        'slot_id' => $pastSlot->id,
        'program_id' => $this->program->id,
        'status' => 'confirmed',
    ]);

    // Call cancelMissed
    $cancelledCount = Booking::cancelMissed();
    expect($cancelledCount)->toBe(1);

    // Verify booking status is now cancelled in the database
    $booking->refresh();
    expect($booking->status)->toBe('cancelled');

    // Verify slot is now unbooked
    $pastSlot->refresh();
    expect($pastSlot->is_booked)->toBeFalse();
});

test('visiting dashboard triggers cancellation of missed bookings', function () {
    // Create a slot in the past
    $pastSlot = Slot::create([
        'teacher_id' => $this->teacher->id,
        'start_time' => Carbon::now()->subHours(2),
        'end_time' => Carbon::now()->subHour(),
        'is_booked' => true,
    ]);

    $booking = Booking::create([
        'student_id' => $this->student->id,
        'slot_id' => $pastSlot->id,
        'program_id' => $this->program->id,
        'status' => 'confirmed',
    ]);

    // Visit dashboard as student
    $this->actingAs($this->student);
    $response = $this->get(route('student.dashboard'));
    $response->assertOk();

    // Verify booking is cancelled automatically
    $booking->refresh();
    expect($booking->status)->toBe('cancelled');
});

test('bookings:cancel-missed console command cancels past bookings', function () {
    // Create a slot in the past
    $pastSlot = Slot::create([
        'teacher_id' => $this->teacher->id,
        'start_time' => Carbon::now()->subHours(2),
        'end_time' => Carbon::now()->subHour(),
        'is_booked' => true,
    ]);

    $booking = Booking::create([
        'student_id' => $this->student->id,
        'slot_id' => $pastSlot->id,
        'program_id' => $this->program->id,
        'status' => 'confirmed',
    ]);

    // Call the console command
    $this->artisan('bookings:cancel-missed')
        ->expectsOutput('Alhamdulillah! 1 missed bookings have been successfully cancelled.')
        ->assertExitCode(0);

    // Verify booking is cancelled
    $booking->refresh();
    expect($booking->status)->toBe('cancelled');
});
