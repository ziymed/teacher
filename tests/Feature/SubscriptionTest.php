<?php

use App\Models\User;
use App\Models\Slot;
use App\Models\Program;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('a student can view pricing plans page', function () {
    $student = User::factory()->create(['role' => 'student']);

    $response = $this->actingAs($student)->get(route('subscription.index'));

    $response->assertStatus(200);
});

test('a student can upgrade their plan with valid mock payment', function () {
    $student = User::factory()->create(['role' => 'student', 'subscription_plan' => 'free']);

    $response = $this->actingAs($student)->post(route('subscription.checkout'), [
        'plan' => 'pro',
        'card_number' => '4111222233334444',
        'card_name' => 'AHMAD SYARIF',
        'card_expiry' => '12/29',
        'card_cvv' => '123',
    ]);

    $response->assertRedirect(route('student.dashboard'));
    
    $student->refresh();
    expect($student->subscription_plan)->toBe('pro');
    expect($student->subscription_status)->toBe('active');
});

test('a student subscription limit enforces booking limits', function () {
    $student = User::factory()->create(['role' => 'student', 'subscription_plan' => 'free', 'subscription_status' => 'inactive']);
    $teacher = User::factory()->create(['role' => 'teacher']);
    $program = Program::create(['name' => 'Talqin Program', 'description' => 'Test', 'details_json' => ['test']]);

    // Create 1 booking (fills up the free limit of 1 booking)
    $slot1 = Slot::create([
        'teacher_id' => $teacher->id,
        'start_time' => now()->addDays(1)->toDateTimeString(),
        'end_time' => now()->addDays(1)->addHour()->toDateTimeString(),
        'is_booked' => false,
    ]);

    $this->actingAs($student)->post(route('bookings.store'), [
        'slot_id' => $slot1->id,
        'program_id' => $program->id,
    ]);

    // Attempting to book a second session should fail and redirect with error
    $slot2 = Slot::create([
        'teacher_id' => $teacher->id,
        'start_time' => now()->addDays(2)->toDateTimeString(),
        'end_time' => now()->addDays(2)->addHour()->toDateTimeString(),
        'is_booked' => false,
    ]);

    $response = $this->actingAs($student)->post(route('bookings.store'), [
        'slot_id' => $slot2->id,
        'program_id' => $program->id,
    ]);

    $response->assertSessionHasErrors('error');
});
