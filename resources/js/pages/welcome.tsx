import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import {
    ArrowRight,
    BookOpen,
    Calendar,
    Clock,
    Globe,
    ShieldCheck,
    Check,
    MapPin,
    Sparkles,
    Video,
    UserCheck,
    MessageSquare,
    Phone,
    LayoutGrid,
    Award,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/hooks/use-translation';
import { getTranslation, getTranslationList } from '@/lib/translation-utils';
import { dashboard, login, register } from '@/routes';
import { store as storeBooking } from '@/routes/bookings';

interface Slot {
    id: number;
    teacher_id: number;
    start_time: string;
    end_time: string;
    is_booked: boolean;
    teacher?: {
        name: string;
        avatar?: string;
        teacher_profile?: {
            bio: string;
            whatsapp_number: string;
            zoom_link?: string;
            google_meet_link?: string;
        };
    };
}

interface Program {
    id: number;
    name: string;
    description: string;
    details_json: string[];
}

interface WelcomeProps {
    programs: Program[];
    teachers: any[];
    availableSlots: Slot[];
}

export default function Welcome({
    programs = [],
    teachers = [],
    availableSlots = [],
}: WelcomeProps) {
    const { auth } = usePage<any>().props;
    const user = auth?.user;
    const { t, locale, direction } = useTranslation();

    React.useEffect(() => {
        document.documentElement.dir = direction;
        document.documentElement.lang = locale;
    }, [locale, direction]);

    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
    const [selectedProgramId, setSelectedProgramId] = useState<number | null>(
        null,
    );
    const [notes, setNotes] = useState('');
    const [selectedPlatform, setSelectedPlatform] = useState<
        'google_meet' | 'zoom'
    >('google_meet');

    const bookingForm = useForm({
        slot_id: '',
        program_id: '',
        student_notes: '',
        video_platform: '',
    });

    const getSlotDateString = (dateTimeStr: string) => {
        const dateObj = new Date(dateTimeStr);
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');

        return `${yyyy}-${mm}-${dd}`;
    };

    const availableDates = Array.from(
        new Set(
            availableSlots.map((slot) => getSlotDateString(slot.start_time)),
        ),
    ).sort();

    const getSlotsForDate = (dateStr: string) => {
        return availableSlots.filter(
            (slot) => getSlotDateString(slot.start_time) === dateStr,
        );
    };

    const handleSelectDate = (dateStr: string) => {
        setSelectedDate(dateStr);
        setSelectedSlot(null);
    };

    const handleSelectSlot = (slot: Slot) => {
        setSelectedSlot(slot);
        bookingForm.setData('slot_id', String(slot.id));

        const hasMeet = !!slot.teacher?.teacher_profile?.google_meet_link;
        const hasZoom = !!slot.teacher?.teacher_profile?.zoom_link;

        if (hasZoom && !hasMeet) {
            setSelectedPlatform('zoom');
        } else {
            setSelectedPlatform('google_meet');
        }
    };

    const handleConfirmBooking = (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast.error(
                'Please log in or register a student account to book a private session.',
            );

            return;
        }

        if (!selectedSlot) {
            toast.error('Please choose a time slot.');

            return;
        }

        if (!selectedProgramId) {
            toast.error(
                'Please select one of our Quranic programs (Talqin, Tahseen, Tajweed, or Tuhfatul Athfal).',
            );

            return;
        }

        bookingForm.transform((data) => ({
            ...data,
            slot_id: String(selectedSlot.id),
            program_id: String(selectedProgramId),
            student_notes: notes,
            video_platform: selectedPlatform,
        }));

        bookingForm.post(storeBooking().url, {
            onSuccess: () => {
                setSelectedSlot(null);
                setSelectedDate(null);
                setSelectedProgramId(null);
                setNotes('');
                toast.success(
                    'Alhamdulillah! Your private 1-to-1 session has been booked successfully.',
                );
            },
            onError: (err: any) => {
                toast.error(err.error || 'Failed to submit session booking.');
            },
        });
    };

    return (
        <>
            <Head>
                <title>
                    {t('Program Talqin, Tahseen Dan Tajweed Al-Quran')}
                </title>
                <meta
                    name="description"
                    content="Master Al-Quran recitation with native Moroccan teachers. Custom private 1-to-1 programs in Talqin, Tahseen, and Tajweed."
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Outfit:wght@100..900&family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;700;900&display=swap"
                    rel="stylesheet"
                />
            </Head>

            {/* Flyer Theme Visual Wrapper */}
            <div className="relative min-h-screen overflow-x-hidden bg-arabic-sand font-sans text-arabic-bronze antialiased selection:bg-arabic-gold/30 selection:text-arabic-bronze">
                {/* Elegant translucent Arabic letters in background */}
                <div className="pointer-events-none absolute top-[20%] left-[6%] hidden font-serif-ar text-7xl text-arabic-gold/10 select-none md:text-8xl lg:block">
                    ق
                </div>
                <div className="pointer-events-none absolute top-[40%] right-[8%] hidden font-serif-ar text-8xl text-arabic-bronze/5 select-none md:text-9xl lg:block">
                    ح
                </div>
                <div className="pointer-events-none absolute top-[65%] left-[5%] hidden font-serif-ar text-8xl text-arabic-gold/10 select-none lg:block">
                    ت
                </div>
                <div className="pointer-events-none absolute top-[80%] right-[6%] hidden font-serif-ar text-7xl text-arabic-bronze/10 select-none lg:block">
                    ض
                </div>
                <div className="pointer-events-none absolute top-[15%] right-[25%] hidden font-serif-ar text-[10rem] text-arabic-gold/5 select-none lg:block">
                    ر
                </div>
                <div className="pointer-events-none absolute top-[50%] left-[20%] hidden font-serif-ar text-8xl text-arabic-gold/5 select-none lg:block">
                    ع
                </div>

                {/* 2. Mosque Silhouettes Background Vector */}
                <div
                    className="pointer-events-none absolute right-0 bottom-0 left-0 -z-10 h-96 bg-contain bg-bottom bg-no-repeat opacity-15"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320' fill='%234A3E3D'%3E%3Cpath d='M0,320 L0,220 C60,200 120,200 180,220 C240,240 300,240 360,220 C420,200 480,140 540,160 C600,180 660,260 720,270 C780,280 840,220 900,190 C960,160 1020,160 1080,180 C1140,200 1200,240 1260,220 C1320,200 1380,140 1440,160 L1440,320 Z'/%3E%3C/svg%3E")`,
                    }}
                />

                {/* Header Navigation */}
                <header className="sticky top-0 z-50 mx-auto flex max-w-7xl items-center justify-between rounded-b-[2rem] border-b border-arabic-cream bg-arabic-sand/75 px-6 py-4 shadow-sm backdrop-blur-md">
                    <div className="flex h-12 items-center">
                        <AppLogoIcon className="h-10 w-auto text-arabic-bronze" />
                    </div>

                    <nav className="flex items-center gap-4">
                        <LanguageSwitcher />
                        {user ? (
                            <Link
                                href={dashboard()}
                                className="inline-flex items-center gap-2 rounded-full bg-arabic-bronze px-5 py-2 text-xs font-bold text-arabic-sand shadow-md transition hover:bg-arabic-bronze/90 hover:shadow-lg"
                            >
                                <Globe className="h-3.5 w-3.5 text-arabic-gold" />{' '}
                                {t('Dashboard')}
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="px-3 text-xs font-bold transition hover:text-arabic-gold"
                                >
                                    {t('Log In')}
                                </Link>
                                <Link
                                    href={register()}
                                    className="rounded-full bg-arabic-bronze px-5 py-2 text-xs font-bold text-arabic-sand shadow-md transition hover:bg-arabic-bronze/90"
                                >
                                    {t('Register')}
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                {/* Main Hero Section */}
                <section className="mx-auto max-w-7xl animate-fade-in-up px-6 pt-12 pb-16 lg:py-20">
                    <div className="grid items-center gap-12 lg:grid-cols-12">
                        {/* Left Side: Typography and Call to Action */}
                        <div className="flex flex-col justify-center space-y-8 text-center lg:col-span-7 lg:text-start">
                            <div className="mx-auto inline-flex items-center gap-2 text-xs font-black tracking-[0.2em] text-arabic-gold uppercase lg:mx-0">
                                <span>✦</span>
                                <span>{t("Program Belajar Qur'an")}</span>
                                <span>✦</span>
                            </div>

                            <h1 className="font-serif text-4xl leading-tight font-black tracking-wide text-arabic-bronze sm:text-5xl md:text-6xl">
                                {t(
                                    'Program Talqin, Tahseen Dan Tajweed Al-Quran',
                                )}
                            </h1>

                            {/* Beautiful Arabic Calligraphy Verse Quote */}
                            <div className="mx-auto max-w-xl border-y border-arabic-cream/60 py-2 lg:mx-0">
                                <p className="font-serif-ar text-3xl font-bold text-arabic-gold md:text-4xl">
                                    وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا
                                </p>
                                <p className="mt-1.5 text-[10px] leading-relaxed font-bold font-semibold tracking-widest text-arabic-bronze/60 uppercase">
                                    "{t('Arabic letters verse quote')}" (
                                    {t('QS. Al-Muzzammil: 4')})
                                </p>
                            </div>

                            {/* Morocco Native Teacher Badge */}
                            <div className="mx-auto inline-flex max-w-lg flex-col items-center gap-3 rounded-2xl border border-arabic-cream bg-arabic-cream/65 px-5 py-3 shadow-sm transition duration-300 hover:shadow sm:flex-row lg:mx-0">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-arabic-bronze text-lg shadow-md">
                                    🇲🇦
                                </div>
                                <div className="text-start">
                                    <span className="block text-xs font-black text-arabic-bronze">
                                        {t(
                                            'Belajar Langsung Dengan Penutur Asli',
                                        )}
                                    </span>
                                    <span className="mt-0.5 block text-[10px] font-medium text-arabic-bronze/70">
                                        {t(
                                            'Moroccan Native Teacher description',
                                        )}
                                    </span>
                                </div>
                            </div>

                            {/* Quick Call to Action Buttons */}
                            <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                                <a
                                    href="#booking-calendar"
                                    className="w-full sm:w-auto"
                                >
                                    <Button className="h-11 w-full gap-1.5 rounded-full bg-arabic-bronze px-8 text-xs font-bold text-arabic-sand shadow-md transition hover:bg-arabic-bronze/90 hover:shadow-lg">
                                        <Calendar className="h-4 w-4 text-arabic-gold" />{' '}
                                        {t('Book Private Session')}
                                    </Button>
                                </a>
                                <a
                                    href="#programs"
                                    className="w-full sm:w-auto"
                                >
                                    <Button
                                        variant="outline"
                                        className="h-11 w-full rounded-full border-arabic-bronze/25 px-8 text-xs font-bold text-arabic-bronze hover:bg-arabic-cream"
                                    >
                                        {t('Explore Programs')}
                                    </Button>
                                </a>
                            </div>
                        </div>

                        {/* Right Side: Professional Teacher Portrait in Moroccan Arch Dome Frame */}
                        <div className="relative lg:col-span-5">
                            <div className="relative mx-auto max-w-md lg:max-w-none">
                                {/* Subtle background glow */}
                                <div className="absolute inset-0 -z-10 rounded-full bg-arabic-gold/10 blur-3xl" />

                                {/* Arched Dome Photo Frame matching the Moroccan flyer cards */}
                                <div className="group overflow-hidden rounded-t-[15rem] rounded-b-3xl border-4 border-arabic-cream bg-arabic-cream/30 p-2 shadow-2xl">
                                    <div className="relative aspect-[4/5] overflow-hidden rounded-t-[14.5rem] rounded-b-2xl bg-arabic-sand">
                                        <img
                                            src="/images/zouhir.jpg"
                                            alt="Ustaz Zouhir - Native Moroccan Arabic Teacher"
                                            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.03]"
                                        />

                                        {/* Floating localized Arabic name tag */}
                                        <div className="absolute right-4 bottom-4 left-4 flex items-center justify-between rounded-2xl border border-arabic-gold/30 bg-arabic-bronze/90 p-3 text-arabic-sand shadow-lg backdrop-blur-sm">
                                            <div>
                                                <span className="block font-serif text-sm font-black text-arabic-gold">
                                                    Ustaz Zouhir
                                                </span>
                                                <span className="mt-0.5 block text-[9px] font-bold tracking-widest text-arabic-sand/75 uppercase">
                                                    {t(
                                                        'Native Moroccan Teacher',
                                                    )}
                                                </span>
                                            </div>
                                            <span
                                                className="h-2.5 w-2.5 flex-shrink-0 animate-pulse rounded-full bg-arabic-emerald"
                                                title={t('Online now')}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. Domed Arched Program Cards (EXACT shape and list matching the flyer) */}
                <section id="programs" className="mx-auto max-w-7xl px-6 py-12">
                    <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {programs.map((program) => {
                            // Find matching letter emblem
                            let letter = 'ق';
                            const progName = getTranslation(
                                program.name,
                                'en',
                            ).toLowerCase();

                            if (progName.includes('tahseen')) {
                                letter = 'ح';
                            } else if (progName.includes('tajweed')) {
                                letter = 'ت';
                            } else if (progName.includes('athfal')) {
                                letter = 'ط';
                            }

                            // Find matching duration footer or use dynamic values if present
                            let sessionsText = t('2 Sesi per minggu');
                            let timingText = t('Sabtu & Minggu');
                            let durationText = t('Durasi 1 jam per sesi');

                            if (progName.includes('athfal')) {
                                sessionsText = t('Durasi 12 minggu');
                                timingText = t('60 menit per pertemuan');
                                durationText = t(
                                    'Bimbingan intensif & hafalan',
                                );
                            }

                            const details = getTranslationList(
                                program.details_json,
                                locale,
                            );

                            return (
                                <div
                                    key={program.id}
                                    className="group relative flex flex-col justify-between overflow-hidden rounded-t-[10rem] rounded-b-[2rem] border-2 border-arabic-cream bg-arabic-sand shadow-xl transition duration-300 hover:-translate-y-1 hover:border-arabic-gold/40"
                                >
                                    <div className="absolute top-0 right-0 left-0 h-20 bg-gradient-to-b from-arabic-cream/35 to-transparent" />

                                    <div className="flex flex-grow flex-col items-center space-y-6 p-8 pt-12">
                                        {/* Circular golden emblem with animated Arabic letter */}
                                        <div className="group/emblem relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-arabic-gold/60 bg-arabic-cream shadow-md transition duration-300 group-hover:scale-105">
                                            <div className="absolute inset-0 bg-arabic-gold/5 transition duration-500 group-hover/emblem:scale-110" />
                                            <span
                                                className="z-10 font-serif-ar text-4xl leading-none font-bold text-arabic-gold select-none group-hover:animate-float"
                                                style={{
                                                    animationDuration: '4s',
                                                }}
                                            >
                                                {letter}
                                            </span>
                                        </div>
                                        <div className="space-y-1 text-center">
                                            <h3 className="font-serif text-2xl font-black text-arabic-bronze">
                                                {getTranslation(
                                                    program.name,
                                                    locale,
                                                )}
                                            </h3>
                                            <span className="text-[10px] font-black tracking-widest text-arabic-gold uppercase">
                                                • {t('Programs')} •
                                            </span>
                                        </div>
                                        <ul className="w-full space-y-3.5 ps-2 text-start text-xs font-semibold text-arabic-bronze/85">
                                            {details.map((detail, idx) => (
                                                <li
                                                    key={idx}
                                                    className="flex items-start gap-2.5"
                                                >
                                                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-arabic-gold" />
                                                    <span>{detail}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Flyer-style brown details card footer */}
                                    <div className="flex flex-col gap-2 rounded-t-[1.5rem] border-t-2 border-arabic-gold bg-arabic-bronze p-6 text-arabic-sand">
                                        <div className="flex items-center gap-2 text-[11px] font-bold">
                                            <Calendar className="h-4 w-4 text-arabic-gold" />
                                            <span>{sessionsText}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] font-bold">
                                            <Clock className="h-4 w-4 text-arabic-gold" />
                                            <span>{timingText}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] font-bold">
                                            <Sparkles className="h-4 w-4 text-arabic-gold" />
                                            <span>{durationText}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* 4. Beautiful Bottom flyer-Banner Section */}
                <section className="mx-auto max-w-5xl px-6 py-8">
                    <div className="grid items-center gap-6 rounded-[2.2rem] border-2 border-arabic-cream bg-arabic-cream/65 p-6 text-center shadow-md md:grid-cols-3 md:text-start">
                        {/* Left Column: Online Class */}
                        <div className="flex flex-col items-center gap-3.5 md:flex-row">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-arabic-bronze text-center shadow-sm">
                                <Video className="h-5 w-5 text-arabic-gold" />
                            </div>
                            <div>
                                <span className="block text-[10px] font-bold text-arabic-bronze/60 uppercase">
                                    {t('Pembelajaran Online')}
                                </span>
                                <span className="mt-0.5 block text-xs font-black text-arabic-bronze">
                                    {t('via Zoom atau Google Meet')}
                                </span>
                                <div className="mt-1.5 flex items-center justify-center gap-2 md:justify-start">
                                    <Badge className="flex items-center gap-1 rounded-full bg-[#2D8CFF] py-0.5 text-[8px] font-bold text-white">
                                        <Video className="h-3 w-3" /> Zoom
                                    </Badge>
                                    <Badge className="flex items-center gap-1 rounded-full bg-[#00897B] py-0.5 text-[8px] font-bold text-white">
                                        <Video className="h-3 w-3" /> Google
                                        Meet
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Middle Column: WhatsApp info */}
                        <div className="flex flex-col items-center gap-3.5 border-y border-arabic-cream py-4 md:flex-row md:border-x md:border-y-0 md:px-6 md:py-0">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-center text-2xl text-arabic-sand shadow-sm">
                                <Phone className="h-5 w-5 animate-pulse text-white" />
                            </div>
                            <div>
                                <span className="block text-[10px] font-bold text-arabic-bronze/60 uppercase">
                                    {t('Informasi & Pendaftaran')}
                                </span>
                                <a
                                    href="https://wa.me/6282251985570"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-0.5 block text-xs font-black text-emerald-600 hover:underline dark:text-emerald-500"
                                >
                                    +62 822-5198-5570
                                </a>
                            </div>
                        </div>

                        {/* Right Column: Certificate details */}
                        <div className="flex flex-col items-center gap-3.5 md:flex-row">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-arabic-bronze text-center shadow-sm">
                                <Award className="h-5 w-5 text-arabic-gold" />
                            </div>
                            <div>
                                <span className="block text-[10px] font-bold text-arabic-bronze/60 uppercase">
                                    {t('Sertifikat Resmi')}
                                </span>
                                <span className="mt-0.5 block text-xs font-black text-arabic-bronze">
                                    {t('Diberikan setelah mencapai tujuan pembelajaran')}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Calendar Booking Section */}
                <section
                    id="booking-calendar"
                    className="mx-auto max-w-7xl border-t border-arabic-cream/65 px-6 py-16 md:py-24"
                >
                    <div className="mx-auto mb-12 max-w-2xl space-y-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-xs font-black tracking-widest text-arabic-gold uppercase">
                                    <span>{t('Daftar Sekarang!')}</span>
                        </div>
                        <h2 className="font-serif text-3xl font-black text-arabic-bronze md:text-4xl">
                            {t('Interactive Session Scheduler')}
                        </h2>
                        <p className="text-sm font-medium text-arabic-bronze/70">
                            {t('Check available teaching slots below and book your private 1-to-1 session in real time.')}
                        </p>
                    </div>

                    <div className="mx-auto max-w-4xl overflow-hidden rounded-[2.5rem] border-2 border-arabic-cream bg-arabic-sand shadow-xl">
                        <div className="grid divide-y divide-arabic-cream md:grid-cols-12 md:divide-x md:divide-y-0">
                            {/* Left Side: Instructions and Date Selector */}
                            <div className="space-y-6 p-8 md:col-span-5">
                                <div className="space-y-2">
                                    <span className="block text-[10px] font-bold tracking-widest text-arabic-gold uppercase">
                                        {t('Step 1')}
                                    </span>
                                    <h4 className="font-serif text-lg font-black text-arabic-bronze">
                                        {t('Select Learning Date')}
                                    </h4>
                                    <p className="text-xs leading-relaxed font-medium text-arabic-bronze/70">
                                        {t('Choose one of the highlighted dates from the list to view open hour slots.')}
                                    </p>
                                </div>

                                {availableDates.length > 0 ? (
                                    <div className="max-h-[300px] space-y-2 overflow-y-auto pr-1">
                                        {availableDates.map((dateStr) => {
                                            const slotsCount =
                                                getSlotsForDate(dateStr).length;
                                            const isSelected =
                                                selectedDate === dateStr;

                                            const formattedDate = new Date(
                                                dateStr,
                                            ).toLocaleDateString(locale === 'id' ? 'id-ID' : locale === 'ar' ? 'ar-EG' : 'en-US', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric',
                                            });

                                            return (
                                                <button
                                                    key={dateStr}
                                                    type="button"
                                                    onClick={() =>
                                                        handleSelectDate(
                                                            dateStr,
                                                        )
                                                    }
                                                    className={`flex w-full items-center justify-between rounded-2xl border p-4 text-start text-xs font-bold transition ${
                                                        isSelected
                                                            ? 'scale-[1.01] border-arabic-gold bg-arabic-gold/10 text-arabic-bronze'
                                                            : 'border-arabic-cream bg-arabic-sand text-arabic-bronze hover:border-arabic-gold hover:bg-arabic-cream'
                                                    }`}
                                                >
                                                    <span>{formattedDate}</span>
                                                    <Badge
                                                        variant="secondary"
                                                        className="bg-arabic-bronze text-[10px] text-arabic-sand"
                                                    >
                                                        {slotsCount} slots
                                                    </Badge>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border-2 border-dashed border-arabic-cream p-6 text-center">
                                        <Calendar className="mx-auto mb-2 h-8 w-8 animate-bounce text-arabic-bronze/30" />
                                        <span className="text-xs font-bold text-arabic-bronze/60">
                                            {t('No available time slots. Please check back later.')}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Right Side: Slots & Booking details */}
                            <div className="flex flex-col justify-between bg-arabic-cream/20 p-8 md:col-span-7">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <span className="block text-[10px] font-bold tracking-widest text-arabic-gold uppercase">
                                            {t('Step 2')}
                                        </span>
                                        <h4 className="font-serif text-lg font-black text-arabic-bronze">
                                            {t('Choose Hour & Details') ||
                                                'Choose Hour & Details'}
                                        </h4>
                                    </div>

                                    {selectedDate ? (
                                        <div className="space-y-4">
                                            <span className="block text-[11px] font-bold tracking-wider text-arabic-bronze/60 uppercase">
                                                {t(
                                                    'Available slots on this day',
                                                ) || 'Available slots'}{' '}
                                                {new Date(
                                                    selectedDate,
                                                ).toLocaleDateString(
                                                    locale === 'id'
                                                        ? 'id-ID'
                                                        : locale === 'ar'
                                                          ? 'ar-EG'
                                                          : 'en-US',
                                                    {
                                                        month: 'long',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    },
                                                )}
                                            </span>

                                            <div className="grid max-h-[160px] grid-cols-2 gap-3 overflow-y-auto pr-1">
                                                {getSlotsForDate(
                                                    selectedDate,
                                                ).map((slot) => {
                                                    const isSelected =
                                                        selectedSlot?.id ===
                                                        slot.id;
                                                    const startStr = new Date(
                                                        slot.start_time,
                                                    ).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    });

                                                    return (
                                                        <button
                                                            key={slot.id}
                                                            type="button"
                                                            onClick={() =>
                                                                handleSelectSlot(
                                                                    slot,
                                                                )
                                                            }
                                                            className={`rounded-xl border p-3.5 text-center text-xs font-black transition ${
                                                                isSelected
                                                                    ? 'border-arabic-bronze bg-arabic-bronze text-arabic-sand'
                                                                    : 'border-arabic-cream bg-arabic-sand text-arabic-bronze hover:border-arabic-gold'
                                                            }`}
                                                        >
                                                            {t(':time with :teacher', { time: startStr, teacher: slot.teacher?.name || '' })}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {selectedSlot && (
                                                <div className="animate-in space-y-4 border-t border-arabic-cream pt-4 duration-200 fade-in slide-in-from-top-1">
                                                    {/* Select Program */}
                                                    <div className="space-y-2">
                                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                                            {t(
                                                                'Select Program',
                                                            )}
                                                        </label>
                                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                                            {programs.map(
                                                                (prog) => (
                                                                    <button
                                                                        key={
                                                                            prog.id
                                                                        }
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setSelectedProgramId(
                                                                                prog.id,
                                                                            )
                                                                        }
                                                                        className={`rounded-lg border p-2.5 text-center text-[10px] font-bold transition ${
                                                                            selectedProgramId ===
                                                                            prog.id
                                                                                ? 'border-arabic-gold bg-arabic-gold/10 font-black text-arabic-bronze'
                                                                                : 'border-arabic-cream bg-arabic-sand text-arabic-bronze hover:bg-arabic-cream'
                                                                        }`}
                                                                    >
                                                                        {getTranslation(
                                                                            prog.name,
                                                                            locale,
                                                                        )
                                                                            .replace(
                                                                                ' Program',
                                                                                '',
                                                                            )
                                                                            .replace(
                                                                                'Program ',
                                                                                '',
                                                                            )}
                                                                    </button>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Select Meeting Platform */}
                                                    <div className="animate-in space-y-2 duration-200 fade-in">
                                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                                            {t(
                                                                'Choose Platform',
                                                            )}
                                                        </label>
                                                        <div className="flex gap-3">
                                                            {(!selectedSlot
                                                                .teacher
                                                                ?.teacher_profile
                                                                ?.zoom_link ||
                                                                selectedSlot
                                                                    .teacher
                                                                    ?.teacher_profile
                                                                    ?.google_meet_link) && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setSelectedPlatform(
                                                                            'google_meet',
                                                                        )
                                                                    }
                                                                    className={`flex-1 cursor-pointer rounded-xl border p-2.5 text-center text-xs font-bold transition ${
                                                                        selectedPlatform ===
                                                                        'google_meet'
                                                                            ? 'border-arabic-gold bg-arabic-gold/10 font-black text-arabic-bronze shadow-sm'
                                                                            : 'border-arabic-cream bg-arabic-sand text-arabic-bronze hover:bg-arabic-cream'
                                                                    }`}
                                                                >
                                                                    {t('Google Meet')}
                                                                </button>
                                                            )}
                                                            {(!selectedSlot
                                                                .teacher
                                                                ?.teacher_profile
                                                                ?.google_meet_link ||
                                                                selectedSlot
                                                                    .teacher
                                                                    ?.teacher_profile
                                                                    ?.zoom_link) && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setSelectedPlatform(
                                                                            'zoom',
                                                                        )
                                                                    }
                                                                    className={`flex-1 cursor-pointer rounded-xl border p-2.5 text-center text-xs font-bold transition ${
                                                                        selectedPlatform ===
                                                                        'zoom'
                                                                            ? 'border-arabic-gold bg-arabic-gold/10 font-black text-arabic-bronze shadow-sm'
                                                                            : 'border-arabic-cream bg-arabic-sand text-arabic-bronze hover:bg-arabic-cream'
                                                                    }`}
                                                                >
                                                                    {t('Zoom')}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Student Notes */}
                                                    <div className="space-y-2">
                                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                                            {t(
                                                                'Additional Notes (Optional)',
                                                            )}
                                                        </label>
                                                        <Textarea
                                                            placeholder={t(
                                                                'Share topics, questions, or specific surahs you want to focus on...',
                                                            )}
                                                            value={notes}
                                                            onChange={(e) =>
                                                                setNotes(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="min-h-[70px] rounded-xl border-arabic-cream bg-arabic-sand text-xs placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-3 rounded-2xl border-2 border-dashed border-arabic-cream p-8 text-center">
                                            <Clock className="mx-auto h-8 w-8 animate-pulse text-arabic-bronze/30" />
                                            <p className="text-xs font-bold text-arabic-bronze/60">
                                                {t(
                                                    'Choose one of the highlighted dates from the list to view open hour slots.',
                                                )}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Booking Confirmation Action bar */}
                                {selectedSlot && selectedProgramId && (
                                    <div className="mt-6 animate-in border-t border-arabic-cream pt-6 duration-300 fade-in">
                                        {user ? (
                                            <form
                                                onSubmit={handleConfirmBooking}
                                                className="flex items-center justify-between gap-4"
                                            >
                                                <div className="text-start">
                                                    <span className="block text-[9px] font-bold text-arabic-bronze/60 uppercase">
                                                        {t('Choose Platform') ||
                                                            'Platform'}
                                                    </span>
                                                    <span className="mt-0.5 flex items-center gap-1 text-xs font-black text-arabic-gold">
                                                        <Video className="h-3.5 w-3.5 animate-pulse text-arabic-emerald" />{' '}
                                                        {t('Online Learning')}
                                                    </span>
                                                </div>
                                                <Button
                                                    type="submit"
                                                    disabled={
                                                        bookingForm.processing
                                                    }
                                                    className="flex items-center gap-1.5 rounded-full bg-arabic-bronze px-6 py-5 text-xs font-black text-arabic-sand shadow-md transition hover:bg-arabic-bronze/90"
                                                >
                                                    {bookingForm.processing
                                                        ? t('Booking...')
                                                        : t('Book Session Now')}
                                                </Button>
                                            </form>
                                        ) : (
                                            <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-arabic-cream bg-arabic-sand p-4 text-center sm:flex-row sm:text-start">
                                                <div>
                                                    <span className="block text-[10px] font-black text-arabic-bronze uppercase">
                                                        {t('Log In')}
                                                    </span>
                                                    <p className="mt-0.5 text-[11px] leading-normal text-arabic-bronze/70">
                                                        {t(
                                                            'Please login or register to reserve this private slot.',
                                                        ) ||
                                                            'Please login or register.'}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Link href={login()}>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-9 rounded-xl border-arabic-bronze/25 text-xs text-arabic-bronze hover:bg-arabic-cream"
                                                        >
                                                            {t('Log In')}
                                                        </Button>
                                                    </Link>
                                                    <Link href={register()}>
                                                        <Button
                                                            size="sm"
                                                            className="h-9 rounded-xl bg-arabic-bronze text-xs text-arabic-sand hover:bg-arabic-bronze/90"
                                                        >
                                                            {t('Register')}
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer Section */}
                <footer className="rounded-t-[3rem] border-t border-arabic-bronze bg-arabic-bronze px-6 py-12 text-arabic-sand">
                    <div className="mx-auto mb-8 flex max-w-7xl flex-col items-center justify-between gap-6 border-b border-arabic-sand/15 pb-8 md:flex-row">
                        <div className="flex h-12 items-center">
                            <AppLogoIcon className="h-10 w-auto text-arabic-sand" />
                        </div>
                        <div className="flex gap-6 text-xs font-bold text-arabic-sand/75">
                            <a
                                href="#programs"
                                className="transition hover:text-arabic-gold"
                            >
                                {t('Programs')}
                            </a>
                            <a
                                href="#booking-calendar"
                                className="transition hover:text-arabic-gold"
                            >
                                {t('Book Private Session')}
                            </a>
                            <Link
                                href="/login"
                                className="transition hover:text-arabic-gold"
                            >
                                {t('Log In')}
                            </Link>
                            <Link
                                href="/register"
                                className="transition hover:text-arabic-gold"
                            >
                                {t('Register')}
                            </Link>
                        </div>
                    </div>
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-[10px] font-bold tracking-wider text-arabic-sand/50 uppercase sm:flex-row">
                        <span>
                            {t('© 2026 Tahseen. All rights reserved.')}
                        </span>
                        <div className="flex items-center gap-1.5 text-arabic-gold">
                            <MessageSquare className="h-4 w-4" />
                            <span>{t('WhatsApp: +62 822-5198-5570')}</span>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
