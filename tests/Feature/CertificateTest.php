<?php

use App\Models\Certificate;
use App\Models\Program;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('non-admin cannot access certificates management page', function () {
    $student = User::create([
        'name' => 'Student User',
        'email' => 'student@example.com',
        'password' => bcrypt('password'),
        'role' => 'student',
    ]);

    $response = $this->actingAs($student)->get(route('admin.certificates.index'));
    $response->assertStatus(403);
});

test('admin can access certificates management page', function () {
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin@example.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
    ]);

    $response = $this->actingAs($admin)->get(route('admin.certificates.index'));
    $response->assertOk();
});

test('admin can issue a certificate to a student', function () {
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin@example.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
    ]);

    $student = User::create([
        'name' => 'Ahmad Student',
        'email' => 'student@example.com',
        'password' => bcrypt('password'),
        'role' => 'student',
    ]);

    $program = Program::create([
        'name' => ['id' => 'Program Talqin', 'ar' => 'برنامج التلقين', 'en' => 'Talqin Program'],
        'description' => ['id' => 'Desc ID', 'ar' => 'Desc AR', 'en' => 'Desc EN'],
        'details_json' => [],
    ]);

    $response = $this->actingAs($admin)
        ->post(route('admin.certificates.store'), [
            'student_id' => $student->id,
            'program_id' => $program->id,
            'notes' => 'Exceptional performance in Tajweed rules.',
        ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('certificates', [
        'student_id' => $student->id,
        'program_id' => $program->id,
        'notes' => 'Exceptional performance in Tajweed rules.',
    ]);
});

test('admin cannot issue duplicate certificates for same student and program', function () {
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin@example.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
    ]);

    $student = User::create([
        'name' => 'Ahmad Student',
        'email' => 'student@example.com',
        'password' => bcrypt('password'),
        'role' => 'student',
    ]);

    $program = Program::create([
        'name' => ['id' => 'Program Talqin', 'ar' => 'برنامج التلقين', 'en' => 'Talqin Program'],
        'description' => ['id' => 'Desc ID', 'ar' => 'Desc AR', 'en' => 'Desc EN'],
        'details_json' => [],
    ]);

    // Issue the first one
    Certificate::create([
        'student_id' => $student->id,
        'program_id' => $program->id,
    ]);

    // Attempt second issuance
    $response = $this->actingAs($admin)
        ->post(route('admin.certificates.store'), [
            'student_id' => $student->id,
            'program_id' => $program->id,
            'notes' => 'Duplicate attempt.',
        ]);

    $response->assertSessionHasErrors();
    expect(Certificate::count())->toBe(1);
});

test('admin can update certificate notes', function () {
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin@example.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
    ]);

    $student = User::create([
        'name' => 'Ahmad Student',
        'email' => 'student@example.com',
        'password' => bcrypt('password'),
        'role' => 'student',
    ]);

    $program = Program::create([
        'name' => ['id' => 'Program Talqin', 'ar' => 'برنامج التلقين', 'en' => 'Talqin Program'],
        'description' => ['id' => 'Desc ID', 'ar' => 'Desc AR', 'en' => 'Desc EN'],
        'details_json' => [],
    ]);

    $certificate = Certificate::create([
        'student_id' => $student->id,
        'program_id' => $program->id,
        'notes' => 'Original notes',
    ]);

    $response = $this->actingAs($admin)
        ->put(route('admin.certificates.update', $certificate), [
            'notes' => 'Updated notes here.',
        ]);

    $response->assertRedirect();
    $certificate->refresh();
    expect($certificate->notes)->toBe('Updated notes here.');
});

test('admin can revoke/delete a certificate', function () {
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin@example.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
    ]);

    $student = User::create([
        'name' => 'Ahmad Student',
        'email' => 'student@example.com',
        'password' => bcrypt('password'),
        'role' => 'student',
    ]);

    $program = Program::create([
        'name' => ['id' => 'Program Talqin', 'ar' => 'برنامج التلقين', 'en' => 'Talqin Program'],
        'description' => ['id' => 'Desc ID', 'ar' => 'Desc AR', 'en' => 'Desc EN'],
        'details_json' => [],
    ]);

    $certificate = Certificate::create([
        'student_id' => $student->id,
        'program_id' => $program->id,
    ]);

    $response = $this->actingAs($admin)
        ->delete(route('admin.certificates.destroy', $certificate));

    $response->assertRedirect();
    $this->assertDatabaseMissing('certificates', ['id' => $certificate->id]);
});
