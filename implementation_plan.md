# Goal Description

Create a premium, responsive Al-Quran & Arabic Learning Platform based on the Moroccan-inspired "Program Talqin, Tahseen Dan Tajweed Al-Quran" flyer design. The platform connects students with Moroccan native Arabic teachers for private 1-to-1 sessions, manages scheduling/bookings, dynamically integrates Google Meet and Zoom links, provides distinct dashboards (Admin, Teacher, Student), and implements a digital certificate issuance/verification system.

---

## User Review Required

> [!IMPORTANT]
> **Database Fresh Migrate & Seed**: Since this is a new setup, we propose running `php artisan migrate:fresh --seed` to configure all new tables (Programs, Teacher Profiles, Slots, Bookings, Certificates) alongside a modified `users` table supporting roles (`admin`, `teacher`, `student`). If you have existing users in the local database that cannot be lost, please let us know so we can write differential migrations instead.

> [!TIP]
> **High-End Moroccan Visual Palette**: We will introduce a premium custom theme inside Tailwind v4 (`resources/css/app.css`) containing:
> - **Beige Sand Backgrounds** (`#FDFBF7` / `#F4EBE1`)
> - **Deep Coffee/Bronze Typography & Borders** (`#4A3E3D`)
> - **Brilliant Gold/Amber Accents** (`#D4AF37`)
> - **Soft Sand Cards and Arches** resembling the visual motifs of the flyer.

---

## Open Questions

None at this time. All requirements are clearly mapped. We are ready to begin implementation immediately upon your approval.

---

## Proposed Changes

### 1. Database Schema & Migration Layer
We will modify the default users table to add role-based support and define the schema for scheduling, bookings, and certificates.

#### [MODIFY] [0001_01_01_000000_create_users_table.php](file:///c:/Users/lahce/Herd/arabic/database/migrations/0001_01_01_000000_create_users_table.php)
- Add `role` column (`student`, `teacher`, `admin`, default `student`).
- Add `avatar` column (nullable string) for teacher profile images.

#### [NEW] [2026_05_30_000002_create_programs_table.php](file:///c:/Users/lahce/Herd/arabic/database/migrations/2026_05_30_000002_create_programs_table.php)
- Create `programs` table (`id`, `name`, `description`, `details_json`, `timestamps`).

#### [NEW] [2026_05_30_000003_create_teacher_profiles_table.php](file:///c:/Users/lahce/Herd/arabic/database/migrations/2026_05_30_000003_create_teacher_profiles_table.php)
- Create `teacher_profiles` table (`id`, `user_id` [foreign key], `bio`, `whatsapp_number`, `zoom_link`, `google_meet_link`, `specializations_json`, `timestamps`).

#### [NEW] [2026_05_30_000004_create_slots_table.php](file:///c:/Users/lahce/Herd/arabic/database/migrations/2026_05_30_000004_create_slots_table.php)
- Create `slots` table (`id`, `teacher_id` [foreign key], `start_time` [datetime], `end_time` [datetime], `is_booked` [boolean, default false], `timestamps`).
- Add database indexes on `teacher_id`, `start_time`, and `is_booked` to ensure fast search.

#### [NEW] [2026_05_30_000005_create_bookings_table.php](file:///c:/Users/lahce/Herd/arabic/database/migrations/2026_05_30_000005_create_bookings_table.php)
- Create `bookings` table (`id`, `student_id` [foreign key], `slot_id` [foreign key], `program_id` [foreign key], `status` [enum: pending, confirmed, completed, cancelled], `video_platform` [enum: google_meet, zoom], `video_url` [string, nullable], `teacher_feedback` [text, nullable], `student_notes` [text, nullable], `timestamps`).

#### [NEW] [2026_05_30_000006_create_certificates_table.php](file:///c:/Users/lahce/Herd/arabic/database/migrations/2026_05_30_000006_create_certificates_table.php)
- Create `certificates` table (`id`, `student_id` [foreign key], `program_id` [foreign key], `verification_hash` [string, unique], `issued_at` [timestamp], `notes` [text, nullable], `timestamps`).

---

### 2. Models & Business Logic

#### [MODIFY] [User.php](file:///c:/Users/lahce/Herd/arabic/app/Models/User.php)
- Update `$fillable` fields.
- Add helper methods: `isAdmin()`, `isTeacher()`, `isStudent()`.
- Define Eloquent relations: `teacherProfile()`, `slots()`, `studentBookings()`, `teacherBookings()`, `certificates()`.

#### [NEW] [Program.php](file:///c:/Users/lahce/Herd/arabic/app/Models/Program.php)
- Define `Program` model with relations to bookings and certificates.

#### [NEW] [TeacherProfile.php](file:///c:/Users/lahce/Herd/arabic/app/Models/TeacherProfile.php)
- Define `TeacherProfile` model mapping user relation, links, and parsed json specializations.

#### [NEW] [Slot.php](file:///c:/Users/lahce/Herd/arabic/app/Models/Slot.php)
- Define `Slot` model, scope query helpers for available/booked slots, and validation checks.

#### [NEW] [Booking.php](file:///c:/Users/lahce/Herd/arabic/app/Models/Booking.php)
- Define `Booking` model, hook event listeners (to automatically toggle slot's `is_booked` flag).

#### [NEW] [Certificate.php](file:///c:/Users/lahce/Herd/arabic/app/Models/Certificate.php)
- Define `Certificate` model with a unique verification hash generator upon creation.

---

### 3. Database Seeders

#### [MODIFY] [DatabaseSeeder.php](file:///c:/Users/lahce/Herd/arabic/database/seeders/DatabaseSeeder.php)
- Seed 3 main Quranic Programs: **Talqin**, **Tahseen**, **Tajweed** (with details copied exactly from the flyer!).
- Seed 1 Admin User (`admin@example.com` / `password`).
- Seed 2 Native Moroccan Teachers (`marouane@example.com`, `yassine@example.com` / `password`) with complete bios, whatsapp numbers, and zoom links.
- Seed 1 Student User (`student@example.com` / `password`).
- Seed multiple open and pre-booked teaching slots across Saturday, Sunday, and weekdays for rich out-of-the-box dashboards.

---

### 4. Controller & Routing Layer

#### [MODIFY] [web.php](file:///c:/Users/lahce/Herd/arabic/routes/web.php)
- Set up routes for booking, student/teacher/admin dashboards, and certificate verification.
- Enforce standard Laravel role-based access control.

#### [NEW] [BookingController.php](file:///c:/Users/lahce/Herd/arabic/app/Http/Controllers/BookingController.php)
- Manage slot bookings. Protect slot selection using atomic database transactions to ensure **two students cannot book the same slot at the exact same moment**.

#### [NEW] [StudentDashboardController.php](file:///c:/Users/lahce/Herd/arabic/app/Http/Controllers/StudentDashboardController.php)
- Deliver Inertia view for students: list upcoming classes, past sessions with feedback, dynamic calendar, and issued certificates.

#### [NEW] [TeacherDashboardController.php](file:///c:/Users/lahce/Herd/arabic/app/Http/Controllers/TeacherDashboardController.php)
- Deliver Inertia view for teachers: manage slots (open/close hours), schedule grids, logged student files, and progress/feedback reporting.

#### [NEW] [AdminDashboardController.php](file:///c:/Users/lahce/Herd/arabic/app/Http/Controllers/AdminDashboardController.php)
- Deliver Inertia view for admins: summary analytics, user status, certificate audits.

#### [NEW] [CertificateController.php](file:///c:/Users/lahce/Herd/arabic/app/Http/Controllers/CertificateController.php)
- Deliver public verification and premium verification rendering.

---

### 5. Styles & Client Interface System

#### [MODIFY] [app.css](file:///c:/Users/lahce/Herd/arabic/resources/css/app.css)
- Customize TailwindCSS v4 with theme tokens for the Moroccan visual identity:
```css
@theme {
    --color-arabic-sand: #fdfbf7;
    --color-arabic-cream: #f4ebe1;
    --color-arabic-bronze: #4a3e3d;
    --color-arabic-gold: #d4af37;
    --color-arabic-gold-light: #fdf6e9;
    --color-arabic-emerald: #10b981;
}
```

#### [MODIFY] [welcome.tsx](file:///c:/Users/lahce/Herd/arabic/resources/js/pages/welcome.tsx)
- Redesign the landing page completely into a luxurious Moroccan portal with lantern elements, arched cards for the programs (Talqin, Tahseen, Tajweed), call to actions, and an integrated real-time interactive class scheduling calendar.

#### [MODIFY] [app-sidebar.tsx](file:///c:/Users/lahce/Herd/arabic/resources/js/components/app-sidebar.tsx)
- Dynamically filter and render sidebar menu structures (`NavMain`) based on the logged-in user's role.

#### [NEW] [student/dashboard.tsx](file:///c:/Users/lahce/Herd/arabic/resources/js/pages/student/dashboard.tsx)
- Sleek workspace displaying upcoming 1-to-1 lessons, instant Google Meet/Zoom integration, teacher coordinates, certificate drawer, and previous notes.

#### [NEW] [teacher/dashboard.tsx](file:///c:/Users/lahce/Herd/arabic/resources/js/pages/teacher/dashboard.tsx)
- Workspace featuring calendar schedule builder, list of booked students, dynamic feedback logger, and certificate award triggers.

#### [NEW] [admin/dashboard.tsx](file:///c:/Users/lahce/Herd/arabic/resources/js/pages/admin/dashboard.tsx)
- Dashboard displaying platform statistics (active students, hours booked, certificate volume) and manager lists.

#### [NEW] [certificate/verify.tsx](file:///c:/Users/lahce/Herd/arabic/resources/js/pages/certificate/verify.tsx)
- Verification page for public validation of certificate hashes.

---

## Verification Plan

### Automated Tests
We will build a comprehensive suite of feature tests using **Pest v4**:
- `tests/Feature/BookingTest.php`: Asserts successful booking, locks slots properly, and validates that two students cannot book the same slot at the exact same moment.
- `tests/Feature/RoleSecurityTest.php`: Asserts that roles (student, teacher, admin) are protected and redirect unauthorized requests.
- `tests/Feature/CertificateTest.php`: Asserts that certificates are issued correctly and public verification endpoints validate hashes properly.

Commands to execute:
```bash
php artisan test --compact
```

### Manual Verification
- Launch the development server.
- Log in as `student@example.com` to book trial or package slots with Zoom or Google Meet.
- Log in as `teacher1@example.com` to manage hours and log session feedback.
- Log in as `admin@example.com` to review platform metrics.
