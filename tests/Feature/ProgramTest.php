<?php

use App\Models\Program;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('tuhfatul athfal program is seeded successfully', function () {
    $this->seed(DatabaseSeeder::class);

    $program = Program::where('name->en', 'Tuhfatul Athfal Private')->first();

    expect($program)->not->toBeNull();
    app()->setLocale('id');
    expect($program->description_translation)->toContain('12 minggu');
    expect($program->details_translation)->toBeArray();
    expect($program->details_translation)->toContain('Hafalan matan');
    expect($program->details_translation)->toContain('Penjelasan bait');
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
            'name' => [
                'id' => 'New Qiraat Program',
                'ar' => 'برنامج القراءات الجديد',
                'en' => 'New Qiraat Program',
            ],
            'description' => [
                'id' => 'Advanced reading rules',
                'ar' => 'قواعد القراءة المتقدمة',
                'en' => 'Advanced reading rules',
            ],
            'details_json' => [
                'id' => 'Rule 1, Rule 2',
                'ar' => 'القاعدة 1, القاعدة 2',
                'en' => 'Rule 1, Rule 2',
            ],
        ]);

    $response->assertRedirect();

    $program = Program::where('name->en', 'New Qiraat Program')->first();
    expect($program)->not->toBeNull();
    expect($program->description['en'])->toBe('Advanced reading rules');
    expect($program->is_hidden)->toBeFalse();
    expect($program->details_json['en'])->toBe(['Rule 1', 'Rule 2']);
});

test('admin can update a program', function () {
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin-test@example.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
    ]);

    $program = Program::create([
        'name' => [
            'id' => 'Old Program',
            'ar' => 'البرنامج القديم',
            'en' => 'Old Program',
        ],
        'description' => [
            'id' => 'Old description',
            'ar' => 'الوصف القديم',
            'en' => 'Old description',
        ],
        'details_json' => [
            'id' => ['Old detail'],
            'ar' => ['تفصيل قديم'],
            'en' => ['Old detail'],
        ],
    ]);

    $response = $this->actingAs($admin)
        ->put(route('admin.programs.update', $program), [
            'name' => [
                'id' => 'Updated Program',
                'ar' => 'البرنامج المحدث',
                'en' => 'Updated Program',
            ],
            'description' => [
                'id' => 'Updated description',
                'ar' => 'الوصف المحدث',
                'en' => 'Updated description',
            ],
            'details_json' => [
                'id' => 'New detail 1, New detail 2',
                'ar' => 'تفصيل جديد 1, تفصيل جديد 2',
                'en' => 'New detail 1, New detail 2',
            ],
        ]);

    $response->assertRedirect();
    $program->refresh();
    expect($program->name['en'])->toBe('Updated Program');
    expect($program->description['en'])->toBe('Updated description');
    expect($program->details_json['en'])->toBe(['New detail 1', 'New detail 2']);
});

test('admin can toggle program visibility', function () {
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin-test@example.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
    ]);

    $program = Program::create([
        'name' => [
            'id' => 'Test Program',
            'ar' => 'برنامج تجريبي',
            'en' => 'Test Program',
        ],
        'description' => [
            'id' => 'Description',
            'ar' => 'وصف',
            'en' => 'Description',
        ],
        'details_json' => [
            'id' => [],
            'ar' => [],
            'en' => [],
        ],
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
        'name' => [
            'id' => 'Delete Me',
            'ar' => 'احذفني',
            'en' => 'Delete Me',
        ],
        'description' => [
            'id' => 'Description',
            'ar' => 'وصف',
            'en' => 'Description',
        ],
        'details_json' => [
            'id' => [],
            'ar' => [],
            'en' => [],
        ],
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
            'name' => [
                'id' => 'Fail Program',
                'ar' => 'برنامج فاشl',
                'en' => 'Fail Program',
            ],
            'description' => [
                'id' => 'Fail desc',
                'ar' => 'وصف فاشl',
                'en' => 'Fail desc',
            ],
            'details_json' => [
                'id' => '',
                'ar' => '',
                'en' => '',
            ],
        ]);

    $response->assertSessionHasErrors();
    $this->assertFalse(Program::where('name->en', 'Fail Program')->exists());
});

test('admin can access the programs index page', function () {
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin-test@example.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
    ]);

    Program::create([
        'name' => [
            'id' => 'Index Test Program',
            'ar' => 'برنامج الفحص',
            'en' => 'Index Test Program',
        ],
        'description' => [
            'id' => 'Test desc',
            'ar' => 'الوصف الفحص',
            'en' => 'Test desc',
        ],
        'details_json' => [
            'id' => [],
            'ar' => [],
            'en' => [],
        ],
    ]);

    $response = $this->actingAs($admin)
        ->get(route('admin.programs.index'));

    $response->assertOk();
    $response->assertSee('Index Test Program');
});
