<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    /**
     * Show the subscription plans and pricing page.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('subscription/pricing', [
            'userPlan' => $user->subscription_plan ?? 'free',
            'subscriptionStatus' => $user->subscription_status ?? 'inactive',
            'subscriptionEndsAt' => $user->subscription_ends_at ? $user->subscription_ends_at->toDateString() : null,
        ]);
    }

    /**
     * Handle incoming mock credit card checkout payment and activate subscription.
     */
    public function subscribe(Request $request): RedirectResponse
    {
        $request->validate([
            'plan' => ['required', 'string', 'in:pro,premium'],
            'card_number' => ['required', 'string', 'min:16'],
            'card_name' => ['required', 'string', 'min:3'],
        ]);

        $user = $request->user();
        
        // Update user columns (Simulating mock secure checkout success)
        $user->update([
            'subscription_plan' => $request->plan,
            'subscription_status' => 'active',
            'subscription_ends_at' => now()->addMonth(),
        ]);

        return redirect()->route('student.dashboard')->with('success', 'Alhamdulillah! Your billing plan has been successfully upgraded!');
    }

    /**
     * Revert active plan back to Free tier.
     */
    public function cancel(Request $request): RedirectResponse
    {
        $user = $request->user();

        $user->update([
            'subscription_plan' => 'free',
            'subscription_status' => 'inactive',
            'subscription_ends_at' => null,
        ]);

        return redirect()->route('student.dashboard')->with('success', 'Your subscription has been successfully canceled.');
    }
}
