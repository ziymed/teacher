<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;

uses(RefreshDatabase::class);

test('guest can redirect to social provider', function () {
    $response = $this->get(route('auth.social.redirect', ['provider' => 'google']));
    $response->assertStatus(302);
});

test('social callback registers new user as student and logs them in', function () {
    $abstractUser = Mockery::mock('Laravel\Socialite\Two\User');
    $abstractUser->shouldReceive('getId')->andReturn('google-id-123');
    $abstractUser->shouldReceive('getName')->andReturn('Google Student');
    $abstractUser->shouldReceive('getNickname')->andReturn('gstudent');
    $abstractUser->shouldReceive('getEmail')->andReturn('googlestudent@example.com');
    $abstractUser->shouldReceive('getAvatar')->andReturn('https://avatar.google.com/test');

    $provider = Mockery::mock('Laravel\Socialite\Contracts\Provider');
    $provider->shouldReceive('user')->andReturn($abstractUser);

    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $response = $this->get(route('auth.social.callback', ['provider' => 'google']));

    $response->assertRedirect(route('dashboard'));

    $this->assertDatabaseHas('users', [
        'name' => 'Google Student',
        'email' => 'googlestudent@example.com',
        'role' => 'student',
        'provider' => 'google',
        'provider_id' => 'google-id-123',
    ]);

    $this->assertAuthenticated();
});

test('social callback links existing email user to social provider', function () {
    $existingUser = User::create([
        'name' => 'Existing Ahmad',
        'email' => 'ahmad@example.com',
        'password' => bcrypt('password'),
        'role' => 'student',
    ]);

    $abstractUser = Mockery::mock('Laravel\Socialite\Two\User');
    $abstractUser->shouldReceive('getId')->andReturn('facebook-id-456');
    $abstractUser->shouldReceive('getName')->andReturn('Existing Ahmad');
    $abstractUser->shouldReceive('getNickname')->andReturn(null);
    $abstractUser->shouldReceive('getEmail')->andReturn('ahmad@example.com');
    $abstractUser->shouldReceive('getAvatar')->andReturn('https://avatar.facebook.com/test');

    $provider = Mockery::mock('Laravel\Socialite\Contracts\Provider');
    $provider->shouldReceive('user')->andReturn($abstractUser);

    Socialite::shouldReceive('driver')->with('facebook')->andReturn($provider);

    $response = $this->get(route('auth.social.callback', ['provider' => 'facebook']));

    $response->assertRedirect(route('dashboard'));

    $existingUser->refresh();
    expect($existingUser->provider)->toBe('facebook');
    expect($existingUser->provider_id)->toBe('facebook-id-456');

    $this->assertAuthenticated();
});
