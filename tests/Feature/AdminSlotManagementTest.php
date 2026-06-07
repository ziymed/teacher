<?php

use App\Models\Slot;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;

uses(RefreshDatabase::class);

test('non-admin cannot access admin slot bulk delete or clear all', function () {
    $student = User::create([
        'name' => 'Student User',
        'email' => 'student@example.com',
        'password' => bcrypt('password'),
        'role' => 'student',
    ]);

    $response = $this->actingAs($student)->delete(route('admin.slots.bulk-destroy'), [
        'ids' => [1, 2],
    ]);
    $response->assertStatus(403);

    $response2 = $this->actingAs($student)->delete(route('admin.slots.clear-all'));
    $response2->assertStatus(403);
});

test('admin can bulk delete unbooked slots', function () {
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin-slots@example.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
    ]);

    $teacher = User::create([
        'name' => 'Ustaz Ali',
        'email' => 'ali@example.com',
        'password' => bcrypt('password'),
        'role' => 'teacher',
    ]);

    $slot1 = Slot::create([
        'teacher_id' => $teacher->id,
        'start_time' => Carbon::now()->addDay()->startOfHour()->toDateTimeString(),
        'end_time' => Carbon::now()->addDay()->startOfHour()->addHour()->toDateTimeString(),
        'is_booked' => false,
    ]);

    $slot2 = Slot::create([
        'teacher_id' => $teacher->id,
        'start_time' => Carbon::now()->addDays(2)->startOfHour()->toDateTimeString(),
        'end_time' => Carbon::now()->addDays(2)->startOfHour()->addHour()->toDateTimeString(),
        'is_booked' => false,
    ]);

    $response = $this->actingAs($admin)->delete(route('admin.slots.bulk-destroy'), [
        'ids' => [$slot1->id, $slot2->id],
    ]);

    $response->assertRedirect();
    $this->assertDatabaseMissing('slots', ['id' => $slot1->id]);
    $this->assertDatabaseMissing('slots', ['id' => $slot2->id]);
});

test('admin cannot delete booked slots via bulk delete', function () {
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin-slots@example.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
    ]);

    $teacher = User::create([
        'name' => 'Ustaz Ali',
        'email' => 'ali@example.com',
        'password' => bcrypt('password'),
        'role' => 'teacher',
    ]);

    $bookedSlot = Slot::create([
        'teacher_id' => $teacher->id,
        'start_time' => Carbon::now()->addDay()->startOfHour()->toDateTimeString(),
        'end_time' => Carbon::now()->addDay()->startOfHour()->addHour()->toDateTimeString(),
        'is_booked' => true,
    ]);

    $unbookedSlot = Slot::create([
        'teacher_id' => $teacher->id,
        'start_time' => Carbon::now()->addDays(2)->startOfHour()->toDateTimeString(),
        'end_time' => Carbon::now()->addDays(2)->startOfHour()->addHour()->toDateTimeString(),
        'is_booked' => false,
    ]);

    $response = $this->actingAs($admin)->delete(route('admin.slots.bulk-destroy'), [
        'ids' => [$bookedSlot->id, $unbookedSlot->id],
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('slots', ['id' => $bookedSlot->id]);
    $this->assertDatabaseMissing('slots', ['id' => $unbookedSlot->id]);
});

test('admin can clear all unbooked slots', function () {
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin-slots@example.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
    ]);

    $teacher = User::create([
        'name' => 'Ustaz Ali',
        'email' => 'ali@example.com',
        'password' => bcrypt('password'),
        'role' => 'teacher',
    ]);

    $bookedSlot = Slot::create([
        'teacher_id' => $teacher->id,
        'start_time' => Carbon::now()->addDay()->startOfHour()->toDateTimeString(),
        'end_time' => Carbon::now()->addDay()->startOfHour()->addHour()->toDateTimeString(),
        'is_booked' => true,
    ]);

    $unbookedSlot = Slot::create([
        'teacher_id' => $teacher->id,
        'start_time' => Carbon::now()->addDays(2)->startOfHour()->toDateTimeString(),
        'end_time' => Carbon::now()->addDays(2)->startOfHour()->addHour()->toDateTimeString(),
        'is_booked' => false,
    ]);

    $response = $this->actingAs($admin)->delete(route('admin.slots.clear-all'));

    $response->assertRedirect();
    $this->assertDatabaseHas('slots', ['id' => $bookedSlot->id]);
    $this->assertDatabaseMissing('slots', ['id' => $unbookedSlot->id]);
});

test('admin can create a teaching slot for a teacher', function () {
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin@example.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
    ]);

    $teacher = User::create([
        'name' => 'Ustaz Ali',
        'email' => 'ali@example.com',
        'password' => bcrypt('password'),
        'role' => 'teacher',
    ]);

    $startTime = Carbon::now()->addDays(3)->startOfHour();

    $response = $this->actingAs($admin)
        ->post(route('admin.slots.store'), [
            'teacher_id' => $teacher->id,
            'start_time' => $startTime->toDateTimeString(),
            'duration' => 45,
        ]);

    $response->assertRedirect();
    $response->assertSessionHasNoErrors();

    $this->assertDatabaseHas('slots', [
        'teacher_id' => $teacher->id,
        'start_time' => $startTime->toDateTimeString(),
        'end_time' => $startTime->copy()->addMinutes(45)->toDateTimeString(),
        'is_booked' => false,
    ]);
});

test('admin cannot create an overlapping slot for a teacher', function () {
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin@example.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
    ]);

    $teacher = User::create([
        'name' => 'Ustaz Ali',
        'email' => 'ali@example.com',
        'password' => bcrypt('password'),
        'role' => 'teacher',
    ]);

    $startTime = Carbon::now()->addDays(3)->startOfHour();

    // Create existing slot
    Slot::create([
        'teacher_id' => $teacher->id,
        'start_time' => $startTime->toDateTimeString(),
        'end_time' => $startTime->copy()->addHour()->toDateTimeString(),
        'is_booked' => false,
    ]);

    // Try to create overlapping slot (30 mins duration starting 15 mins after first slot start)
    $response = $this->actingAs($admin)
        ->post(route('admin.slots.store'), [
            'teacher_id' => $teacher->id,
            'start_time' => $startTime->copy()->addMinutes(15)->toDateTimeString(),
            'duration' => 30,
        ]);

    $response->assertSessionHasErrors();
    expect(Slot::where('teacher_id', $teacher->id)->count())->toBe(1);
});

test('non-admin cannot create teaching slots', function () {
    $student = User::create([
        'name' => 'Student User',
        'email' => 'student@example.com',
        'password' => bcrypt('password'),
        'role' => 'student',
    ]);

    $teacher = User::create([
        'name' => 'Ustaz Ali',
        'email' => 'ali@example.com',
        'password' => bcrypt('password'),
        'role' => 'teacher',
    ]);

    $startTime = Carbon::now()->addDays(3)->startOfHour();

    $response = $this->actingAs($student)
        ->post(route('admin.slots.store'), [
            'teacher_id' => $teacher->id,
            'start_time' => $startTime->toDateTimeString(),
            'duration' => 60,
        ]);

    $response->assertStatus(403);
    expect(Slot::count())->toBe(0);
});
