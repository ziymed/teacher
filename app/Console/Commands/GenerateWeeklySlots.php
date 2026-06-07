<?php

namespace App\Console\Commands;

use App\Models\Slot;
use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

#[Signature('slots:generate-weekly {--weeks=1 : Number of weeks in advance to generate}')]
#[Description('Automatically generate teaching slots for all teachers for the upcoming week(s).')]
class GenerateWeeklySlots extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $weeks = (int) $this->option('weeks');
        if ($weeks < 1) {
            $weeks = 1;
        }

        $teachers = User::where('role', 'teacher')->get();
        if ($teachers->isEmpty()) {
            $this->info('No teachers found on the platform.');

            return 0;
        }

        $this->info("Starting weekly slots generation for {$teachers->count()} teachers, for {$weeks} week(s) in advance...");

        $createdCount = 0;

        for ($w = 1; $w <= $weeks; $w++) {
            // Find the upcoming Monday
            $startOfWeek = Carbon::now()->next(Carbon::MONDAY)->startOfDay()->addWeeks($w - 1);

            // Monday to Friday (5 days)
            for ($d = 0; $d < 5; $d++) {
                $currentDay = $startOfWeek->copy()->addDays($d);

                // 8 hours: 8, 9, 10, 11 AM and 2, 3, 4, 5 PM (14, 15, 16, 17)
                $hours = [8, 9, 10, 11, 14, 15, 16, 17];

                foreach ($teachers as $teacher) {
                    foreach ($hours as $hour) {
                        $slotStart = $currentDay->copy()->setTime($hour, 0, 0);
                        $slotEnd = $slotStart->copy()->addHour();

                        // Overlap check
                        $overlap = Slot::where('teacher_id', $teacher->id)
                            ->where(function ($query) use ($slotStart, $slotEnd) {
                                $query->where(function ($q) use ($slotStart, $slotEnd) {
                                    $q->where('start_time', '>=', $slotStart)
                                        ->where('start_time', '<', $slotEnd);
                                })
                                    ->orWhere(function ($q) use ($slotStart, $slotEnd) {
                                        $q->where('end_time', '>', $slotStart)
                                            ->where('end_time', '<=', $slotEnd);
                                    })
                                    ->orWhere(function ($q) use ($slotStart, $slotEnd) {
                                        $q->where('start_time', '<=', $slotStart)
                                            ->where('end_time', '>=', $slotEnd);
                                    });
                            })
                            ->exists();

                        if (! $overlap) {
                            Slot::create([
                                'teacher_id' => $teacher->id,
                                'start_time' => $slotStart,
                                'end_time' => $slotEnd,
                                'is_booked' => false,
                            ]);
                            $createdCount++;
                        }
                    }
                }
            }
        }

        $this->info("Generation complete. Created {$createdCount} new slots successfully.");

        return 0;
    }
}
