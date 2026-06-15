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
        $talqin = Program::where('name->en', 'Talqin Program')->first();
        $talqinData = [
            'name' => [
                'id' => 'Program Talqin',
                'ar' => 'برنامج التلقين',
                'en' => 'Talqin Program',
            ],
            'description' => [
                'id' => 'Mendengarkan dan mengulang bacaan Al-Quran. Dirancang untuk pemula dan anak-anak untuk membantu memperbaiki pelafalan, melatih kelancaran, dan membaca surah pendek & doa harian.',
                'ar' => 'الاستماع وتكرار قراءة القرآن الكريم. مصمم للمبتدئين والأطفال للمساعدة في تصحيح النطق والطلاقة وحفظ السور القصيرة والأدعية اليومية.',
                'en' => 'Listening and repeating Al-Quran readings. Designed for beginners and children to help correct pronunciation, master fluency, and read short surahs & daily prayers.',
            ],
            'details_json' => [
                'id' => [
                    'Dengarkan dan ulangi bacaan Al-Quran',
                    'Sangat cocok untuk pemula dan anak-anak',
                    'Memperbaiki pelafalan dan melatih kelancaran',
                    'Mencakup surah pendek dan doa harian',
                ],
                'ar' => [
                    'الاستماع وتكرار تلاوة القرآن الكريم',
                    'مثالي للمبتدئين والأطفال',
                    'تصحيح النطق وتدريب الطلاقة',
                    'يغطي السور القصيرة والأدعية اليومية',
                ],
                'en' => [
                    'Listen and repeat Al-Quran recitation',
                    'Ideal for beginners and children',
                    'Corrects pronunciation and masters fluency',
                    'Covers short surahs and daily prayers',
                ],
            ],
            'type' => 'both',
            'prices_json' => [
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
            ],
        ];

        if ($talqin) {
            $talqin->update($talqinData);
        } else {
            $talqin = Program::create($talqinData);
        }

        $tahseen = Program::where('name->en', 'Tahseen Program')
            ->orWhere('name->en', 'Tahseen Private')
            ->first();
        $tahseenData = [
            'name' => [
                'id' => 'Tahsin Privat',
                'ar' => 'برنامج التحسين الخاص',
                'en' => 'Tahseen Private',
            ],
            'description' => [
                'id' => 'Memperbaiki bacaan Al-Quran, fokus pada makhraj and artikulasi yang tepat. Tingkatkan kelancaran dan kepercayaan diri membaca melalui koreksi aktif oleh guru.',
                'ar' => 'تحسين قراءة القرآن الكريم، مع التركيز على المخارج ومواضع الحروف بدقة. تعزيز الطلاقة والثقة بالقراءة من خلال التصحيح المستمر من المعلم.',
                'en' => 'Improving Al-Quran reading, focusing on makhraj and precise articulation. Enhance fluency and reading confidence through active correction by the teacher.',
            ],
            'details_json' => [
                'id' => [
                    '8 pertemuan/bulan',
                    '60 menit per pertemuan',
                    'Bahasa Indonesia & Arab',
                    'Evaluasi berkala',
                ],
                'ar' => [
                    '٨ حصص شهرياً',
                    '٦٠ دقيقة لكل حصة',
                    'باللغة الإندونيسية والعربية',
                    'تقييم دوري مستمر',
                ],
                'en' => [
                    '8 sessions/month',
                    '60 minutes per session',
                    'Indonesian & Arabic medium',
                    'Periodic evaluations',
                ],
            ],
            'type' => 'both',
            'prices_json' => [
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
            ],
        ];

        if ($tahseen) {
            $tahseen->update($tahseenData);
        } else {
            $tahseen = Program::create($tahseenData);
        }

        $tajweed = Program::where('name->en', 'Tajweed Program')
            ->orWhere('name->en', 'Basic Tajweed Private')
            ->first();
        $tajweedData = [
            'name' => [
                'id' => 'Tajwid Dasar Privat',
                'ar' => 'برنامج التجويد الأساسي الخاص',
                'en' => 'Basic Tajweed Private',
            ],
            'description' => [
                'id' => 'Menguasai aturan tajwid. Pelajari aturan seperti Nun Sakinah, Mad, Qalqalah, Ghunnah, dll., dan terapkan secara dinamis selama membaca Al-Quran dengan benar dan indah.',
                'ar' => 'إتقان قواعد التجويد. دراسة أحكام النون الساكنة والمد والقلقلة والغنة وغيرها، وتطبيقها ديناميكياً أثناء التلاوة بشكل صحيح وجميل.',
                'en' => 'Mastering tajweed rules. Study rules like Nun Sakinah, Madd, Qalqalah, Ghunnah, etc., and apply them dynamically during recitation correctly and beautifully.',
            ],
            'details_json' => [
                'id' => [
                    '8 pertemuan/bulan',
                    'Materi tajwid lengkap',
                    'Praktik bacaan',
                ],
                'ar' => [
                    '٨ حصص شهرياً',
                    'منهج تجويد كامل',
                    'تدريب عملي على التلاوة',
                ],
                'en' => [
                    '8 sessions/month',
                    'Comprehensive tajweed topics',
                    'Practical recitation practice',
                ],
            ],
            'type' => 'both',
            'prices_json' => [
                'private' => [
                    'id' => ['monthly' => 600000, 'program' => 1800000],
                    'my' => ['monthly' => 180, 'program' => 540],
                    'sg' => ['monthly' => 55, 'program' => 165],
                ],
                'group' => [
                    'id' => ['monthly' => 700000, 'program' => 2000000],
                    'my' => ['monthly' => 210, 'program' => 600],
                    'sg' => ['monthly' => 60, 'program' => 180],
                ],
            ],
        ];

        if ($tajweed) {
            $tajweed->update($tajweedData);
        } else {
            $tajweed = Program::create($tajweedData);
        }

        $tuhfatulAthfal = Program::where('name->en', 'Tuhfatul Athfal Program')
            ->orWhere('name->en', 'Tuhfatul Athfal Private')
            ->first();
        $tuhfatulAthfalData = [
            'name' => [
                'id' => 'Tuhfatul Athfal Privat',
                'ar' => 'برنامج تحفة الأطفال الخاص',
                'en' => 'Tuhfatul Athfal Private',
            ],
            'description' => [
                'id' => 'Durasi: 12 minggu. Durasi per pertemuan: 60 menit. Tujuan umum: Peserta mampu menghafal matan Tuhfatul Athfal, memahami makna setiap bait, mengetahui hukum-hukum tajwid yang dijelaskan dalam matan, dan menerapkannya dalam membaca Al-Qur\'an.',
                'ar' => 'المدة: 12 أسبوعاً. مدة اللقاء: 60 دقيقة. الهدف العام: قدرة المشارك على حفظ متن تحفة الأطفال، وفهم معاني أبياته، ومعرفة أحكام التجويد الموضحة فيه، وتطبيقها في قراءة القرآن الكريم.',
                'en' => 'Duration: 12 weeks. Meeting duration: 60 minutes. General objective: Participants are able to memorize the text of Tuhfatul Athfal, understand the meaning of each stanza, know the tajweed rules explained in the text, and apply them in reading the Al-Quran.',
            ],
            'details_json' => [
                'id' => [
                    'Hafalan matan',
                    'Penjelasan bait',
                    'Praktik tajwid',
                    'Sertifikat setelah selesai program',
                ],
                'ar' => [
                    'حفظ متن تحفة الأطفال',
                    'شرح أبيات المنظومة',
                    'تطبيق التجويد العملي',
                    'شهادة عند إتمام البرنامج',
                ],
                'en' => [
                    'Memorize the Matn',
                    'Detailed stanza explanation',
                    'Practical tajweed application',
                    'Certificate upon completion',
                ],
            ],
            'type' => 'both',
            'prices_json' => [
                'private' => [
                    'id' => ['monthly' => 700000, 'program' => 2100000],
                    'my' => ['monthly' => 210, 'program' => 630],
                    'sg' => ['monthly' => 65, 'program' => 195],
                ],
                'group' => [
                    'id' => ['monthly' => 900000, 'program' => 2500000],
                    'my' => ['monthly' => 270, 'program' => 750],
                    'sg' => ['monthly' => 80, 'program' => 225],
                ],
            ],
        ];

        if ($tuhfatulAthfal) {
            $tuhfatulAthfal->update($tuhfatulAthfalData);
        } else {
            $tuhfatulAthfal = Program::create($tuhfatulAthfalData);
        }

        // 2. Seed Admin User
        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'System Admin',
                'password' => bcrypt('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // 3. Seed Teachers
        $teacher1 = User::updateOrCreate(
            ['email' => 'zouhir@example.com'],
            [
                'name' => 'Ustaz Zouhir',
                'password' => bcrypt('password'),
                'role' => 'teacher',
                'avatar' => 'https://ui-avatars.com/api/?name=Ustaz+Zouhir&background=4A3E3D&color=FDFBF7&size=200',
                'email_verified_at' => now(),
            ]
        );

        TeacherProfile::updateOrCreate(
            ['user_id' => $teacher1->id],
            [
                'bio' => [
                    'id' => 'Guru bahasa Arab dan Al-Quran berpengalaman dari Maroko. Spesialisasi dalam Talqin dan perbaikan makhraj untuk pemula, anak-anak, dan orang dewasa. Sangat bersemangat membantu siswa menguasai pelafalan.',
                    'ar' => 'مدرس لغة عربية وقرآن ذو خبرة من المغرب. متفوق في التلقين وتصحيح مخارج الحروف للمبتدئين والأطفال والكبار. لديه شغف بمساعدة الطلاب على إتقان النطق السليم.',
                    'en' => 'Experienced Arabic and Quran teacher from Morocco. Specializes in Talqin and makhraj correction for beginners, children, and adults. Passionate about helping students master pronunciation.',
                ],
                'whatsapp_number' => '+6282251985570',
                'zoom_link' => 'https://zoom.us/j/zouhir-arabic-class',
                'google_meet_link' => 'https://meet.google.com/zou-hir-tea',
                'specializations_json' => ['Talqin', 'Tahseen'],
            ]
        );

        $teacher2 = User::updateOrCreate(
            ['email' => 'yassine@example.com'],
            [
                'name' => 'Ustaz Yassine',
                'password' => bcrypt('password'),
                'role' => 'teacher',
                'avatar' => 'https://ui-avatars.com/api/?name=Ustaz+Yassine&background=4D3E3D&color=FDFBF7&size=200',
                'email_verified_at' => now(),
            ]
        );

        TeacherProfile::updateOrCreate(
            ['user_id' => $teacher2->id],
            [
                'bio' => [
                    'id' => 'Penutur asli bahasa Arab dari Maroko dengan pengalaman mengajar lebih dari 8 tahun. Sangat terspesialisasi dalam aturan Tajwid, fonetik presisi, dan kaidah tata bahasa Arab klasik (Nahwu & Shorof).',
                    'ar' => 'ناطق باللغة العربية كأول لغة من المغرب ولديه خبرة تزيد عن 8 سنوات في التدريس. متخصص في أحكام التجويد، الصوتيات الدقيقة، وقواعد النحو والصرف.',
                    'en' => 'Native Arabic speaker from Morocco with over 8 years of teaching experience. Highly specialized in Tajweed rules, precise phonetics, and classical Arabic grammar rules (Nahwu & Shorof).',
                ],
                'whatsapp_number' => '+6282251985571',
                'zoom_link' => 'https://zoom.us/j/yassine-tajweed-class',
                'google_meet_link' => 'https://meet.google.com/yas-sine-taj',
                'specializations_json' => ['Tajweed', 'Tahseen', 'Quranic Grammar'],
            ]
        );

        // 4. Seed Student User
        $student = User::updateOrCreate(
            ['email' => 'student@example.com'],
            [
                'name' => 'Ahmad Abdullah',
                'password' => bcrypt('password'),
                'role' => 'student',
                'email_verified_at' => now(),
            ]
        );

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
                $slot1 = Slot::updateOrCreate(
                    [
                        'teacher_id' => $teacher1->id,
                        'start_time' => $slotStart->toDateTimeString(),
                    ],
                    [
                        'end_time' => $slotEnd->toDateTimeString(),
                    ]
                );

                // Teacher 2 slots
                $slot2 = Slot::updateOrCreate(
                    [
                        'teacher_id' => $teacher2->id,
                        'start_time' => $slotStart->toDateTimeString(),
                    ],
                    [
                        'end_time' => $slotEnd->toDateTimeString(),
                    ]
                );

                // Let's pre-book one of the slots to student to have active dashboards
                if ($i === 1 && $hour === 10) {
                    $slot1->update(['is_booked' => true]);
                    Booking::updateOrCreate(
                        [
                            'slot_id' => $slot1->id,
                        ],
                        [
                            'student_id' => $student->id,
                            'program_id' => $talqin->id,
                            'status' => 'confirmed',
                            'video_platform' => 'google_meet',
                            'video_url' => 'https://meet.google.com/mar-ouan-tea',
                            'student_notes' => 'I would like to focus on articulation of letter Raa and recitation of Surah An-Naba.',
                        ]
                    );
                }

                if ($i === 2 && $hour === 15) {
                    $slot2->update(['is_booked' => true]);
                    Booking::updateOrCreate(
                        [
                            'slot_id' => $slot2->id,
                        ],
                        [
                            'student_id' => $student->id,
                            'program_id' => $tajweed->id,
                            'status' => 'pending',
                            'video_platform' => 'zoom',
                            'video_url' => 'https://zoom.us/j/yassine-tajweed-class',
                            'student_notes' => 'Looking forward to learning about Nun Sakinah rules!',
                        ]
                    );
                }
            }
        }
    }
}
