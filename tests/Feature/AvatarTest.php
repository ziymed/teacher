<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
});

test('authenticated users can upload an avatar', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $file = UploadedFile::fake()->image('avatar.jpg');

    $response = $this->post(route('profile.avatar.update'), [
        'avatar' => $file,
    ]);

    $response->assertRedirect(route('profile.edit'));

    $user->refresh();
    $this->assertNotNull($user->avatar);

    $path = str_replace('/storage/', '', $user->avatar);
    Storage::disk('public')->assertExists($path);
});

test('invalid files are rejected by validation', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $file = UploadedFile::fake()->create('document.pdf', 500);

    $response = $this->post(route('profile.avatar.update'), [
        'avatar' => $file,
    ]);

    $response->assertSessionHasErrors('avatar');
    $this->assertNull($user->fresh()->avatar);

    $largeFile = UploadedFile::fake()->image('large.jpg')->size(3000);

    $response = $this->post(route('profile.avatar.update'), [
        'avatar' => $largeFile,
    ]);

    $response->assertSessionHasErrors('avatar');
    $this->assertNull($user->fresh()->avatar);
});

test('old avatars are deleted upon new uploads', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $file1 = UploadedFile::fake()->image('avatar1.jpg');
    $this->post(route('profile.avatar.update'), ['avatar' => $file1]);

    $user->refresh();
    $firstPath = str_replace('/storage/', '', $user->avatar);
    Storage::disk('public')->assertExists($firstPath);

    $file2 = UploadedFile::fake()->image('avatar2.jpg');
    $this->post(route('profile.avatar.update'), ['avatar' => $file2]);

    $user->refresh();
    $secondPath = str_replace('/storage/', '', $user->avatar);
    Storage::disk('public')->assertExists($secondPath);

    Storage::disk('public')->assertMissing($firstPath);
});

test('users can remove their avatars', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $file = UploadedFile::fake()->image('avatar.jpg');
    $this->post(route('profile.avatar.update'), ['avatar' => $file]);

    $user->refresh();
    $path = str_replace('/storage/', '', $user->avatar);
    Storage::disk('public')->assertExists($path);

    $response = $this->delete(route('profile.avatar.destroy'));
    $response->assertRedirect(route('profile.edit'));

    $user->refresh();
    $this->assertNull($user->avatar);
    Storage::disk('public')->assertMissing($path);
});
