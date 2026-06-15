<?php

namespace App\Console\Commands;

use App\Models\Booking;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('bookings:cancel-missed')]
#[Description('Automatically cancel missed bookings where the slot end time has passed')]
class CancelMissedBookings extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $count = Booking::cancelMissed();

        $this->info("Alhamdulillah! {$count} missed bookings have been successfully cancelled.");

        return Command::SUCCESS;
    }
}
