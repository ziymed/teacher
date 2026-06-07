<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Program;
use App\Models\Slot;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Core Programs
        $talqin = Program::create([
            'name' => 'Talqin Program',
            'description' => 'Listening and repeating Al-Quran readings. Designed for beginners and children to help correct pronunciation, master fluency, and read short surahs & daily prayers.',
            'details_json' => [
                'Listen and repeat Al-Quran recitation',
                'Ideal for beginners and children',
                'Corrects pronunciation and masters fluency',
                'Covers short surahs and daily prayers',
            ],
        ]);

        $tahseen = Program::create([
            'name' => 'Tahseen Program',
            'description' => 'Improving Al-Quran reading, focusing on makhraj and precise articulation. Enhance fluency and reading confidence through active correction by the teacher.',
            'details_json' => [
                'Improve Al-Quran recitation accuracy',
                'Focus on makhraj & precise articulation',
                'Enhance fluency and reading confidence',
                'Direct teacher guidance and correction',
            ],
        ]);

        $tajweed = Program::create([
            'name' => 'Tajweed Program',
            'description' => 'Mastering tajweed rules. Study rules like Nun Sakinah, Madd, Qalqalah, Ghunnah, etc., and apply them dynamically during recitation correctly and beautifully.',
            'details_json' => [
                'Learn standard Tajweed articulation rules',
                'Covers Nun Sakinah, Madd, Qalqalah, Ghunnah',
                'Apply Tajweed dynamically during recitation',
                'Read correctly and beautifully according to rules',
            ],
        ]);

        $tuhfatulAthfal = Program::create([
            'name' => 'Tuhfatul Athfal Program',
            'description' => 'Durasi: 12 minggu. Durasi per pertemuan: 60 menit. Tujuan umum: Peserta mampu menghafal matan Tuhfatul Athfal, memahami makna setiap bait, mengetahui hukum-hukum tajwid yang dijelaskan dalam matan, dan menerapkannya dalam membaca Al-Qur\'an.',
            'details_json' => [
                'Menghafal matan Tuhfatul Athfal',
                'Memahami makna setiap bait',
                'Mengetahui hukum-hukum tajwid yang dijelaskan dalam matan',
                'Menerapkan hukum tajwid dalam membaca Al-Qur\'an',
            ],
        ]);

        // 2. Seed Admin User
        User::create([
            'name' => 'System Admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        // 3. Seed Teachers
        $teacher1 = User::create([
            'name' => 'Ustaz Zouhir',
            'email' => 'zouhir@example.com',
            'password' => bcrypt('password'),
            'role' => 'teacher',
            'avatar' => 'https://ui-avatars.com/api/?name=Ustaz+Zouhir&background=4A3E3D&color=FDFBF7&size=200',
            'email_verified_at' => now(),
        ]);

        TeacherProfile::create([
            'user_id' => $teacher1->id,
            'bio' => 'Experienced Arabic and Quran teacher from Morocco. Specializes in Talqin and makhraj correction for beginners, children, and adults. Passionate about helping students master pronunciation.',
            'whatsapp_number' => '+6282251985570',
            'zoom_link' => 'https://zoom.us/j/zouhir-arabic-class',
            'google_meet_link' => 'https://meet.google.com/zou-hir-tea',
            'specializations_json' => ['Talqin', 'Tahseen'],
        ]);

        $teacher2 = User::create([
            'name' => 'Ustaz Yassine',
            'email' => 'yassine@example.com',
            'password' => bcrypt('password'),
            'role' => 'teacher',
            'avatar' => 'https://ui-avatars.com/api/?name=Ustaz+Yassine&background=4D3E3D&color=FDFBF7&size=200',
            'email_verified_at' => now(),
        ]);

        TeacherProfile::create([
            'user_id' => $teacher2->id,
            'bio' => 'Native Arabic speaker from Morocco with over 8 years of teaching experience. Highly specialized in Tajweed rules, precise phonetics, and classical Arabic grammar rules (Nahwu & Shorof).',
            'whatsapp_number' => '+6282251985571',
            'zoom_link' => 'https://zoom.us/j/yassine-tajweed-class',
            'google_meet_link' => 'https://meet.google.com/yas-sine-taj',
            'specializations_json' => ['Tajweed', 'Tahseen', 'Quranic Grammar'],
        ]);

        // 4. Seed Student User
        $student = User::create([
            'name' => 'Ahmad Abdullah',
            'email' => 'student@example.com',
            'password' => bcrypt('password'),
            'role' => 'student',
            'email_verified_at' => now(),
        ]);

        // 5. Seed Dynamic Slots for Teacher 1 and 2
        // We will seed slots for the next 7 days, including Saturday and Sunday
        $startDay = Carbon::today();

        for ($i = 0; $i < 7; $i++) {
            $day = $startDay->copy()->addDays($i);

            // Teachers teach between 9:00 AM and 5:00 PM
            // Generate some hourly slots
            $hours = [9, 10, 11, 14, 15, 16];

            foreach ($hours as $hour) {
                $slotStart = $day->copy()->setHour($hour)->setMinute(0)->setSecond(0);
                $slotEnd = $slotStart->copy()->addHour();

                // Teacher 1 slots
                $slot1 = Slot::create([
                    'teacher_id' => $teacher1->id,
                    'start_time' => $slotStart,
                    'end_time' => $slotEnd,
                    'is_booked' => false,
                ]);

                // Teacher 2 slots
                $slot2 = Slot::create([
                    'teacher_id' => $teacher2->id,
                    'start_time' => $slotStart,
                    'end_time' => $slotEnd,
                    'is_booked' => false,
                ]);

                // Let's pre-book one of the slots to student to have active dashboards
                if ($i === 1 && $hour === 10) {
                    $slot1->update(['is_booked' => true]);
                    Booking::create([
                        'student_id' => $student->id,
                        'slot_id' => $slot1->id,
                        'program_id' => $talqin->id,
                        'status' => 'confirmed',
                        'video_platform' => 'google_meet',
                        'video_url' => 'https://meet.google.com/mar-ouan-tea',
                        'student_notes' => 'I would like to focus on articulation of letter Raa and recitation of Surah An-Naba.',
                    ]);
                }

                if ($i === 2 && $hour === 15) {
                    $slot2->update(['is_booked' => true]);
                    Booking::create([
                        'student_id' => $student->id,
                        'slot_id' => $slot2->id,
                        'program_id' => $tajweed->id,
                        'status' => 'pending',
                        'video_platform' => 'zoom',
                        'video_url' => 'https://zoom.us/j/yassine-tajweed-class',
                        'student_notes' => 'Looking forward to learning about Nun Sakinah rules!',
                    ]);
                }
            }
        }
    }
}
