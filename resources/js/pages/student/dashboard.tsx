import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { BookOpen, Calendar, Clock, Award, Video, AlertCircle, FileText, ChevronRight, Check, X, ArrowUpRight, CreditCard, Sliders } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { dashboard } from '@/routes';
import { dashboard as studentDashboard } from '@/routes/student';
import { destroy as destroyBooking } from '@/routes/bookings';
import { verify as verifyCertificate } from '@/routes/certificates';

interface Slot {
    id: number;
    start_time: string;
    end_time: string;
    is_booked: boolean;
    teacher?: {
        name: string;
        avatar?: string;
    };
}

interface Booking {
    id: number;
    student_id: number;
    slot_id: number;
    program_id: number;
    status: string;
    video_platform: string;
    video_url: string;
    teacher_feedback?: string;
    student_notes?: string;
    slot: {
        start_time: string;
        end_time: string;
        teacher: {
            name: string;
            avatar?: string;
            teacher_profile?: {
                whatsapp_number: string;
            };
        };
    };
    program: {
        name: string;
    };
}

interface Certificate {
    id: number;
    verification_hash: string;
    issued_at: string;
    notes?: string;
    program: {
        name: string;
    };
}

interface StudentDashboardProps {
    upcomingBookings: Booking[];
    pastBookings: Booking[];
    certificates: Certificate[];
    availableSlots: Slot[];
    programs: any[];
}

export default function StudentDashboard({
    upcomingBookings = [],
    pastBookings = [],
    certificates = [],
    availableSlots = [],
    programs = [],
}: StudentDashboardProps) {
    const { auth } = usePage<any>().props;
    const user = auth?.user;

    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    const cancelForm = useForm({});

    const handleCancelSubscription = (e: React.FormEvent) => {
        e.preventDefault();
        if (confirm('Are you sure you want to cancel your Al-Quran subscription? Your booking limit will revert to 1 lesson trial.')) {
            cancelForm.post('/subscription/cancel', {
                onSuccess: () => {
                    toast.success('Your subscription has been successfully canceled.');
                },
                onError: (err: any) => {
                    toast.error(err.error || 'Failed to cancel subscription.');
                },
            });
        }
    };

    const handleCancelBooking = (bookingId: number) => {
        if (confirm('Are you sure you want to cancel this scheduled learning session?')) {
            cancelForm.delete(destroyBooking.url(bookingId), {
                onSuccess: () => {
                    toast.success('Alhamdulillah! Your booking has been cancelled and the slot is open.');
                },
                onError: (err: any) => {
                    toast.error(err.error || 'Failed to cancel session.');
                },
            });
        }
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Student Portal', href: studentDashboard() },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Student Portal" />

            <div className="p-6 max-w-7xl mx-auto space-y-8 bg-arabic-sand/20 min-h-screen">
                
                {/* Header Welcome Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-arabic-cream/60 pb-6">
                    <div>
                        <h1 className="font-serif text-3xl font-black text-arabic-bronze">Ahlan wa Sahlan!</h1>
                        <p className="text-xs text-arabic-bronze/70 font-medium mt-1">Manage your private Al-Quran sessions, review teacher feedback, and view earned certifications.</p>
                    </div>
                    <Link href="/">
                        <Button className="rounded-full bg-arabic-gold text-arabic-bronze font-black text-xs hover:bg-arabic-gold/90 transition shadow-md gap-1">
                            Book Another Session <ArrowUpRight className="h-3.5 w-3.5" />
                        </Button>
                    </Link>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Grid: Upcoming & Past classes */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* 1. Upcoming confirmed Sessions */}
                        <div className="space-y-4">
                            <h3 className="font-serif text-xl font-black text-arabic-bronze flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-arabic-gold" /> Upcoming Private Classes
                            </h3>

                            {upcomingBookings.length > 0 ? (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {upcomingBookings.map((booking) => {
                                        const startTime = new Date(booking.slot.start_time);
                                        const endTime = new Date(booking.slot.end_time);
                                        
                                        const formattedDate = startTime.toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                        });

                                        const formattedTime = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                        return (
                                            <Card key={booking.id} className="relative bg-arabic-sand border border-arabic-cream rounded-[1.5rem] shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1.5 h-full bg-arabic-gold" />
                                                
                                                <CardHeader className="p-5 pb-2">
                                                    <div className="flex items-center justify-between">
                                                        <Badge variant="secondary" className="bg-arabic-cream text-arabic-bronze text-[9px] font-bold uppercase rounded-full">
                                                            {booking.program.name.replace(' Program', '')}
                                                        </Badge>
                                                        <span className="text-[10px] font-black text-arabic-emerald flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-arabic-emerald animate-pulse" /> Scheduled
                                                        </span>
                                                    </div>
                                                    <CardTitle className="text-sm font-black mt-2 text-arabic-bronze">
                                                        Class with {booking.slot.teacher.name}
                                                    </CardTitle>
                                                    <CardDescription className="text-[11px] font-medium text-arabic-bronze/70 flex items-center gap-1 mt-1">
                                                        <Clock className="h-3.5 w-3.5 text-arabic-gold" /> {formattedDate} @ {formattedTime}
                                                    </CardDescription>
                                                </CardHeader>

                                                <CardContent className="p-5 pt-2 pb-4 space-y-3">
                                                    {booking.student_notes && (
                                                        <div className="p-3 bg-arabic-cream/35 border border-arabic-cream/60 rounded-xl text-[10px] text-arabic-bronze/80 font-medium">
                                                            <span className="font-bold block mb-0.5 text-arabic-bronze">My Notes:</span>
                                                            "{booking.student_notes}"
                                                        </div>
                                                    )}
                                                </CardContent>

                                                <CardFooter className="p-5 pt-2 flex gap-2 border-t border-arabic-cream/45 bg-arabic-cream/15">
                                                    <a href={booking.video_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                                                        <Button className="w-full rounded-xl bg-arabic-bronze hover:bg-arabic-bronze/90 text-arabic-sand font-bold text-xs h-9 gap-1.5 shadow-sm">
                                                            <Video className="h-4 w-4 text-arabic-gold animate-bounce" /> Join Video
                                                        </Button>
                                                    </a>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => handleCancelBooking(booking.id)}
                                                        className="rounded-xl border border-rose-500/25 text-rose-600 hover:bg-rose-500/10 text-xs h-9"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-8 bg-arabic-sand border border-arabic-cream rounded-[2rem] text-center space-y-3">
                                    <AlertCircle className="h-8 w-8 text-arabic-bronze/30 mx-auto" />
                                    <p className="text-xs font-bold text-arabic-bronze/60">You have no upcoming private classes scheduled.</p>
                                    <Link href="/">
                                        <Button size="sm" className="bg-arabic-bronze text-arabic-sand rounded-full text-[11px] h-8 mt-1">Book Class Now</Button>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* 2. Previous classes and Feedback logger */}
                        <div className="space-y-4">
                            <h3 className="font-serif text-xl font-black text-arabic-bronze flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-arabic-gold" /> Previous Sessions & Progress History
                            </h3>

                            {pastBookings.length > 0 ? (
                                <div className="space-y-3">
                                    {pastBookings.map((booking) => {
                                        const dateStr = new Date(booking.slot.start_time).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        });

                                        return (
                                            <div
                                                key={booking.id}
                                                onClick={() => setSelectedBooking(booking)}
                                                className="bg-arabic-sand border border-arabic-cream rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-arabic-gold/50 cursor-pointer hover:bg-arabic-cream/20 transition"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="p-3 bg-arabic-cream rounded-xl text-lg">🏫</div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-black text-arabic-bronze">{booking.program.name}</span>
                                                            <Badge variant="secondary" className="bg-arabic-cream text-arabic-bronze text-[9px] uppercase font-bold px-1.5 py-0">
                                                                {booking.slot.teacher.name}
                                                            </Badge>
                                                        </div>
                                                        <span className="text-[10px] text-arabic-bronze/60 block mt-1 font-medium">{dateStr}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 self-end sm:self-center">
                                                    {booking.teacher_feedback ? (
                                                        <Badge className="bg-arabic-gold text-arabic-bronze text-[9px] font-bold rounded-full py-0.5 px-2">
                                                            Feedback Available
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="border-arabic-cream text-arabic-bronze/60 text-[9px] font-bold rounded-full py-0.5 px-2">
                                                            Finished
                                                        </Badge>
                                                    )}
                                                    <ChevronRight className="h-4 w-4 text-arabic-bronze/40" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-8 bg-arabic-sand border border-arabic-cream rounded-[2rem] text-center text-xs font-bold text-arabic-bronze/60">
                                    No completed sessions yet. Once your teacher completes a class, progress details will appear here.
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Right Grid: Certificates Panel */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="space-y-4">
                            <h3 className="font-serif text-xl font-black text-arabic-bronze flex items-center gap-2">
                                <Award className="h-5 w-5 text-arabic-gold" /> My Certificates
                            </h3>

                            {certificates.length > 0 ? (
                                <div className="space-y-3">
                                    {certificates.map((cert) => {
                                        const issueDate = new Date(cert.issued_at).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric',
                                        });

                                        return (
                                            <Card key={cert.id} className="relative bg-arabic-sand border border-arabic-cream rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-md transition">
                                                <div className="absolute top-0 right-0 left-0 bg-arabic-gold h-1" />
                                                <CardHeader className="p-5 pb-2">
                                                    <Award className="h-8 w-8 text-arabic-gold mb-2" />
                                                    <CardTitle className="text-xs font-black text-arabic-bronze uppercase tracking-wider">
                                                        Certificate of Completion
                                                    </CardTitle>
                                                    <CardDescription className="text-xs font-bold text-arabic-gold mt-1">
                                                        {cert.program.name}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="p-5 pt-2 pb-4 text-[10px] text-arabic-bronze/70 leading-relaxed font-medium">
                                                    {cert.notes}
                                                    <span className="block mt-2 font-bold text-arabic-bronze">Issued on: {issueDate}</span>
                                                </CardContent>
                                                <CardFooter className="p-5 pt-2 border-t border-arabic-cream/45 bg-arabic-cream/15">
                                                    <Link href={verifyCertificate(cert.verification_hash)} className="w-full">
                                                        <Button className="w-full rounded-xl bg-arabic-bronze hover:bg-arabic-bronze/90 text-arabic-sand font-bold text-xs h-9 shadow-sm gap-1">
                                                            View Credential <ArrowUpRight className="h-3.5 w-3.5 text-arabic-gold" />
                                                        </Button>
                                                    </Link>
                                                </CardFooter>
                                            </Card>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-8 bg-arabic-sand border border-arabic-cream rounded-[2rem] text-center space-y-2">
                                    <Award className="h-8 w-8 text-arabic-bronze/30 mx-auto" />
                                    <span className="text-xs font-bold text-arabic-bronze/60 block">No certificates earned yet.</span>
                                    <p className="text-[10px] text-arabic-bronze/50 leading-relaxed max-w-[200px] mx-auto">Complete program levels and receive recommendations from your teacher to earn certificates.</p>
                                </div>
                            )}
                        </div>

                        {/* 3. Subscription Billing Plan Widget */}
                        <div className="space-y-4 pt-4 border-t border-arabic-cream/60">
                            <h3 className="font-serif text-xl font-black text-arabic-bronze flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-arabic-gold" /> My Subscription Plan
                            </h3>
                            <Card className="relative bg-arabic-sand border border-arabic-cream rounded-[1.5rem] overflow-hidden shadow-sm hover:shadow-md transition">
                                <div className="absolute top-0 right-0 left-0 bg-[#d4af37] h-1" />
                                <CardHeader className="p-5 pb-2">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-0.5">
                                            <span className="text-[9px] uppercase font-black text-arabic-gold block">Billing Plan</span>
                                            <CardTitle className="text-sm font-black text-arabic-bronze uppercase tracking-wide">
                                                {user?.subscription_plan === 'pro' && 'Monthly Pro Plan'}
                                                {user?.subscription_plan === 'premium' && 'Premium Tajweed'}
                                                {(user?.subscription_plan !== 'pro' && user?.subscription_plan !== 'premium') && 'Free Trial Account'}
                                            </CardTitle>
                                        </div>
                                        <Badge className={`text-[9px] font-bold rounded-full py-0.5 px-2 uppercase shadow-sm
                                            ${user?.subscription_status === 'active' ? 'bg-[#28a745] text-white animate-pulse' : 'bg-arabic-cream text-arabic-bronze/60'}`}>
                                            {user?.subscription_status === 'active' ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-5 pt-2 pb-4 text-xs text-arabic-bronze/70 leading-relaxed font-semibold space-y-3 select-none">
                                    <p>
                                        {user?.subscription_plan === 'pro' && 'Up to 8 private 1-to-1 Quranic lessons per month.'}
                                        {user?.subscription_plan === 'premium' && 'Unlimited private lessons with priority booking.'}
                                        {(user?.subscription_plan !== 'pro' && user?.subscription_plan !== 'premium') && '1 free Quranic lesson trial. Upgrade to book more sessions.'}
                                    </p>
                                    {user?.subscription_ends_at && (
                                        <div className="flex justify-between items-center bg-arabic-cream/35 border border-arabic-cream/80 p-2.5 rounded-xl text-[10px]">
                                            <span className="text-arabic-bronze/65">Renewal/Ends Date</span>
                                            <span className="font-extrabold text-arabic-bronze font-mono">
                                                {new Date(user.subscription_ends_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="p-5 pt-2 border-t border-arabic-cream/45 bg-arabic-cream/15 flex flex-col gap-2">
                                    <Link href="/subscription" className="w-full">
                                        <Button className="w-full rounded-xl bg-arabic-gold hover:bg-arabic-gold/90 text-arabic-bronze font-black text-xs h-9 shadow-sm gap-1.5">
                                            <Sliders className="h-4 w-4" /> Manage Subscription & Upgrade
                                        </Button>
                                    </Link>
                                    {user?.subscription_status === 'active' && (
                                        <form onSubmit={handleCancelSubscription} className="w-full">
                                            <button 
                                                type="submit"
                                                disabled={cancelForm.processing}
                                                className="w-full text-center text-[10px] font-black text-[#e74c3c] hover:underline pt-1 select-none cursor-pointer"
                                            >
                                                Cancel subscription billing renewal
                                            </button>
                                        </form>
                                    )}
                                </CardFooter>
                            </Card>
                        </div>

                    </div>
                </div>

                {/* Progress Details / Teacher Feedback Modal Drawer */}
                {selectedBooking && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-arabic-bronze/45 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-arabic-sand border-2 border-arabic-cream w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="bg-arabic-cream/60 px-6 py-4 flex items-center justify-between border-b border-arabic-cream">
                                <div>
                                    <span className="text-[9px] uppercase font-bold tracking-widest text-arabic-gold block">Class Recap</span>
                                    <h4 className="font-serif text-base font-black text-arabic-bronze">{selectedBooking.program.name}</h4>
                                </div>
                                <button
                                    onClick={() => setSelectedBooking(null)}
                                    className="p-2 hover:bg-arabic-cream rounded-full transition text-arabic-bronze/60 hover:text-arabic-bronze"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="flex justify-between items-center bg-arabic-cream/20 border border-arabic-cream rounded-xl p-3 text-[11px] font-bold">
                                    <div>
                                        <span className="text-[9px] text-arabic-bronze/60 block">Teacher</span>
                                        <span className="text-arabic-bronze">{selectedBooking.slot.teacher.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[9px] text-arabic-bronze/60 block">Date</span>
                                        <span className="text-arabic-bronze">
                                            {new Date(selectedBooking.slot.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-[10px] uppercase font-black text-arabic-bronze/60 block">Teacher Assessment & Feedback</span>
                                    <div className="p-4 bg-arabic-cream/40 border border-arabic-cream rounded-2xl text-xs text-arabic-bronze/90 leading-relaxed font-medium min-h-[120px] whitespace-pre-line">
                                        {selectedBooking.teacher_feedback || "The teacher hasn't logged the progress feedback for this session yet."}
                                    </div>
                                </div>

                                {selectedBooking.student_notes && (
                                    <div className="space-y-1">
                                        <span className="text-[10px] uppercase font-black text-arabic-bronze/60 block">My Study Intentions</span>
                                        <p className="text-xs text-arabic-bronze/80 font-medium italic">"{selectedBooking.student_notes}"</p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-arabic-cream/30 px-6 py-4 flex justify-end border-t border-arabic-cream">
                                <Button
                                    onClick={() => setSelectedBooking(null)}
                                    className="rounded-full bg-arabic-bronze hover:bg-arabic-bronze/90 text-arabic-sand text-xs font-bold px-6"
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </AppLayout>
    );
}
