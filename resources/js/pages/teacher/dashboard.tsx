import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { BookOpen, Calendar, Clock, CheckCircle2, User, Plus, X, Video, Award, MessageSquare } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { dashboard } from '@/routes';
import { dashboard as teacherDashboard } from '@/routes/teacher';
import { store as storeSlot, destroy as destroySlot } from '@/routes/teacher/slots';
import { complete as completeBooking } from '@/routes/teacher/bookings';

interface Slot {
    id: number;
    start_time: string;
    end_time: string;
    is_booked: boolean;
}

interface Booking {
    id: number;
    student_id: number;
    slot_id: number;
    program_id: number;
    status: string;
    video_platform: string;
    video_url: string;
    student_notes?: string;
    teacher_feedback?: string;
    student: {
        name: string;
        email: string;
    };
    slot: {
        start_time: string;
        end_time: string;
    };
    program: {
        name: string;
    };
}

interface TeacherDashboardProps {
    slots: Slot[];
    bookings: Booking[];
    programs: any[];
}

export default function TeacherDashboard({
    slots = [],
    bookings = [],
    programs = [],
}: TeacherDashboardProps) {
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    // Slot Creation Form
    const slotForm = useForm({
        start_time: '',
    });

    const handleCreateSlot = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!slotForm.data.start_time) {
            toast.error('Please choose a start date & time.');
            return;
        }

        slotForm.post(storeSlot().url, {
            onSuccess: () => {
                slotForm.reset();
                toast.success('Alhamdulillah! Teaching hour opened successfully!');
            },
            onError: (err: any) => {
                toast.error(err.error || 'Failed to open slot. Check overlapping times.');
            },
        });
    };

    // Slot Delete Form
    const deleteSlotForm = useForm({});
    const handleDeleteSlot = (slotId: number) => {
        if (confirm('Are you sure you want to close this teaching slot?')) {
            deleteSlotForm.delete(destroySlot.url(slotId), {
                onSuccess: () => {
                    toast.success('Slot closed successfully.');
                },
                onError: (err: any) => {
                    toast.error(err.error || 'Failed to close slot.');
                },
            });
        }
    };

    // Booking Feedback and Completion Form
    const completionForm = useForm({
        teacher_feedback: '',
        issue_certificate: false,
    });

    const handleCompleteBookingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedBooking) return;
        if (completionForm.data.teacher_feedback.length < 10) {
            toast.error('Feedback must be at least 10 characters long.');
            return;
        }

        completionForm.post(completeBooking.url(selectedBooking.id), {
            onSuccess: () => {
                setSelectedBooking(null);
                completionForm.reset();
                toast.success('Class marked as completed! Student progress report has been filed.');
            },
            onError: (err: any) => {
                toast.error(err.error || 'Failed to complete session.');
            },
        });
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Teacher Portal', href: teacherDashboard() },
    ];

    // Filter upcoming booked sessions
    const upcomingBooked = bookings.filter(
        (b) => b.status === 'confirmed' && new Date(b.slot.start_time) >= new Date()
    );

    // Filter previous booked sessions (need feedback logging)
    const pendingFeedback = bookings.filter(
        (b) => b.status === 'confirmed' && new Date(b.slot.start_time) < new Date()
    );

    // Filter finished sessions
    const completedBookings = bookings.filter((b) => b.status === 'completed');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Teacher Portal" />

            <div className="p-6 max-w-7xl mx-auto space-y-8 bg-arabic-sand/20 min-h-screen">
                
                {/* Header Welcome Bar */}
                <div className="border-b border-arabic-cream/60 pb-6">
                    <h1 className="font-serif text-3xl font-black text-arabic-bronze">Teacher Portal</h1>
                    <p className="text-xs text-arabic-bronze/70 font-medium mt-1">Manage your available hours, connect with private students on Zoom/Meet, and submit progress feedback reports.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Column: Schedule planner and slot creation */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        {/* 1. Open new slot Hour form */}
                        <Card className="bg-arabic-sand border border-arabic-cream rounded-[1.5rem] shadow-sm">
                            <CardHeader className="p-5 pb-2">
                                <CardTitle className="text-sm font-black text-arabic-bronze flex items-center gap-1.5">
                                    <Plus className="h-4 w-4 text-arabic-gold" /> Open Teaching Hour
                                </CardTitle>
                                <CardDescription className="text-[11px] font-medium text-arabic-bronze/70">
                                    Create a 1-hour private session slot for students to book.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-5 pt-2">
                                <form onSubmit={handleCreateSlot} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase font-bold text-arabic-bronze/60 block">Class Start Time</label>
                                        <Input
                                            type="datetime-local"
                                            value={slotForm.data.start_time}
                                            onChange={(e) => slotForm.setData('start_time', e.target.value)}
                                            className="text-xs rounded-xl border-arabic-cream bg-arabic-sand placeholder:text-arabic-bronze/40 focus:border-arabic-gold focus-visible:ring-0"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={slotForm.processing}
                                        className="w-full rounded-xl bg-arabic-bronze hover:bg-arabic-bronze/90 text-arabic-sand font-bold text-xs h-10 shadow-sm"
                                    >
                                        {slotForm.processing ? 'Opening...' : 'Open Slot'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* 2. List of opened hour slots */}
                        <div className="space-y-3">
                            <h3 className="font-serif text-lg font-black text-arabic-bronze flex items-center gap-2">
                                <Clock className="h-4.5 w-4.5 text-arabic-gold" /> Hour Slots List
                            </h3>
                            
                            {slots.length > 0 ? (
                                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                                    {slots.map((slot) => {
                                        const startTime = new Date(slot.start_time);
                                        const formattedTime = startTime.toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                        }) + ' @ ' + startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                        return (
                                            <div
                                                key={slot.id}
                                                className="bg-arabic-sand border border-arabic-cream rounded-xl p-3 flex justify-between items-center text-xs font-semibold"
                                            >
                                                <span className="text-arabic-bronze">{formattedTime}</span>
                                                <div className="flex items-center gap-2">
                                                    {slot.is_booked ? (
                                                        <Badge className="bg-arabic-gold text-arabic-bronze text-[9px] font-bold rounded-full">
                                                            Booked
                                                        </Badge>
                                                    ) : (
                                                        <>
                                                            <Badge variant="outline" className="border-arabic-cream text-arabic-bronze/60 text-[9px] font-bold rounded-full">
                                                                Available
                                                            </Badge>
                                                            <button
                                                                onClick={() => handleDeleteSlot(slot.id)}
                                                                className="p-1 hover:bg-rose-500/10 text-rose-500 rounded-lg transition"
                                                            >
                                                                <X className="h-3.5 w-3.5" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-6 bg-arabic-sand border border-arabic-cream rounded-2xl text-center text-xs font-bold text-arabic-bronze/60">
                                    No teaching hour slots created yet. Use the card above to open hours.
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Right Column: Dynamic Student bookings grid */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* 1. Pending session assessments / feedback logging */}
                        {pendingFeedback.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="font-serif text-xl font-black text-rose-600 flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5 text-rose-500 animate-bounce" /> Log Students Assessment Progress
                                </h3>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    {pendingFeedback.map((booking) => {
                                        const startTime = new Date(booking.slot.start_time);
                                        const formattedTime = startTime.toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                        }) + ' @ ' + startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                        return (
                                            <Card key={booking.id} className="relative bg-arabic-sand border border-rose-500/20 rounded-[1.5rem] shadow-sm flex flex-col justify-between overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500" />
                                                <CardHeader className="p-5 pb-2">
                                                    <div className="flex items-center justify-between">
                                                        <Badge variant="secondary" className="bg-rose-100 text-rose-700 text-[9px] font-bold uppercase rounded-full">
                                                            {booking.program.name}
                                                        </Badge>
                                                        <span className="text-[10px] font-black text-rose-600">Pending Feedback</span>
                                                    </div>
                                                    <CardTitle className="text-sm font-black mt-2 text-arabic-bronze">
                                                        {booking.student.name}
                                                    </CardTitle>
                                                    <CardDescription className="text-[11px] font-medium text-arabic-bronze/70 mt-1">
                                                        Session held on {formattedTime}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="p-5 pt-2 pb-4">
                                                    {booking.student_notes && (
                                                        <p className="text-[10px] text-arabic-bronze/70 font-medium italic">
                                                            Student note: "{booking.student_notes}"
                                                        </p>
                                                    )}
                                                </CardContent>
                                                <CardFooter className="p-5 pt-2 border-t border-arabic-cream/45 bg-arabic-cream/10">
                                                    <Button
                                                        onClick={() => setSelectedBooking(booking)}
                                                        className="w-full rounded-xl bg-rose-600 hover:bg-rose-700 text-arabic-sand font-bold text-xs h-9 shadow-sm"
                                                    >
                                                        Log Assessment report
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 2. Upcoming Active Classes */}
                        <div className="space-y-4">
                            <h3 className="font-serif text-xl font-black text-arabic-bronze flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-arabic-gold" /> Upcoming Booked Classes
                            </h3>

                            {upcomingBooked.length > 0 ? (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {upcomingBooked.map((booking) => {
                                        const startTime = new Date(booking.slot.start_time);
                                        const formattedTime = startTime.toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                        }) + ' @ ' + startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                        return (
                                            <Card key={booking.id} className="relative bg-arabic-sand border border-arabic-cream rounded-[1.5rem] shadow-sm flex flex-col justify-between overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1.5 h-full bg-arabic-gold" />
                                                <CardHeader className="p-5 pb-2">
                                                    <div className="flex items-center justify-between">
                                                        <Badge variant="secondary" className="bg-arabic-cream text-arabic-bronze text-[9px] font-bold uppercase rounded-full">
                                                            {booking.program.name.replace(' Program', '')}
                                                        </Badge>
                                                        <span className="text-[10px] font-black text-arabic-emerald">Booked</span>
                                                    </div>
                                                    <CardTitle className="text-sm font-black mt-2 text-arabic-bronze">
                                                        Student: {booking.student.name}
                                                    </CardTitle>
                                                    <CardDescription className="text-[11px] font-medium text-arabic-bronze/70 mt-1">
                                                        Scheduled for {formattedTime}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="p-5 pt-2 pb-4 space-y-3">
                                                    {booking.student_notes && (
                                                        <div className="p-3 bg-arabic-cream/30 border border-arabic-cream/60 rounded-xl text-[10px] text-arabic-bronze/80 font-medium">
                                                            <span className="font-bold block mb-0.5 text-arabic-bronze">Intentions:</span>
                                                            "{booking.student_notes}"
                                                        </div>
                                                    )}
                                                </CardContent>
                                                <CardFooter className="p-5 pt-2 border-t border-arabic-cream/45 bg-arabic-cream/15">
                                                    <a href={booking.video_url} target="_blank" rel="noopener noreferrer" className="w-full">
                                                        <Button className="w-full rounded-xl bg-arabic-bronze hover:bg-arabic-bronze/90 text-arabic-sand font-bold text-xs h-9 gap-1.5 shadow-sm">
                                                            <Video className="h-4 w-4 text-arabic-gold animate-bounce" /> Open Meeting link
                                                        </Button>
                                                    </a>
                                                </CardFooter>
                                            </Card>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-8 bg-arabic-sand border border-arabic-cream rounded-[2rem] text-center text-xs font-bold text-arabic-bronze/60">
                                    No upcoming sessions have been booked yet. Opened slots will appear on the calendar for students.
                                </div>
                            )}
                        </div>

                        {/* 3. Completed classes history list */}
                        <div className="space-y-4">
                            <h3 className="font-serif text-xl font-black text-arabic-bronze flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-arabic-gold" /> Finished Class Logs
                            </h3>

                            {completedBookings.length > 0 ? (
                                <div className="space-y-3">
                                    {completedBookings.map((booking) => {
                                        const dateStr = new Date(booking.slot.start_time).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        });

                                        return (
                                            <div
                                                key={booking.id}
                                                className="bg-arabic-sand border border-arabic-cream rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-semibold"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="p-3 bg-arabic-cream rounded-xl text-lg">🎓</div>
                                                    <div>
                                                        <span className="text-xs font-black text-arabic-bronze block">Student: {booking.student.name}</span>
                                                        <span className="text-[10px] text-arabic-bronze/60 block mt-1 font-medium">Program: {booking.program.name} • Completed on {dateStr}</span>
                                                    </div>
                                                </div>
                                                <div className="p-3 bg-arabic-cream/35 border border-arabic-cream/60 rounded-xl text-[10px] text-arabic-bronze/70 leading-normal max-w-sm">
                                                    <span className="font-bold text-arabic-bronze block mb-0.5">My Logged Feedback:</span>
                                                    "{booking.teacher_feedback}"
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-8 bg-arabic-sand border border-arabic-cream rounded-[2rem] text-center text-xs font-bold text-arabic-bronze/60">
                                    No completed lessons recorded in your system yet.
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                {/* Progress Log Submission Modal Drawer */}
                {selectedBooking && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-arabic-bronze/45 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-arabic-sand border-2 border-arabic-cream w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="bg-arabic-cream/60 px-6 py-4 flex items-center justify-between border-b border-arabic-cream">
                                <div>
                                    <span className="text-[9px] uppercase font-bold tracking-widest text-arabic-gold block">Log Progress Report</span>
                                    <h4 className="font-serif text-base font-black text-arabic-bronze">Recap for {selectedBooking.student.name}</h4>
                                </div>
                                <button
                                    onClick={() => setSelectedBooking(null)}
                                    className="p-2 hover:bg-arabic-cream rounded-full transition text-arabic-bronze/60 hover:text-arabic-bronze"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCompleteBookingSubmit}>
                                <div className="p-6 space-y-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase font-black text-arabic-bronze/60 block">Class Program</label>
                                        <span className="text-xs font-bold text-arabic-bronze block">{selectedBooking.program.name}</span>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase font-black text-arabic-bronze/60 block">Detailed Performance Feedback</label>
                                        <Textarea
                                            placeholder="Write constructive progress comments on student pronunciation accuracy, surah mastery, tajweed rules learned, etc..."
                                            value={completionForm.data.teacher_feedback}
                                            onChange={(e) => completionForm.setData('teacher_feedback', e.target.value)}
                                            className="text-xs min-h-[120px] rounded-xl border-arabic-cream bg-arabic-sand placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                        />
                                        <span className="text-[10px] text-arabic-bronze/50 leading-relaxed block">Student will immediately view these notes on their portal.</span>
                                    </div>

                                    <div className="flex items-start gap-2.5 p-4 bg-arabic-gold/10 border border-arabic-gold/30 rounded-2xl">
                                        <Checkbox
                                            id="issue_cert"
                                            checked={completionForm.data.issue_certificate}
                                            onCheckedChange={(checked) => completionForm.setData('issue_certificate', !!checked)}
                                            className="border-arabic-gold data-[state=checked]:bg-arabic-gold data-[state=checked]:text-arabic-bronze mt-0.5"
                                        />
                                        <div>
                                            <label htmlFor="issue_cert" className="text-xs font-black text-arabic-bronze block cursor-pointer">
                                                Award Program Completion Certificate
                                            </label>
                                            <p className="text-[10px] text-arabic-bronze/80 leading-normal mt-0.5 font-medium">
                                                If the student has fully completed all rules, lessons, and surahs required for **{selectedBooking.program.name}**, award their official platform credentials.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-arabic-cream/30 px-6 py-4 flex justify-end gap-2 border-t border-arabic-cream">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setSelectedBooking(null)}
                                        className="rounded-full border-arabic-bronze/25 hover:bg-arabic-cream text-arabic-bronze text-xs font-bold"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={completionForm.processing}
                                        className="rounded-full bg-arabic-bronze hover:bg-arabic-bronze/90 text-arabic-sand text-xs font-bold px-6 shadow-sm"
                                    >
                                        {completionForm.processing ? 'Submitting...' : 'Mark as Completed'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </AppLayout>
    );
}
