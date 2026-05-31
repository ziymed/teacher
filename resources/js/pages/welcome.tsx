import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowRight, BookOpen, Calendar, Clock, Globe, ShieldCheck, Check, MapPin, Sparkles, Video, UserCheck, MessageSquare, Phone, LayoutGrid, Award } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
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

export default function Welcome({ programs = [], teachers = [], availableSlots = [] }: WelcomeProps) {
    const { auth } = usePage<any>().props;
    const user = auth?.user;

    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
    const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null);
    const [notes, setNotes] = useState('');

    const bookingForm = useForm({
        slot_id: '',
        program_id: '',
        student_notes: '',
    });

    const getSlotDateString = (dateTimeStr: string) => {
        const dateObj = new Date(dateTimeStr);
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const availableDates = Array.from(
        new Set(availableSlots.map((slot) => getSlotDateString(slot.start_time)))
    ).sort();

    const getSlotsForDate = (dateStr: string) => {
        return availableSlots.filter(
            (slot) => getSlotDateString(slot.start_time) === dateStr
        );
    };

    const handleSelectDate = (dateStr: string) => {
        setSelectedDate(dateStr);
        setSelectedSlot(null);
    };

    const handleSelectSlot = (slot: Slot) => {
        setSelectedSlot(slot);
        bookingForm.setData('slot_id', String(slot.id));
    };

    const handleConfirmBooking = (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast.error('Please log in or register a student account to book a private session.');
            return;
        }

        if (!selectedSlot) {
            toast.error('Please choose a time slot.');
            return;
        }

        if (!selectedProgramId) {
            toast.error('Please select one of our Quranic programs (Talqin, Tahseen, or Tajweed).');
            return;
        }

        bookingForm.transform((data) => ({
            ...data,
            slot_id: String(selectedSlot.id),
            program_id: String(selectedProgramId),
            student_notes: notes,
        }));

        bookingForm.post(storeBooking().url, {
            onSuccess: () => {
                setSelectedSlot(null);
                setSelectedDate(null);
                setSelectedProgramId(null);
                setNotes('');
                toast.success('Alhamdulillah! Your private 1-to-1 session has been booked successfully.');
            },
            onError: (err: any) => {
                toast.error(err.error || 'Failed to submit session booking.');
            },
        });
    };

    return (
        <>
            <Head>
                <title>Program Talqin, Tahseen Dan Tajweed Al-Quran</title>
                <meta name="description" content="Master Al-Quran recitation with native Moroccan teachers. Custom private 1-to-1 programs in Talqin, Tahseen, and Tajweed." />
                <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Outfit:wght@100..900&family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;700;900&display=swap" rel="stylesheet" />
            </Head>

            {/* Flyer Theme Visual Wrapper */}
            <div className="min-h-screen bg-arabic-sand text-arabic-bronze font-sans selection:bg-arabic-gold/30 selection:text-arabic-bronze antialiased relative overflow-x-hidden">

                {/* Elegant translucent Arabic letters in background */}
                <div className="absolute top-[20%] left-[6%] font-serif-ar text-arabic-gold/10 text-7xl md:text-8xl pointer-events-none select-none hidden lg:block">ق</div>
                <div className="absolute top-[40%] right-[8%] font-serif-ar text-arabic-bronze/5 text-8xl md:text-9xl pointer-events-none select-none hidden lg:block">ح</div>
                <div className="absolute top-[65%] left-[5%] font-serif-ar text-arabic-gold/10 text-8xl pointer-events-none select-none hidden lg:block">ت</div>
                <div className="absolute top-[80%] right-[6%] font-serif-ar text-arabic-bronze/10 text-7xl pointer-events-none select-none hidden lg:block">ض</div>
                <div className="absolute top-[15%] right-[25%] font-serif-ar text-arabic-gold/5 text-[10rem] pointer-events-none select-none hidden lg:block">ر</div>
                <div className="absolute top-[50%] left-[20%] font-serif-ar text-arabic-gold/5 text-8xl pointer-events-none select-none hidden lg:block">ع</div>

                {/* 2. Mosque Silhouettes Background Vector */}
                <div className="absolute bottom-0 left-0 right-0 h-96 opacity-15 pointer-events-none -z-10 bg-no-repeat bg-bottom bg-contain" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320' fill='%234A3E3D'%3E%3Cpath d='M0,320 L0,220 C60,200 120,200 180,220 C240,240 300,240 360,220 C420,200 480,140 540,160 C600,180 660,260 720,270 C780,280 840,220 900,190 C960,160 1020,160 1080,180 C1140,200 1200,240 1260,220 C1320,200 1380,140 1440,160 L1440,320 Z'/%3E%3C/svg%3E")` }} />

                {/* Header Navigation */}
                <header className="sticky top-0 z-50 backdrop-blur-md bg-arabic-sand/75 border-b border-arabic-cream px-6 py-4 flex items-center justify-between max-w-7xl mx-auto rounded-b-[2rem] shadow-sm">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-arabic-bronze flex items-center justify-center text-arabic-gold shadow-md">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                            <span className="font-serif text-sm font-black tracking-wide block leading-none">AL-QURAN</span>
                            <span className="text-[9px] uppercase font-bold tracking-widest text-arabic-gold">Arabic Academy</span>
                        </div>
                    </div>

                    <nav className="flex items-center gap-4">
                        {user ? (
                            <Link
                                href={dashboard()}
                                className="inline-flex items-center gap-2 rounded-full bg-arabic-bronze text-arabic-sand px-5 py-2 text-xs font-bold hover:bg-arabic-bronze/90 transition shadow-md hover:shadow-lg"
                            >
                                <Globe className="h-3.5 w-3.5 text-arabic-gold" /> Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="text-xs font-bold hover:text-arabic-gold transition px-3"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href={register()}
                                    className="rounded-full bg-arabic-bronze text-arabic-sand px-5 py-2 text-xs font-bold hover:bg-arabic-bronze/90 transition shadow-md"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                {/* Main Hero Section */}
                <section className="max-w-7xl mx-auto px-6 pt-12 pb-16 lg:py-20 animate-fade-in-up">
                    <div className="grid lg:grid-cols-12 gap-12 items-center">

                        {/* Left Side: Typography and Call to Action */}
                        <div className="lg:col-span-7 space-y-8 text-center lg:text-left flex flex-col justify-center">

                            <div className="inline-flex items-center gap-2 text-arabic-gold text-xs tracking-[0.2em] uppercase font-black mx-auto lg:mx-0">
                                <span>✦</span>
                                <span>Program Belajar Qur'an</span>
                                <span>✦</span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black tracking-wide leading-tight text-arabic-bronze">
                                Program <span className="font-serif italic font-normal text-arabic-gold">Talqin, Tahseen</span> <br />
                                Dan <span className="font-serif italic font-normal text-arabic-gold underline decoration-arabic-gold/30 decoration-wavy underline-offset-8">Tajweed</span> Al-Quran
                            </h1>

                            {/* Beautiful Arabic Calligraphy Verse Quote */}
                            <div className="py-2 border-y border-arabic-cream/60 max-w-xl mx-auto lg:mx-0">
                                <p className="font-serif-ar text-arabic-gold text-3xl md:text-4xl font-bold">
                                    وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا
                                </p>
                                <p className="text-[10px] uppercase font-bold tracking-widest text-arabic-bronze/60 mt-1.5 leading-relaxed font-semibold">
                                    "Dan bacalah Al-Quran itu dengan perlahan-lahan." (QS. Al-Muzzammil: 4)
                                </p>
                            </div>

                            {/* Morocco Native Teacher Badge */}
                            <div className="inline-flex flex-col sm:flex-row items-center gap-3 bg-arabic-cream/65 border border-arabic-cream rounded-2xl px-5 py-3 max-w-lg mx-auto lg:mx-0 shadow-sm hover:shadow transition duration-300">
                                <div className="w-10 h-10 rounded-full bg-arabic-bronze flex items-center justify-center text-lg shadow-md">🇲🇦</div>
                                <div className="text-left">
                                    <span className="text-xs font-black block text-arabic-bronze">Belajar Langsung Dengan Penutur Asli</span>
                                    <span className="text-[10px] text-arabic-bronze/70 font-medium block mt-0.5">Ustaz berpengalaman & penutur asli dari Maroko untuk makhraj yang sempurna.</span>
                                </div>
                            </div>

                            {/* Quick Call to Action Buttons */}
                            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                                <a href="#booking-calendar" className="w-full sm:w-auto">
                                    <Button className="rounded-full bg-arabic-bronze hover:bg-arabic-bronze/90 text-arabic-sand text-xs font-bold px-8 h-11 shadow-md hover:shadow-lg transition gap-1.5 w-full">
                                        <Calendar className="h-4 w-4 text-arabic-gold" /> Book Private Session
                                    </Button>
                                </a>
                                <a href="#programs" className="w-full sm:w-auto">
                                    <Button variant="outline" className="rounded-full border-arabic-bronze/25 hover:bg-arabic-cream text-arabic-bronze text-xs font-bold px-8 h-11 w-full">
                                        Explore Programs
                                    </Button>
                                </a>
                            </div>

                        </div>

                        {/* Right Side: Professional Teacher Portrait in Moroccan Arch Dome Frame */}
                        <div className="lg:col-span-5 relative">
                            <div className="relative mx-auto max-w-md lg:max-w-none">
                                {/* Subtle background glow */}
                                <div className="absolute inset-0 bg-arabic-gold/10 blur-3xl rounded-full -z-10" />

                                {/* Arched Dome Photo Frame matching the Moroccan flyer cards */}
                                <div className="border-4 border-arabic-cream rounded-t-[15rem] rounded-b-3xl overflow-hidden shadow-2xl bg-arabic-cream/30 p-2 group">
                                    <div className="rounded-t-[14.5rem] rounded-b-2xl overflow-hidden relative aspect-[4/5] bg-arabic-sand">
                                        <img
                                            src="/images/moroccan_teacher.png"
                                            alt="Native Moroccan Ustaz Arabic Teacher"
                                            className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-700 ease-out"
                                        />

                                        {/* Floating localized Arabic name tag */}
                                        <div className="absolute bottom-4 left-4 right-4 bg-arabic-bronze/90 backdrop-blur-sm border border-arabic-gold/30 rounded-2xl p-3 flex items-center justify-between shadow-lg text-arabic-sand">
                                            <div>
                                                <span className="font-serif text-sm font-black text-arabic-gold block">Ustaz Marouane</span>
                                                <span className="text-[9px] uppercase font-bold tracking-widest text-arabic-sand/75 block mt-0.5">Native Moroccan Teacher</span>
                                            </div>
                                            <span className="w-2.5 h-2.5 rounded-full bg-arabic-emerald animate-pulse flex-shrink-0" title="Online now" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

                {/* 3. Domed Arched Program Cards (EXACT shape and list matching the flyer) */}
                <section id="programs" className="max-w-7xl mx-auto px-6 py-12">
                    <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">

                        {/* CARD 1: TALQIN */}
                        <div className="bg-arabic-sand border-2 border-arabic-cream rounded-b-[2rem] rounded-t-[10rem] overflow-hidden shadow-xl flex flex-col justify-between relative group hover:border-arabic-gold/40 hover:-translate-y-1 transition duration-300">
                            <div className="absolute top-0 right-0 left-0 bg-gradient-to-b from-arabic-cream/35 to-transparent h-20" />

                            <div className="p-8 pt-12 space-y-6 flex-grow flex flex-col items-center">
                                {/* Circular golden emblem with animated Arabic letter */}
                                <div className="w-20 h-20 rounded-full bg-arabic-cream border-4 border-arabic-gold/60 flex items-center justify-center shadow-md group-hover:scale-105 transition duration-300 relative overflow-hidden group/emblem">
                                    <div className="absolute inset-0 bg-arabic-gold/5 group-hover/emblem:scale-110 transition duration-500" />
                                    <span className="font-serif-ar text-arabic-gold font-bold text-4xl leading-none select-none z-10 group-hover:animate-float" style={{ animationDuration: '4s' }}>ق</span>
                                </div>
                                <div className="text-center space-y-1">
                                    <h3 className="font-serif text-2xl font-black text-arabic-bronze">Talqin</h3>
                                    <span className="text-[10px] tracking-widest text-arabic-gold uppercase font-black">• Program •</span>
                                </div>
                                <ul className="space-y-3.5 w-full text-xs font-semibold text-arabic-bronze/85 text-left pl-2">
                                    <li className="flex items-start gap-2.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-arabic-gold mt-1.5 flex-shrink-0" />
                                        <span>Mendengar dan mengulang bacaan Al-Quran</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-arabic-gold mt-1.5 flex-shrink-0" />
                                        <span>Untuk pemula dan anak-anak</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-arabic-gold mt-1.5 flex-shrink-0" />
                                        <span>Membantu memperbaiki pelafalan dan kelancaran</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-arabic-gold mt-1.5 flex-shrink-0" />
                                        <span>Membaca surat pendek dan doa harian</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Flyer-style brown details card footer */}
                            <div className="p-6 bg-arabic-bronze text-arabic-sand border-t-2 border-arabic-gold flex flex-col gap-2 rounded-t-[1.5rem]">
                                <div className="flex items-center gap-2 text-[11px] font-bold">
                                    <Calendar className="h-4 w-4 text-arabic-gold" />
                                    <span>2 Sesi per minggu</span>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] font-bold">
                                    <Clock className="h-4 w-4 text-arabic-gold" />
                                    <span>Sabtu & Minggu</span>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] font-bold">
                                    <Sparkles className="h-4 w-4 text-arabic-gold" />
                                    <span>Durasi 1 jam per sesi</span>
                                </div>
                            </div>
                        </div>

                        {/* CARD 2: TAHSEEN */}
                        <div className="bg-arabic-sand border-2 border-arabic-cream rounded-b-[2rem] rounded-t-[10rem] overflow-hidden shadow-xl flex flex-col justify-between relative group hover:border-arabic-gold/40 hover:-translate-y-1 transition duration-300">
                            <div className="absolute top-0 right-0 left-0 bg-gradient-to-b from-arabic-cream/35 to-transparent h-20" />

                            <div className="p-8 pt-12 space-y-6 flex-grow flex flex-col items-center">
                                {/* Circular golden emblem with animated Arabic letter */}
                                <div className="w-20 h-20 rounded-full bg-arabic-cream border-4 border-arabic-gold/60 flex items-center justify-center shadow-md group-hover:scale-105 transition duration-300 relative overflow-hidden group/emblem">
                                    <div className="absolute inset-0 bg-arabic-gold/5 group-hover/emblem:scale-110 transition duration-500" />
                                    <span className="font-serif-ar text-arabic-gold font-bold text-4xl leading-none select-none z-10 group-hover:animate-float" style={{ animationDuration: '5s' }}>ح</span>
                                </div>
                                <div className="text-center space-y-1">
                                    <h3 className="font-serif text-2xl font-black text-arabic-bronze">Tahseen</h3>
                                    <span className="text-[10px] tracking-widest text-arabic-gold uppercase font-black">• Program •</span>
                                </div>
                                <ul className="space-y-3.5 w-full text-xs font-semibold text-arabic-bronze/85 text-left pl-2">
                                    <li className="flex items-start gap-2.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-arabic-gold mt-1.5 flex-shrink-0" />
                                        <span>Memperbaiki bacaan Al-Quran</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-arabic-gold mt-1.5 flex-shrink-0" />
                                        <span>Fokus pada makhraj dan pelafalan</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-arabic-gold mt-1.5 flex-shrink-0" />
                                        <span>Meningkatkan kelancaran dan kepercayaan diri</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-arabic-gold mt-1.5 flex-shrink-0" />
                                        <span>Bimbingan dan koreksi oleh guru</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="p-6 bg-arabic-bronze text-arabic-sand border-t-2 border-arabic-gold flex flex-col gap-2 rounded-t-[1.5rem]">
                                <div className="flex items-center gap-2 text-[11px] font-bold">
                                    <Calendar className="h-4 w-4 text-arabic-gold" />
                                    <span>2 Sesi per minggu</span>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] font-bold">
                                    <Clock className="h-4 w-4 text-arabic-gold" />
                                    <span>Sabtu & Minggu</span>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] font-bold">
                                    <Sparkles className="h-4 w-4 text-arabic-gold" />
                                    <span>Durasi 1 jam per sesi</span>
                                </div>
                            </div>
                        </div>

                        {/* CARD 3: TAJWEED */}
                        <div className="bg-arabic-sand border-2 border-arabic-cream rounded-b-[2rem] rounded-t-[10rem] overflow-hidden shadow-xl flex flex-col justify-between relative group hover:border-arabic-gold/40 hover:-translate-y-1 transition duration-300">
                            <div className="absolute top-0 right-0 left-0 bg-gradient-to-b from-arabic-cream/35 to-transparent h-20" />

                            <div className="p-8 pt-12 space-y-6 flex-grow flex flex-col items-center">
                                {/* Circular golden emblem with animated Arabic letter */}
                                <div className="w-20 h-20 rounded-full bg-arabic-cream border-4 border-arabic-gold/60 flex items-center justify-center shadow-md group-hover:scale-105 transition duration-300 relative overflow-hidden group/emblem">
                                    <div className="absolute inset-0 bg-arabic-gold/5 group-hover/emblem:scale-110 transition duration-500" />
                                    <span className="font-serif-ar text-arabic-gold font-bold text-4xl leading-none select-none z-10 group-hover:animate-float" style={{ animationDuration: '6s' }}>ت</span>
                                </div>
                                <div className="text-center space-y-1">
                                    <h3 className="font-serif text-2xl font-black text-arabic-bronze">Tajweed</h3>
                                    <span className="text-[10px] tracking-widest text-arabic-gold uppercase font-black">• Program •</span>
                                </div>
                                <ul className="space-y-3.5 w-full text-xs font-semibold text-arabic-bronze/85 text-left pl-2">
                                    <li className="flex items-start gap-2.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-arabic-gold mt-1.5 flex-shrink-0" />
                                        <span>Mempelajari aturan tajweed</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-arabic-gold mt-1.5 flex-shrink-0" />
                                        <span>Seperti Nun Sakinah, Madd, Qalqalah, Ghunnah</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-arabic-gold mt-1.5 flex-shrink-0" />
                                        <span>Menerapkan tajweed saat membaca Al-Quran</span>
                                    </li>
                                    <li className="flex items-start gap-2.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-arabic-gold mt-1.5 flex-shrink-0" />
                                        <span>Membaca dengan benar sesuai kaidah</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="p-6 bg-arabic-bronze text-arabic-sand border-t-2 border-arabic-gold flex flex-col gap-2 rounded-t-[1.5rem]">
                                <div className="flex items-center gap-2 text-[11px] font-bold">
                                    <Calendar className="h-4 w-4 text-arabic-gold" />
                                    <span>2 Sesi per minggu</span>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] font-bold">
                                    <Clock className="h-4 w-4 text-arabic-gold" />
                                    <span>Sabtu & Minggu</span>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] font-bold">
                                    <Sparkles className="h-4 w-4 text-arabic-gold" />
                                    <span>Durasi 1 jam per sesi</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>

                {/* 4. Beautiful Bottom flyer-Banner Section */}
                <section className="max-w-5xl mx-auto px-6 py-8">
                    <div className="bg-arabic-cream/65 border-2 border-arabic-cream rounded-[2.2rem] p-6 grid md:grid-cols-3 gap-6 items-center text-center md:text-left shadow-md">

                        {/* Left Column: Online Class */}
                        <div className="flex flex-col md:flex-row items-center gap-3.5">
                            <div className="w-12 h-12 rounded-full bg-arabic-bronze text-center flex items-center justify-center shadow-sm">
                                <Video className="h-5 w-5 text-arabic-gold" />
                            </div>
                            <div>
                                <span className="text-[10px] uppercase font-bold text-arabic-bronze/60 block">Pembelajaran Online</span>
                                <span className="text-xs font-black text-arabic-bronze mt-0.5 block">via Zoom atau Google Meet</span>
                                <div className="flex items-center justify-center md:justify-start gap-2 mt-1.5">
                                    <Badge className="bg-[#2D8CFF] text-white text-[8px] font-bold py-0.5 rounded-full flex items-center gap-1"><Video className="h-3 w-3" /> Zoom</Badge>
                                    <Badge className="bg-[#00897B] text-white text-[8px] font-bold py-0.5 rounded-full flex items-center gap-1"><Video className="h-3 w-3" /> Google Meet</Badge>
                                </div>
                            </div>
                        </div>

                        {/* Middle Column: WhatsApp info */}
                        <div className="flex flex-col md:flex-row items-center gap-3.5 border-y md:border-y-0 md:border-x border-arabic-cream py-4 md:py-0 md:px-6">
                            <div className="w-12 h-12 rounded-full bg-emerald-500 text-center flex items-center justify-center text-arabic-sand text-2xl shadow-sm">
                                <Phone className="h-5 w-5 text-white animate-pulse" />
                            </div>
                            <div>
                                <span className="text-[10px] uppercase font-bold text-arabic-bronze/60 block">Informasi & Pendaftaran</span>
                                <a href="https://wa.me/6282251985570" target="_blank" rel="noopener noreferrer" className="text-xs font-black text-emerald-600 dark:text-emerald-500 hover:underline mt-0.5 block">
                                    +62 822-5198-5570
                                </a>
                            </div>
                        </div>

                        {/* Right Column: Certificate details */}
                        <div className="flex flex-col md:flex-row items-center gap-3.5">
                            <div className="w-12 h-12 rounded-full bg-arabic-bronze text-center flex items-center justify-center shadow-sm">
                                <Award className="h-5 w-5 text-arabic-gold" />
                            </div>
                            <div>
                                <span className="text-[10px] uppercase font-bold text-arabic-bronze/60 block">Sertifikat Resmi</span>
                                <span className="text-xs font-black text-arabic-bronze mt-0.5 block">Diberikan setelah mencapai tujuan pembelajaran</span>
                            </div>
                        </div>

                    </div>
                </section>

                {/* Calendar Booking Section */}
                <section id="booking-calendar" className="max-w-7xl mx-auto px-6 py-16 md:py-24 border-t border-arabic-cream/65">
                    <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
                        <div className="flex justify-center items-center gap-1.5 text-xs font-black uppercase text-arabic-gold tracking-widest">
                            <span>Daftar Sekarang!</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-serif font-black text-arabic-bronze">Interactive Session Scheduler</h2>
                        <p className="text-sm font-medium text-arabic-bronze/70">
                            Check available teaching slots below and book your private 1-to-1 session in real time.
                        </p>
                    </div>

                    <div className="bg-arabic-sand border-2 border-arabic-cream rounded-[2.5rem] shadow-xl overflow-hidden max-w-4xl mx-auto">
                        <div className="grid md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-arabic-cream">

                            {/* Left Side: Instructions and Date Selector */}
                            <div className="md:col-span-5 p-8 space-y-6">
                                <div className="space-y-2">
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-arabic-gold block">Step 1</span>
                                    <h4 className="font-serif text-lg font-black text-arabic-bronze">Select Learning Date</h4>
                                    <p className="text-xs text-arabic-bronze/70 leading-relaxed font-medium">
                                        Choose one of the highlighted dates from the list to view open hour slots.
                                    </p>
                                </div>

                                {availableDates.length > 0 ? (
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                                        {availableDates.map((dateStr) => {
                                            const slotsCount = getSlotsForDate(dateStr).length;
                                            const isSelected = selectedDate === dateStr;

                                            const formattedDate = new Date(dateStr).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric',
                                            });

                                            return (
                                                <button
                                                    key={dateStr}
                                                    type="button"
                                                    onClick={() => handleSelectDate(dateStr)}
                                                    className={`w-full p-4 rounded-2xl border text-left font-bold text-xs flex justify-between items-center transition ${isSelected
                                                        ? 'border-arabic-gold bg-arabic-gold/10 text-arabic-bronze scale-[1.01]'
                                                        : 'border-arabic-cream bg-arabic-sand hover:border-arabic-gold hover:bg-arabic-cream text-arabic-bronze'
                                                        }`}
                                                >
                                                    <span>{formattedDate}</span>
                                                    <Badge variant="secondary" className="bg-arabic-bronze text-arabic-sand text-[10px]">
                                                        {slotsCount} slots
                                                    </Badge>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-6 border-2 border-dashed border-arabic-cream rounded-2xl text-center">
                                        <Calendar className="h-8 w-8 text-arabic-bronze/30 mx-auto mb-2 animate-bounce" />
                                        <span className="text-xs font-bold text-arabic-bronze/60">No available slots at this time. Please check back later.</span>
                                    </div>
                                )}
                            </div>

                            {/* Right Side: Slots & Booking details */}
                            <div className="md:col-span-7 p-8 bg-arabic-cream/20 flex flex-col justify-between">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-arabic-gold block">Step 2</span>
                                        <h4 className="font-serif text-lg font-black text-arabic-bronze">Choose Hour & Details</h4>
                                    </div>

                                    {selectedDate ? (
                                        <div className="space-y-4">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-arabic-bronze/60 block">
                                                Available slots for {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </span>

                                            <div className="grid grid-cols-2 gap-3 max-h-[160px] overflow-y-auto pr-1">
                                                {getSlotsForDate(selectedDate).map((slot) => {
                                                    const isSelected = selectedSlot?.id === slot.id;
                                                    const startStr = new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                                    return (
                                                        <button
                                                            key={slot.id}
                                                            type="button"
                                                            onClick={() => handleSelectSlot(slot)}
                                                            className={`p-3.5 rounded-xl border text-center font-black text-xs transition ${isSelected
                                                                ? 'border-arabic-bronze bg-arabic-bronze text-arabic-sand'
                                                                : 'border-arabic-cream bg-arabic-sand hover:border-arabic-gold text-arabic-bronze'
                                                                }`}
                                                        >
                                                            {startStr} with {slot.teacher?.name}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {selectedSlot && (
                                                <div className="space-y-4 pt-4 border-t border-arabic-cream animate-in fade-in slide-in-from-top-1 duration-200">

                                                    {/* Select Program */}
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] uppercase font-black text-arabic-bronze/60 block">Select Class Program</label>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {programs.map((prog) => (
                                                                <button
                                                                    key={prog.id}
                                                                    type="button"
                                                                    onClick={() => setSelectedProgramId(prog.id)}
                                                                    className={`p-2.5 rounded-lg border text-center font-bold text-[10px] transition ${selectedProgramId === prog.id
                                                                        ? 'border-arabic-gold bg-arabic-gold/10 text-arabic-bronze font-black'
                                                                        : 'border-arabic-cream bg-arabic-sand hover:bg-arabic-cream text-arabic-bronze'
                                                                        }`}
                                                                >
                                                                    {prog.name.replace(' Program', '')}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Student Notes */}
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] uppercase font-black text-arabic-bronze/60 block">Study Notes (Optional)</label>
                                                        <Textarea
                                                            placeholder="Mention specific areas you'd like to work on (e.g. makhraj, letter pronunciation, vocabulary)..."
                                                            value={notes}
                                                            onChange={(e) => setNotes(e.target.value)}
                                                            className="text-xs min-h-[70px] rounded-xl border-arabic-cream bg-arabic-sand placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-8 border-2 border-dashed border-arabic-cream rounded-2xl text-center space-y-3">
                                            <Clock className="h-8 w-8 text-arabic-bronze/30 mx-auto animate-pulse" />
                                            <p className="text-xs font-bold text-arabic-bronze/60">
                                                Please select a calendar date on the left to see available classes.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Booking Confirmation Action bar */}
                                {selectedSlot && selectedProgramId && (
                                    <div className="pt-6 border-t border-arabic-cream mt-6 animate-in fade-in duration-300">
                                        {user ? (
                                            <form onSubmit={handleConfirmBooking} className="flex items-center justify-between gap-4">
                                                <div className="text-left">
                                                    <span className="text-[9px] uppercase font-bold text-arabic-bronze/60 block">Class Meeting URL</span>
                                                    <span className="text-xs font-black text-arabic-gold flex items-center gap-1 mt-0.5">
                                                        <Video className="h-3.5 w-3.5 text-arabic-emerald animate-pulse" /> Free Video Slot
                                                    </span>
                                                </div>
                                                <Button
                                                    type="submit"
                                                    disabled={bookingForm.processing}
                                                    className="rounded-full bg-arabic-bronze text-arabic-sand font-black text-xs px-6 py-5 hover:bg-arabic-bronze/90 shadow-md flex items-center gap-1.5 transition"
                                                >
                                                    {bookingForm.processing ? 'Booking...' : 'Confirm Booking'}
                                                </Button>
                                            </form>
                                        ) : (
                                            <div className="bg-arabic-sand border border-arabic-cream rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                                                <div>
                                                    <span className="text-[10px] font-black uppercase text-arabic-bronze block">Sign In Required</span>
                                                    <p className="text-[11px] text-arabic-bronze/70 leading-normal mt-0.5">Please login or register to reserve this private slot.</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Link href={login()}>
                                                        <Button size="sm" variant="outline" className="text-xs rounded-xl h-9 border-arabic-bronze/25 hover:bg-arabic-cream text-arabic-bronze">Log In</Button>
                                                    </Link>
                                                    <Link href={register()}>
                                                        <Button size="sm" className="text-xs rounded-xl h-9 bg-arabic-bronze hover:bg-arabic-bronze/90 text-arabic-sand">Sign Up</Button>
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
                <footer className="bg-arabic-bronze text-arabic-sand border-t border-arabic-bronze rounded-t-[3rem] py-12 px-6">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 border-b border-arabic-sand/15 pb-8 mb-8">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-arabic-sand flex items-center justify-center text-arabic-bronze font-serif text-xl">
                                🕌
                            </div>
                            <div>
                                <span className="font-serif text-lg font-black tracking-wide block leading-none">AL-QURAN</span>
                                <span className="text-[9px] uppercase font-bold tracking-widest text-arabic-gold">Arabic Academy</span>
                            </div>
                        </div>
                        <div className="flex gap-6 text-xs font-bold text-arabic-sand/75">
                            <a href="#programs" className="hover:text-arabic-gold transition">Programs</a>
                            <a href="#booking-calendar" className="hover:text-arabic-gold transition">Book Session</a>
                            <Link href="/login" className="hover:text-arabic-gold transition">Login</Link>
                            <Link href="/register" className="hover:text-arabic-gold transition">Register</Link>
                        </div>
                    </div>
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-[10px] text-arabic-sand/50 font-bold uppercase tracking-wider gap-4">
                        <span>© 2026 Al-Quran Arabic Academy. All rights reserved.</span>
                        <div className="flex items-center gap-1.5 text-arabic-gold">
                            <MessageSquare className="h-4 w-4" />
                            <span>WhatsApp: +62 822-5198-5570</span>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
