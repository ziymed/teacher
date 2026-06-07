<?php

use App\Models\Program;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('tuhfatul athfal program is seeded successfully', function () {
    $this->seed(DatabaseSeeder::class);

    $program = Program::where('name', 'Tuhfatul Athfal Program')->first();

    expect($program)->not->toBeNull();
    expect($program->description)->toContain('12 minggu');
    expect($program->details_json)->toBeArray();
    expect($program->details_json)->toContain('Menghafal matan Tuhfatul Athfal');
    expect($program->details_json)->toContain('Memahami makna setiap bait');
});

test('tuhfatul athfal program is visible on the landing page', function () {
    $this->seed(DatabaseSeeder::class);

    $response = $this->get(route('home'));

    $response->assertOk();
    $response->assertSee('Tuhfatul Athfal');
});

test('admin can create a program', function () {
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin-test@example.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
    ]);

    $response = $this->actingAs($admin)
        ->post(route('admin.programs.store'), [
            'name' => 'New Qiraat Program',
            'description' => 'Advanced reading rules',
            'details_json' => 'Rule 1, Rule 2',
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('programs', [
        'name' => 'New Qiraat Program',
        'description' => 'Advanced reading rules',
        'is_hidden' => false,
    ]);

    $program = Program::where('name', 'New Qiraat Program')->first();
    expect($program->details_json)->toBe(['Rule 1', 'Rule 2']);
});

test('admin can update a program', function () {
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin-test@example.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
    ]);

    $program = Program::create([
        'name' => 'Old Program',
        'description' => 'Old description',
        'details_json' => ['Old detail'],
    ]);

    $response = $this->actingAs($admin)
        ->put(route('admin.programs.update', $program), [
            'name' => 'Updated Program',
            'description' => 'Updated description',
            'details_json' => 'New detail 1, New detail 2',
        ]);

    $response->assertRedirect();
    $program->refresh();
    expect($program->name)->toBe('Updated Program');
    expect($program->description)->toBe('Updated description');
    expect($program->details_json)->toBe(['New detail 1', 'New detail 2']);
});

test('admin can toggle program visibility', function () {
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin-test@example.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
    ]);

    $program = Program::create([
        'name' => 'Test Program',
        'description' => 'Description',
        'details_json' => [],
        'is_hidden' => false,
    ]);

    $response = $this->actingAs($admin)
        ->patch(route('admin.programs.toggle-visibility', $program));

    $response->assertRedirect();
    $program->refresh();
    expect($program->is_hidden)->toBeTrue();

    // Toggle back
    $this->actingAs($admin)->patch(route('admin.programs.toggle-visibility', $program));
    $program->refresh();
    expect($program->is_hidden)->toBeFalse();
});

test('admin can delete a program if no dependencies exist', function () {
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin-test@example.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
    ]);

    $program = Program::create([
        'name' => 'Delete Me',
        'description' => 'Description',
        'details_json' => [],
    ]);

    $response = $this->actingAs($admin)
        ->delete(route('admin.programs.destroy', $program));

    $response->assertRedirect();
    $this->assertDatabaseMissing('programs', ['id' => $program->id]);
});

test('non-admin cannot manage programs', function () {
    $student = User::create([
        'name' => 'Student User',
        'email' => 'student-test@example.com',
        'password' => bcrypt('password'),
        'role' => 'student',
    ]);

    $response = $this->actingAs($student)
        ->post(route('admin.programs.store'), [
            'name' => 'Fail Program',
            'description' => 'Fail desc',
        ]);

    $response->assertSessionHasErrors();
    $this->assertDatabaseMissing('programs', ['name' => 'Fail Program']);
});

test('admin can access the programs index page', function () {
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin-test@example.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
    ]);

    Program::create([
        'name' => 'Index Test Program',
        'description' => 'Test desc',
        'details_json' => [],
    ]);

    $response = $this->actingAs($admin)
        ->get(route('admin.programs.index'));

    $response->assertOk();
    $response->assertSee('Index Test Program');
});
