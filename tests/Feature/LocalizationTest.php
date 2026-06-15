<?php

use App\Models\Program;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\App;

uses(RefreshDatabase::class);

test('user can set locale via POST request', function () {
    $response = $this->post(route('locale.update'), [
        'locale' => 'ar',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('locale', 'ar');
});

test('locale persists in session and changes active application locale', function () {
    $this->withSession(['locale' => 'en']);

    $response = $this->get(route('home'));

    $response->assertOk();
    expect(App::getLocale())->toBe('en');
});

test('inertia shared props contain correct locale, translations, and direction', function () {
    $this->withSession(['locale' => 'ar']);

    $response = $this->get(route('home'));

    $response->assertOk();

    // Test that the session sets the locale and direction correctly in Inertia shared props
    $inertiaData = $response->original->getData()['page'] ?? null;
    if ($inertiaData) {
        expect($inertiaData['props']['locale'])->toBe('ar');
        expect($inertiaData['props']['locale_direction'])->toBe('rtl');
        expect($inertiaData['props']['translations'])->toBeArray();
    }
});

test('program model supports translatable attributes and backward compatibility', function () {
    // 1. Multilingual program
    $programMulti = Program::create([
        'name' => [
            'id' => 'Program Indonesia',
            'ar' => 'برنامج عربي',
            'en' => 'English Program',
        ],
        'description' => [
            'id' => 'Deskripsi Indonesia',
            'ar' => 'وصف عربي',
            'en' => 'English Description',
        ],
        'details_json' => [
            'id' => ['Detail 1'],
            'ar' => ['تفصيل 1'],
            'en' => ['Detail 1 En'],
        ],
    ]);

    // Test translation resolving based on locale
    App::setLocale('ar');
    expect($programMulti->name_translation)->toBe('برنامج عربي');
    expect($programMulti->description_translation)->toBe('وصف عربي');
    expect($programMulti->details_translation)->toBe(['تفصيل 1']);

    App::setLocale('en');
    expect($programMulti->name_translation)->toBe('English Program');
    expect($programMulti->description_translation)->toBe('English Description');
    expect($programMulti->details_translation)->toBe(['Detail 1 En']);

    App::setLocale('id');
    expect($programMulti->name_translation)->toBe('Program Indonesia');
    expect($programMulti->description_translation)->toBe('Deskripsi Indonesia');
    expect($programMulti->details_translation)->toBe(['Detail 1']);

    // 2. Flat program (backward compatibility)
    $programFlat = Program::create([
        'name' => 'Legacy Program',
        'description' => 'Legacy Description',
        'details_json' => ['Item 1', 'Item 2'],
    ]);

    App::setLocale('ar');
    expect($programFlat->name_translation)->toBe('Legacy Program');
    expect($programFlat->description_translation)->toBe('Legacy Description');
    expect($programFlat->details_translation)->toBe(['Item 1', 'Item 2']);
});

test('admin can store and update program with translations', function () {
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin-local-test@example.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
    ]);

    $pricesPayload = [
        'private' => [
            'id' => ['monthly' => 500000, 'program' => 1500000],
            'my' => ['monthly' => 150, 'program' => 450],
            'sg' => ['monthly' => 45, 'program' => 135],
        ],
        'group' => [
            'id' => ['monthly' => 500000, 'program' => 1500000],
            'my' => ['monthly' => 150, 'program' => 450],
            'sg' => ['monthly' => 45, 'program' => 135],
        ],
    ];

    $response = $this->actingAs($admin)
        ->post(route('admin.programs.store'), [
            'name' => [
                'id' => 'Nama Baru',
                'ar' => 'اسم جديد',
                'en' => 'New Name',
            ],
            'description' => [
                'id' => 'Deskripsi Baru',
                'ar' => 'وصف جديد',
                'en' => 'New Description',
            ],
            'details_json' => [
                'id' => 'Detail 1, Detail 2',
                'ar' => 'تفصيل ١, تفصيل ٢',
                'en' => 'Detail 1 En, Detail 2 En',
            ],
            'type' => 'both',
            'prices_json' => $pricesPayload,
        ]);

    $response->assertRedirect();

    $program = Program::latest('id')->first();
    expect($program)->not->toBeNull();
    expect($program->name)->toBe([
        'id' => 'Nama Baru',
        'ar' => 'اسم جديد',
        'en' => 'New Name',
    ]);
    expect($program->description)->toBe([
        'id' => 'Deskripsi Baru',
        'ar' => 'وصف جديد',
        'en' => 'New Description',
    ]);
    expect($program->details_json)->toBe([
        'id' => ['Detail 1', 'Detail 2'],
        'ar' => ['تفصيل ١', 'تفصيل ٢'],
        'en' => ['Detail 1 En', 'Detail 2 En'],
    ]);

    // Test updates
    $responseUpdate = $this->actingAs($admin)
        ->put(route('admin.programs.update', $program), [
            'name' => [
                'id' => 'Nama Edit',
                'ar' => 'اسم تعديل',
                'en' => 'Edit Name',
            ],
            'description' => [
                'id' => 'Deskripsi Edit',
                'ar' => 'وصف تعديل',
                'en' => 'Edit Description',
            ],
            'details_json' => [
                'id' => 'Detail Edit',
                'ar' => 'تفصيل تعديل',
                'en' => 'Detail Edit En',
            ],
            'type' => 'both',
            'prices_json' => $pricesPayload,
        ]);

    $responseUpdate->assertRedirect();
    $program->refresh();

    expect($program->name)->toBe([
        'id' => 'Nama Edit',
        'ar' => 'اسم تعديل',
        'en' => 'Edit Name',
    ]);
});

test('admin can store and update teacher with bio translations', function () {
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin-teacher-local-test@example.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
    ]);

    $response = $this->actingAs($admin)
        ->post(route('admin.teachers.store'), [
            'name' => 'Moroccan Teacher',
            'email' => 'moroccan.teacher@example.com',
            'password' => 'password123',
            'whatsapp_number' => '+212612345678',
            'bio' => [
                'id' => 'Bio Indonesia',
                'ar' => 'سيرة عربية',
                'en' => 'Bio English',
            ],
            'specializations_json' => 'Tajweed, Talqin',
        ]);

    $response->assertRedirect();

    $teacher = User::where('email', 'moroccan.teacher@example.com')->first();
    expect($teacher->role)->toBe('teacher');
    expect($teacher->teacherProfile->bio)->toBe([
        'id' => 'Bio Indonesia',
        'ar' => 'سيرة عربية',
        'en' => 'Bio English',
    ]);

    // Test update
    $responseUpdate = $this->actingAs($admin)
        ->put(route('admin.teachers.update', $teacher), [
            'name' => 'Updated Teacher Name',
            'email' => 'moroccan.teacher@example.com',
            'whatsapp_number' => '+212687654321',
            'bio' => [
                'id' => 'Bio Indonesia Edit',
                'ar' => 'سيرة عربية تعديل',
                'en' => 'Bio English Edit',
            ],
            'specializations_json' => 'Tajweed',
        ]);

    $responseUpdate->assertRedirect();
    $teacher->refresh();
    expect($teacher->name)->toBe('Updated Teacher Name');
    expect($teacher->teacherProfile->bio)->toBe([
        'id' => 'Bio Indonesia Edit',
        'ar' => 'سيرة عربية تعديل',
        'en' => 'Bio English Edit',
    ]);
});
