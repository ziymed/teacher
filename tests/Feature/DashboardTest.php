<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users are redirected to their specialized dashboard portal', function () {
    $user = User::factory()->create(['role' => 'student']);
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('student.dashboard'));
});

test('authenticated users can update their dashboard layout preferences', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $layoutData = [
        'left' => ['classroom_activity', 'teachers_registry'],
        'right' => ['programs_overview'],
    ];

    $response = $this->post(route('dashboard.layout.update'), [
        'dashboard_layout' => $layoutData,
    ]);

    $response->assertRedirect();
    $this->assertEquals($layoutData, $user->fresh()->dashboard_layout);
});

test('admin can view the admin dashboard index', function () {
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin-dashboard-test@example.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
    ]);

    $response = $this->actingAs($admin)->get(route('admin.dashboard'));
    $response->assertOk();
});
