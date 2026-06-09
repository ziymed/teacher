<?php

use App\Models\Booking;
use App\Models\Program;
use App\Models\Slot;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('non-admin cannot access students management', function () {
    $student = User::create([
        'name' => 'Student User',
        'email' => 'student-test@example.com',
        'password' => bcrypt('password'),
        'role' => 'student',
    ]);

    $response = $this->actingAs($student)->get(route('admin.students.index'));
    $response->assertStatus(403);
});

test('admin can access the students index page', function () {
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin-test@example.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
    ]);

    $student = User::create([
        'name' => 'Ahmad Student',
        'email' => 'ahmad@example.com',
        'password' => bcrypt('password'),
        'role' => 'student',
    ]);

    $response = $this->actingAs($admin)->get(route('admin.students.index'));
    $response->assertOk();
    $response->assertSee('Ahmad Student');
});

test('admin can create a student user', function () {
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin-test@example.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
    ]);

    $response = $this->actingAs($admin)
        ->post(route('admin.students.store'), [
            'name' => 'New Student',
            'email' => 'newstudent@example.com',
            'password' => 'password123',
        ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('users', [
        'name' => 'New Student',
        'email' => 'newstudent@example.com',
        'role' => 'student',
    ]);
});

test('admin can update a student profile', function () {
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin-test@example.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
    ]);

    $student = User::create([
        'name' => 'Old Student Name',
        'email' => 'student-edit@example.com',
        'password' => bcrypt('password'),
        'role' => 'student',
    ]);

    $response = $this->actingAs($admin)
        ->put(route('admin.students.update', $student), [
            'name' => 'Updated Student Name',
            'email' => 'student-edit@example.com', // same email
        ]);

    $response->assertRedirect();

    $student->refresh();
    expect($student->name)->toBe('Updated Student Name');
});

test('admin can delete a student if no active bookings exist', function () {
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin-test@example.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
    ]);

    $student = User::create([
        'name' => 'Ahmad Student',
        'email' => 'ahmad-delete@example.com',
        'password' => bcrypt('password'),
        'role' => 'student',
    ]);

    $response = $this->actingAs($admin)
        ->delete(route('admin.students.destroy', $student));

    $response->assertRedirect();
    $this->assertDatabaseMissing('users', ['id' => $student->id]);
});

test('admin cannot delete a student if they have active/confirmed bookings', function () {
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin-test@example.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
    ]);

    $teacher = User::create([
        'name' => 'Ustaz Anas',
        'email' => 'anas-test@example.com',
        'password' => bcrypt('password'),
        'role' => 'teacher',
    ]);

    $student = User::create([
        'name' => 'Ahmad Student',
        'email' => 'ahmad-delete-fail@example.com',
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
        ->delete(route('admin.students.destroy', $student));

    $response->assertSessionHasErrors();
    $this->assertDatabaseHas('users', ['id' => $student->id]);
});

test('non-admin cannot promote a student to teacher', function () {
    $student = User::create([
        'name' => 'Student User',
        'email' => 'student-test@example.com',
        'password' => bcrypt('password'),
        'role' => 'student',
    ]);

    $otherStudent = User::create([
        'name' => 'Other Student',
        'email' => 'other@example.com',
        'password' => bcrypt('password'),
        'role' => 'student',
    ]);

    $response = $this->actingAs($student)
        ->post(route('admin.students.promote', $otherStudent), [
            'bio' => ['id' => 'Bio ID', 'en' => 'Bio EN', 'ar' => 'Bio AR'],
            'whatsapp_number' => '+62812345678',
        ]);

    $response->assertStatus(403);
});

test('admin can promote student to teacher with valid payload', function () {
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin-test@example.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
    ]);

    $student = User::create([
        'name' => 'Ahmad Student',
        'email' => 'ahmad@example.com',
        'password' => bcrypt('password'),
        'role' => 'student',
    ]);

    $response = $this->actingAs($admin)
        ->post(route('admin.students.promote', $student), [
            'bio' => [
                'id' => 'Guru berpengalaman',
                'en' => 'Experienced teacher',
                'ar' => 'أستاذ ذو خبرة',
            ],
            'whatsapp_number' => '+62812345678',
            'specializations_json' => 'Tajweed, Tahseen',
            'zoom_link' => 'https://zoom.us/j/123456789',
            'google_meet_link' => 'https://meet.google.com/abc-defg-hij',
        ]);

    $response->assertRedirect();
    $student->refresh();

    expect($student->role)->toBe('teacher');
    $this->assertDatabaseHas('teacher_profiles', [
        'user_id' => $student->id,
        'whatsapp_number' => '+62812345678',
        'zoom_link' => 'https://zoom.us/j/123456789',
        'google_meet_link' => 'https://meet.google.com/abc-defg-hij',
    ]);
});

test('admin cannot promote student who has active or confirmed bookings', function () {
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin-test@example.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
    ]);

    $student = User::create([
        'name' => 'Ahmad Student',
        'email' => 'ahmad@example.com',
        'password' => bcrypt('password'),
        'role' => 'student',
    ]);

    $teacher = User::create([
        'name' => 'Ustaz Anas',
        'email' => 'anas-test@example.com',
        'password' => bcrypt('password'),
        'role' => 'teacher',
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
        ->post(route('admin.students.promote', $student), [
            'bio' => [
                'id' => 'Guru berpengalaman',
                'en' => 'Experienced teacher',
                'ar' => 'أستاذ ذو خبرة',
            ],
            'whatsapp_number' => '+62812345678',
        ]);

    $response->assertSessionHasErrors();
    $student->refresh();
    expect($student->role)->toBe('student');
    $this->assertDatabaseMissing('teacher_profiles', [
        'user_id' => $student->id,
    ]);
});
