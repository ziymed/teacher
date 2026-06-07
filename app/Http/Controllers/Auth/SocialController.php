<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class SocialController extends Controller
{
    /**
     * Redirect the user to the provider's OAuth page.
     */
    public function redirectToProvider(string $provider): RedirectResponse
    {
        if (! in_array($provider, ['google', 'facebook', 'twitter'])) {
            abort(404, 'Provider not supported.');
        }

        return Socialite::driver($provider)->redirect();
    }

    /**
     * Obtain the user information from the provider and log them in.
     */
    public function handleProviderCallback(string $provider): RedirectResponse
    {
        if (! in_array($provider, ['google', 'facebook', 'twitter'])) {
            abort(404, 'Provider not supported.');
        }

        try {
            $socialUser = Socialite::driver($provider)->user();
        } catch (\Exception $e) {
            return redirect()->route('login')->withErrors(['error' => 'Social login failed: '.$e->getMessage()]);
        }

        if (! $socialUser->getEmail()) {
            return redirect()->route('login')->withErrors(['error' => 'Email address is required from your social account.']);
        }

        // Find existing user by provider ID
        $user = User::where('provider', $provider)
            ->where('provider_id', $socialUser->getId())
            ->first();

        if (! $user) {
            // Find user by email
            $user = User::where('email', $socialUser->getEmail())->first();

            if ($user) {
                // Link existing user to provider
                $user->update([
                    'provider' => $provider,
                    'provider_id' => $socialUser->getId(),
                ]);
            } else {
                // Register a new user as student
                $user = User::create([
                    'name' => $socialUser->getName() ?? $socialUser->getNickname() ?? 'Social Student',
                    'email' => $socialUser->getEmail(),
                    'role' => 'student',
                    'avatar' => $socialUser->getAvatar(),
                    'provider' => $provider,
                    'provider_id' => $socialUser->getId(),
                    'email_verified_at' => now(),
                ]);
            }
        }

        Auth::login($user);

        return redirect()->route('dashboard');
    }
}
