import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import {
    ArrowRight,
    BookOpen,
    Calendar,
    Clock,
    Copy,
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
    Headphones,
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
    const [country, setCountry] = useState<'id' | 'my' | 'sg'>('id');
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'program'>('monthly');

    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success(t('Copied to clipboard!'));
    };

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
                <section id="programs" className="mx-auto max-w-7xl px-6 py-16">
                    {/* Country Selector Header */}
                    <div className="mx-auto mb-14 text-center max-w-2xl space-y-4 animate-fade-in-up">
                        <span className="text-[11px] font-black tracking-[0.25em] text-arabic-gold uppercase flex items-center justify-center gap-2">
                            <span className="h-1 w-6 bg-gradient-to-r from-transparent to-arabic-gold rounded-full" />
                            ✦ {t('PILIHAN PAKET PRIVAT')} ✦
                            <span className="h-1 w-6 bg-gradient-to-l from-transparent to-arabic-gold rounded-full" />
                        </span>
                        <h2 className="font-serif text-3xl font-black text-arabic-bronze sm:text-4xl md:text-5xl tracking-wide leading-tight">
                            {t('Investasi Pembelajaran')}
                        </h2>
                        <p className="text-xs sm:text-sm font-semibold text-arabic-bronze/70 max-w-lg mx-auto leading-relaxed">
                            {t('Pilih wilayah Anda untuk melihat biaya program privat 1-on-1 dan metode pembayaran lokal.')}
                        </p>

                        <div className="flex flex-col items-center justify-center gap-4 mt-6">
                            {/* Billing Cycle Switcher */}
                            <div className="inline-flex rounded-full bg-arabic-cream/35 p-1.5 border border-arabic-cream/80 shadow-[0_8px_30px_rgb(30,56,51,0.02)] backdrop-blur-md transition duration-300">
                                <button
                                    type="button"
                                    onClick={() => setBillingCycle('monthly')}
                                    className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-black transition-all duration-300 cursor-pointer ${
                                        billingCycle === 'monthly'
                                            ? 'bg-gradient-to-r from-arabic-bronze to-[#2A4843] text-arabic-sand shadow-[0_4px_15px_rgba(30,56,51,0.2)] scale-[1.02]'
                                            : 'text-arabic-bronze/75 hover:text-arabic-bronze hover:bg-arabic-cream/55'
                                    }`}
                                >
                                    {t('Bulanan')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setBillingCycle('program')}
                                    className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-black transition-all duration-300 cursor-pointer ${
                                        billingCycle === 'program'
                                            ? 'bg-gradient-to-r from-arabic-bronze to-[#2A4843] text-arabic-sand shadow-[0_4px_15px_rgba(30,56,51,0.2)] scale-[1.02]'
                                            : 'text-arabic-bronze/75 hover:text-arabic-bronze hover:bg-arabic-cream/55'
                                    }`}
                                >
                                    {t('Paket Program')}
                                </button>
                            </div>

                            {/* Country Selector (Flags with Bold Names) */}
                            <div className="inline-flex rounded-full bg-arabic-cream/35 p-1.5 border border-arabic-cream/80 shadow-[0_8px_30px_rgb(30,56,51,0.02)] backdrop-blur-md transition duration-300">
                                <button
                                    type="button"
                                    onClick={() => setCountry('id')}
                                    className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs transition-all duration-300 cursor-pointer ${
                                        country === 'id'
                                            ? 'bg-gradient-to-r from-arabic-bronze to-[#2A4843] text-arabic-sand shadow-[0_4px_15px_rgba(30,56,51,0.2)] scale-[1.02]'
                                            : 'text-arabic-bronze/75 hover:text-arabic-bronze hover:bg-arabic-cream/55'
                                    }`}
                                >
                                    <img src="/images/flags/id.svg" alt="Indonesia" className="w-4.5 h-4.5 object-contain" />
                                    <span className="font-bold">{t('Indonesia')}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCountry('my')}
                                    className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs transition-all duration-300 cursor-pointer ${
                                        country === 'my'
                                            ? 'bg-gradient-to-r from-arabic-bronze to-[#2A4843] text-arabic-sand shadow-[0_4px_15px_rgba(30,56,51,0.2)] scale-[1.02]'
                                            : 'text-arabic-bronze/75 hover:text-arabic-bronze hover:bg-arabic-cream/55'
                                    }`}
                                >
                                    <img src="/images/flags/my.svg" alt="Malaysia" className="w-4.5 h-4.5 object-contain" />
                                    <span className="font-bold">{t('Malaysia')}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCountry('sg')}
                                    className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs transition-all duration-300 cursor-pointer ${
                                        country === 'sg'
                                            ? 'bg-gradient-to-r from-arabic-bronze to-[#2A4843] text-arabic-sand shadow-[0_4px_15px_rgba(30,56,51,0.2)] scale-[1.02]'
                                            : 'text-arabic-bronze/75 hover:text-arabic-bronze hover:bg-arabic-cream/55'
                                    }`}
                                >
                                    <img src="/images/flags/sg.svg" alt="Singapore" className="w-4.5 h-4.5 object-contain" />
                                    <span className="font-bold">{t('Singapore')}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {programs.map((program) => {
                            // Find matching letter emblem
                            let letter = 'ق';
                            const progName = getTranslation(
                                program.name,
                                'en',
                            ).toLowerCase();

                            if (progName.includes('tahseen') || progName.includes('tahsin')) {
                                letter = 'ح';
                            } else if (progName.includes('tajweed') || progName.includes('tajwid')) {
                                letter = 'ت';
                            } else if (progName.includes('athfal')) {
                                letter = 'ط';
                            }

                            // Dynamic pricing config
                            const prices: Record<string, Record<'id' | 'my' | 'sg', Record<'monthly' | 'program', { amount: string; unit: string }>>> = {
                                talqin: {
                                    id: {
                                        monthly: { amount: 'Rp500.000', unit: 'bulan' },
                                        program: { amount: 'Rp1.500.000', unit: 'paket' },
                                    },
                                    my: {
                                        monthly: { amount: 'RM 150', unit: 'bulan' },
                                        program: { amount: 'RM 450', unit: 'paket' },
                                    },
                                    sg: {
                                        monthly: { amount: 'S$45', unit: 'month' },
                                        program: { amount: 'S$135', unit: 'package' },
                                    },
                                },
                                tahseen: {
                                    id: {
                                        monthly: { amount: 'Rp500.000', unit: 'bulan' },
                                        program: { amount: 'Rp1.500.000', unit: 'paket' },
                                    },
                                    my: {
                                        monthly: { amount: 'RM 150', unit: 'bulan' },
                                        program: { amount: 'RM 450', unit: 'paket' },
                                    },
                                    sg: {
                                        monthly: { amount: 'S$45', unit: 'month' },
                                        program: { amount: 'S$135', unit: 'package' },
                                    },
                                },
                                tajweed: {
                                    id: {
                                        monthly: { amount: 'Rp600.000', unit: 'bulan' },
                                        program: { amount: 'Rp2.000.000', unit: 'paket' },
                                    },
                                    my: {
                                        monthly: { amount: 'RM 180', unit: 'bulan' },
                                        program: { amount: 'RM 600', unit: 'paket' },
                                    },
                                    sg: {
                                        monthly: { amount: 'S$55', unit: 'month' },
                                        program: { amount: 'S$180', unit: 'package' },
                                    },
                                },
                                athfal: {
                                    id: {
                                        monthly: { amount: 'Rp700.000', unit: 'bulan' },
                                        program: { amount: 'Rp2.500.000', unit: 'paket' },
                                    },
                                    my: {
                                        monthly: { amount: 'RM 210', unit: 'bulan' },
                                        program: { amount: 'RM 750', unit: 'paket' },
                                    },
                                    sg: {
                                        monthly: { amount: 'S$65', unit: 'month' },
                                        program: { amount: 'S$225', unit: 'package' },
                                    },
                                },
                            };

                            const getProgramKey = (name: string) => {
                                const lower = name.toLowerCase();
                                if (lower.includes('talqin')) return 'talqin';
                                if (lower.includes('tahseen') || lower.includes('tahsin')) return 'tahseen';
                                if (lower.includes('tajweed') || lower.includes('tajwid')) return 'tajweed';
                                if (lower.includes('athfal')) return 'athfal';
                                return 'tahseen';
                            };

                            const progKey = getProgramKey(progName);
                            const priceConfig = prices[progKey] || prices.tahseen;
                            const activePrice = priceConfig[country][billingCycle];

                            // Find matching duration footer or use dynamic values if present
                            let sessionsText = t('2 Sesi per minggu');
                            let timingText = t('Sabtu & Minggu');
                            let durationText = t('Durasi 1 jam per sesi');

                            if (billingCycle === 'program') {
                                sessionsText = t('24 pertemuan');
                                timingText = t('Jadwal Fleksibel');
                                durationText = t('Durasi 1 jam per sesi');
                            } else {
                                if (progName.includes('athfal')) {
                                    sessionsText = t('Durasi 12 minggu');
                                    timingText = t('60 menit per pertemuan');
                                    durationText = t(
                                        'Bimbingan intensif & hafalan',
                                    );
                                }
                            }

                            const programDetails: Record<string, Record<'monthly' | 'program', string[]>> = {
                                talqin: {
                                    monthly: [
                                        t('8 pertemuan/bulan'),
                                        t('60 menit per pertemuan'),
                                        t('Bahasa Indonesia & Arab'),
                                        t('Evaluasi berkala'),
                                    ],
                                    program: [
                                        t('24 pertemuan'),
                                        t('Bimbingan intensif'),
                                        t('Evaluasi berkala'),
                                        t('Sertifikat kelulusan'),
                                    ],
                                },
                                tahseen: {
                                    monthly: [
                                        t('8 pertemuan/bulan'),
                                        t('60 menit per pertemuan'),
                                        t('Bahasa Indonesia & Arab'),
                                        t('Evaluasi berkala'),
                                    ],
                                    program: [
                                        t('24 pertemuan'),
                                        t('perbaikan makhraj&sifat'),
                                        t('perbaikan bacaan'),
                                        t('sertifikat'),
                                    ],
                                },
                                tajweed: {
                                    monthly: [
                                        t('8 pertemuan/bulan'),
                                        t('Materi tajwid lengkap'),
                                        t('Praktik bacaan'),
                                    ],
                                    program: [
                                        t('24 pertemuan'),
                                        t('Materi tajwid lengkap'),
                                        t('Evaluasi berkala.'),
                                        t('Sertifikat.'),
                                    ],
                                },
                                athfal: {
                                    monthly: [
                                        t('Hafalan matan'),
                                        t('Penjelasan bait'),
                                        t('Praktik tajwid'),
                                        t('Sertifikat setelah selesai program'),
                                    ],
                                    program: [
                                        t('24 pertemuan'),
                                        t('Sertifikat'),
                                        t('Grup konsultasi'),
                                    ],
                                },
                            };

                            const details = programDetails[progKey]?.[billingCycle] || getTranslationList(
                                program.details_json,
                                locale,
                            );

                            return (
                                <div
                                    key={program.id}
                                    className="group relative flex flex-col justify-between overflow-hidden rounded-t-[11rem] rounded-b-[2.5rem] border border-arabic-cream/80 bg-arabic-sand shadow-lg hover:shadow-[0_22px_45px_-5px_rgba(30,56,51,0.12)] border-t-4 border-t-arabic-gold/70 transition-all duration-500 hover:-translate-y-2"
                                >
                                    <div className="absolute top-0 right-0 left-0 h-24 bg-gradient-to-b from-arabic-cream/30 to-transparent" />

                                    <div className="flex flex-grow flex-col items-center space-y-6 p-7 pt-14">
                                        {/* Circular golden emblem with animated program icon */}
                                        <div className="group/emblem relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-arabic-gold/60 bg-arabic-cream shadow-md transition duration-300 group-hover:scale-105">
                                            <div className="absolute inset-0 bg-arabic-gold/5 transition duration-500 group-hover/emblem:scale-110" />
                                            {progKey === 'talqin' && (
                                                <Headphones
                                                    className="z-10 h-9 w-9 text-arabic-gold select-none group-hover:animate-float"
                                                    style={{ animationDuration: '4s' }}
                                                />
                                            )}
                                            {progKey === 'tahseen' && (
                                                <BookOpen
                                                    className="z-10 h-9 w-9 text-arabic-gold select-none group-hover:animate-float"
                                                    style={{ animationDuration: '4s' }}
                                                />
                                            )}
                                            {progKey === 'tajweed' && (
                                                <Sparkles
                                                    className="z-10 h-9 w-9 text-arabic-gold select-none group-hover:animate-float"
                                                    style={{ animationDuration: '4s' }}
                                                />
                                            )}
                                            {progKey === 'athfal' && (
                                                <Award
                                                    className="z-10 h-9 w-9 text-arabic-gold select-none group-hover:animate-float"
                                                    style={{ animationDuration: '4s' }}
                                                />
                                            )}
                                        </div>
                                        <div className="space-y-2 text-center w-full">
                                            <h3 className="font-serif text-2xl font-black text-arabic-bronze leading-tight">
                                                {getTranslation(
                                                    program.name,
                                                    locale,
                                                )}
                                            </h3>
                                            <span className="text-[10px] font-black tracking-widest text-arabic-gold uppercase block">
                                                • {t('Programs')} •
                                            </span>

                                            {/* Pricing Badge (Ticket style with premium details) */}
                                            <div className="mt-3.5 inline-flex flex-col items-center bg-gradient-to-br from-arabic-cream/55 to-arabic-sand/80 border border-arabic-cream/85 py-3.5 rounded-2xl w-full shadow-sm relative overflow-hidden group/price">
                                                <span className="text-[10px] font-bold text-arabic-gold tracking-widest uppercase block mb-0.5">
                                                    {t('Investasi')}
                                                </span>
                                                <span className="text-2xl font-black text-arabic-bronze tracking-wide">
                                                    {activePrice.amount}
                                                </span>
                                                <span className="text-[9px] font-extrabold text-arabic-bronze/50 uppercase tracking-widest mt-1">
                                                    / {t(activePrice.unit)}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <ul className="w-full space-y-3.5 ps-2 text-start text-xs font-semibold text-arabic-bronze/85">
                                            {details.map((detail, idx) => (
                                                <li
                                                    key={idx}
                                                    className="flex items-start gap-2.5"
                                                >
                                                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-arabic-gold" />
                                                    <span className="leading-relaxed">{detail}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Flyer-style brown details card footer */}
                                    <div className="flex flex-col gap-2 rounded-t-[2rem] border-t border-arabic-gold bg-gradient-to-br from-arabic-bronze to-[#2A4843] p-6 text-arabic-sand shadow-inner">
                                        <div className="flex items-center gap-2.5 text-[11px] font-extrabold">
                                            <Calendar className="h-4 w-4 text-arabic-gold" />
                                            <span>{sessionsText}</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 text-[11px] font-extrabold">
                                            <Clock className="h-4 w-4 text-arabic-gold" />
                                            <span>{timingText}</span>
                                        </div>
                                        <div className="flex items-center gap-2.5 text-[11px] font-extrabold">
                                            <Sparkles className="h-4 w-4 text-arabic-gold" />
                                            <span>{durationText}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Payment Details Section */}
                <section className="mx-auto max-w-4xl px-6 pb-16 animate-fade-in-up">
                    <div className="relative overflow-hidden rounded-[2.5rem] border border-arabic-cream/80 bg-arabic-cream/15 p-7 sm:p-9 shadow-lg backdrop-blur-md">
                        {/* Decorative background glow */}
                        <div className="absolute -right-10 -bottom-10 -z-10 h-48 w-48 rounded-full bg-arabic-gold/5 blur-3xl" />
                        <div className="absolute -left-10 -top-10 -z-10 h-48 w-48 rounded-full bg-arabic-gold/5 blur-3xl" />

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-arabic-cream/70">
                            <div>
                                <span className="text-[10px] font-black tracking-[0.2em] text-arabic-gold uppercase block">{t('Metode Pembayaran')}</span>
                                <h3 className="font-serif text-2xl font-black text-arabic-bronze mt-1">
                                    {country === 'id' && 'Metode Pembayaran di Indonesia'}
                                    {country === 'my' && 'Kaedah Pembayaran di Malaysia'}
                                    {country === 'sg' && 'Payment Methods for Singapore'}
                                </h3>
                                <p className="text-xs font-semibold text-arabic-bronze/70 mt-1 max-w-xl leading-relaxed">
                                    {country === 'id' && 'Gunakan QRIS atau Transfer Bank Lokal untuk kemudahan transaksi Anda.'}
                                    {country === 'my' && 'FPX Online Banking dan DuitNow QR disokong untuk pembayaran pantas.'}
                                    {country === 'sg' && 'Local Bank Transfer and PayNow QR are supported for quick checkout.'}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 rounded-full bg-arabic-sand px-4.5 py-2 border border-arabic-cream flex-shrink-0 self-start md:self-auto shadow-sm">
                                <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                                <span className="text-[9px] font-black text-arabic-bronze/85 uppercase tracking-wider">{t('Aman & Terverifikasi')}</span>
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 pt-6">
                            {country === 'id' && (
                                <>
                                    <div className="flex gap-4.5 items-start rounded-[1.8rem] bg-arabic-sand p-5 border border-arabic-cream shadow-sm hover:border-arabic-gold/30 hover:shadow-md transition-all duration-300">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 font-black text-sm flex-shrink-0 border border-emerald-500/10">
                                            QR
                                        </div>
                                        <div className="space-y-2">
                                            <span className="block text-xs font-black text-arabic-bronze">{t('QRIS (Pembayaran Instan)')}</span>
                                            <span className="block text-[11px] leading-relaxed font-semibold text-arabic-bronze/75">
                                                Scan kode QRIS resmi kami menggunakan GoPay, OVO, Dana, LinkAja, ShopeePay, atau aplikasi Mobile Banking Anda.
                                            </span>
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/70 text-emerald-850 px-2.5 py-0.5 text-[9px] font-bold">
                                                ✦ Paling Direkomendasikan
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-4.5 items-start rounded-[1.8rem] bg-arabic-sand p-5 border border-arabic-cream shadow-sm hover:border-arabic-gold/30 hover:shadow-md transition-all duration-300">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-arabic-bronze/10 text-arabic-bronze font-black text-sm flex-shrink-0 border border-arabic-bronze/10">
                                            BCA
                                        </div>
                                        <div className="space-y-2.5 w-full">
                                            <span className="block text-xs font-black text-arabic-bronze">{t('Transfer Bank (BCA)')}</span>
                                            <span className="block text-[11px] leading-relaxed font-semibold text-arabic-bronze/75">
                                                Kirim transfer langsung ke rekening Bank BCA resmi:
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleCopyToClipboard('8225198557')}
                                                className="bg-arabic-cream/35 p-3 rounded-xl border border-arabic-cream/80 flex justify-between items-center w-full cursor-pointer hover:border-arabic-gold/50 hover:bg-arabic-cream/60 transition group/item"
                                                title="Klik untuk menyalin nomor rekening"
                                            >
                                                <code className="text-xs font-mono font-black tracking-wider text-arabic-bronze group-hover/item:text-arabic-gold transition">8225198557</code>
                                                <div className="flex items-center gap-1.5 text-[9px] font-bold text-arabic-bronze/60 group-hover/item:text-arabic-bronze transition">
                                                    <span>a/n Tahseen Live</span>
                                                    <Copy className="h-3.5 w-3.5 text-arabic-gold/80 group-hover/item:scale-110 transition" />
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {country === 'my' && (
                                <>
                                    <div className="flex gap-4.5 items-start rounded-[1.8rem] bg-arabic-sand p-5 border border-arabic-cream shadow-sm hover:border-arabic-gold/30 hover:shadow-md transition-all duration-300">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/10 text-red-600 font-black text-sm flex-shrink-0 border border-red-500/10">
                                            QR
                                        </div>
                                        <div className="space-y-2">
                                            <span className="block text-xs font-black text-arabic-bronze">{t('DuitNow QR')}</span>
                                            <span className="block text-[11px] leading-relaxed font-semibold text-arabic-bronze/75">
                                                Imbas Kod QR DuitNow menggunakan aplikasi perbankan mudah alih atau e-Dompet (Touch 'n Go, GrabPay, Boost).
                                            </span>
                                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100/70 text-red-800 px-2.5 py-0.5 text-[9px] font-bold">
                                                ✦ Paling Pantas
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-4.5 items-start rounded-[1.8rem] bg-arabic-sand p-5 border border-arabic-cream shadow-sm hover:border-arabic-gold/30 hover:shadow-md transition-all duration-300">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-arabic-bronze/10 text-arabic-bronze font-black text-sm flex-shrink-0 border border-arabic-bronze/10">
                                            BANK
                                        </div>
                                        <div className="space-y-2.5 w-full">
                                            <span className="block text-xs font-black text-arabic-bronze">{t('FPX / Bank Transfer')}</span>
                                            <span className="block text-[11px] leading-relaxed font-semibold text-arabic-bronze/75">
                                                Pindahkan terus ke akaun bank Maybank kami:
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleCopyToClipboard('162021583940')}
                                                className="bg-arabic-cream/35 p-3 rounded-xl border border-arabic-cream/80 flex justify-between items-center w-full cursor-pointer hover:border-arabic-gold/50 hover:bg-arabic-cream/60 transition group/item"
                                                title="Klik untuk menyalin nomor akaun"
                                            >
                                                <code className="text-xs font-mono font-black tracking-wider text-arabic-bronze group-hover/item:text-arabic-gold transition">162021583940</code>
                                                <div className="flex items-center gap-1.5 text-[9px] font-bold text-arabic-bronze/60 group-hover/item:text-arabic-bronze transition">
                                                    <span>a/n Tahseen Live</span>
                                                    <Copy className="h-3.5 w-3.5 text-arabic-gold/80 group-hover/item:scale-110 transition" />
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {country === 'sg' && (
                                <>
                                    <div className="flex gap-4.5 items-start rounded-[1.8rem] bg-arabic-sand p-5 border border-arabic-cream shadow-sm hover:border-arabic-gold/30 hover:shadow-md transition-all duration-300">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 font-black text-sm flex-shrink-0 border border-blue-500/10">
                                            QR
                                        </div>
                                        <div className="space-y-2.5 w-full">
                                            <span className="block text-xs font-black text-arabic-bronze">{t('PayNow QR')}</span>
                                            <span className="block text-[11px] leading-relaxed font-semibold text-arabic-bronze/75">
                                                Scan the PayNow QR code or send to UEN registration number:
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleCopyToClipboard('T20LL9855G')}
                                                className="bg-arabic-cream/35 p-3 rounded-xl border border-arabic-cream/80 flex justify-between items-center w-full cursor-pointer hover:border-arabic-gold/50 hover:bg-arabic-cream/60 transition group/item"
                                                title="Click to copy UEN number"
                                            >
                                                <code className="text-xs font-mono font-black tracking-wider text-arabic-bronze group-hover/item:text-arabic-gold transition">T20LL9855G</code>
                                                <div className="flex items-center gap-1.5 text-[9px] font-bold text-arabic-bronze/60 group-hover/item:text-arabic-bronze transition">
                                                    <span>Tahseen Live</span>
                                                    <Copy className="h-3.5 w-3.5 text-arabic-gold/80 group-hover/item:scale-110 transition" />
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex gap-4.5 items-start rounded-[1.8rem] bg-arabic-sand p-5 border border-arabic-cream shadow-sm hover:border-arabic-gold/30 hover:shadow-md transition-all duration-300">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-arabic-bronze/10 text-arabic-bronze font-black text-sm flex-shrink-0 border border-arabic-bronze/10">
                                            DBS
                                        </div>
                                        <div className="space-y-2.5 w-full">
                                            <span className="block text-xs font-black text-arabic-bronze">{t('Bank Transfer (DBS)')}</span>
                                            <span className="block text-[11px] leading-relaxed font-semibold text-arabic-bronze/75">
                                                Transfer directly to our DBS bank account:
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleCopyToClipboard('123-45678-9')}
                                                className="bg-arabic-cream/35 p-3 rounded-xl border border-arabic-cream/80 flex justify-between items-center w-full cursor-pointer hover:border-arabic-gold/50 hover:bg-arabic-cream/60 transition group/item"
                                                title="Click to copy account number"
                                            >
                                                <code className="text-xs font-mono font-black tracking-wider text-arabic-bronze group-hover/item:text-arabic-gold transition">123-45678-9</code>
                                                <div className="flex items-center gap-1.5 text-[9px] font-bold text-arabic-bronze/60 group-hover/item:text-arabic-bronze transition">
                                                    <span>Tahseen Live</span>
                                                    <Copy className="h-3.5 w-3.5 text-arabic-gold/80 group-hover/item:scale-110 transition" />
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Morocco removed */}
                        </div>

                        <div className="mt-8 p-4.5 bg-arabic-cream/40 rounded-2xl border border-arabic-cream/70 flex flex-col sm:flex-row items-center justify-between gap-4.5 text-center sm:text-start shadow-inner">
                            <div className="space-y-0.5">
                                <span className="block text-xs font-black text-arabic-bronze">{t('Setelah Melakukan Pembayaran')}</span>
                                <span className="block text-[11px] font-semibold text-arabic-bronze/70">
                                    {t('Kirimkan bukti transfer pembayaran Anda ke WhatsApp Admin untuk aktivasi paket instan.')}
                                </span>
                            </div>
                            <a
                                href="https://wa.me/6282251985570?text=Assalamualaikum%20Admin,%20saya%20ingin%20konfirmasi%20pembayaran%20program%20tahseen.live"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5.5 py-2.5 text-xs font-black text-white shadow-md hover:bg-emerald-700 hover:shadow-lg transition-all duration-300 flex-shrink-0 cursor-pointer"
                            >
                                <Phone className="h-4 w-4" />
                                {t('Konfirmasi WhatsApp')}
                            </a>
                        </div>
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
