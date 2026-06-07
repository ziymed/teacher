import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import {
    BookOpen,
    Calendar,
    Clock,
    CheckCircle2,
    User,
    Plus,
    X,
    Video,
    Award,
    MessageSquare,
    GripVertical,
    RefreshCw,
    Pen,
} from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { dashboard } from '@/routes';
import { dashboard as teacherDashboard } from '@/routes/teacher';
import {
    store as storeSlot,
    destroy as destroySlot,
    batch as batchSlots,
} from '@/routes/teacher/slots';
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
    const { auth } = usePage<any>().props;
    const user = auth?.user;

    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(
        null,
    );
    const [editingSlot, setEditingSlot] = useState<Slot | null>(null);
    const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');

    const editSlotForm = useForm({
        start_time: '',
        duration: '60',
    });

    const batchForm = useForm({
        start_date: '',
        end_date: '',
        duration: '60',
    });

    const formatForDateTimeLocal = (dateTimeStr: string) => {
        const date = new Date(dateTimeStr);
        const pad = (num: number) => String(num).padStart(2, '0');
        const yyyy = date.getFullYear();
        const mm = pad(date.getMonth() + 1);
        const dd = pad(date.getDate());
        const hh = pad(date.getHours());
        const min = pad(date.getMinutes());
        return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    };

    const defaultLayout = {
        left: ['create_slot', 'slots_list'],
        right: ['pending_feedback', 'upcoming_classes', 'completed_logs'],
    };

    const [layout, setLayout] = useState(() => {
        if (
            user?.dashboard_layout &&
            typeof user.dashboard_layout === 'object'
        ) {
            const saved = user.dashboard_layout;
            if (Array.isArray(saved.left) && Array.isArray(saved.right)) {
                return saved;
            }
        }
        return defaultLayout;
    });

    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [draggingCol, setDraggingCol] = useState<'left' | 'right' | null>(
        null,
    );
    const [dragOverId, setDragOverId] = useState<string | null>(null);

    const handleDragStart = (
        e: React.DragEvent,
        id: string,
        col: 'left' | 'right',
    ) => {
        setDraggingId(id);
        setDraggingCol(col);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', id);
    };

    const handleDragOver = (e: React.DragEvent, id: string) => {
        e.preventDefault();
        setDragOverId(id);
    };

    const handleDragLeave = () => {
        setDragOverId(null);
    };

    const handleDrop = (
        e: React.DragEvent,
        targetIndex: number,
        targetCol: 'left' | 'right',
    ) => {
        e.preventDefault();
        setDragOverId(null);
        if (!draggingId || !draggingCol) return;

        const sourceList = [...layout[draggingCol]];
        const targetList =
            draggingCol === targetCol ? sourceList : [...layout[targetCol]];

        const sourceIndex = sourceList.indexOf(draggingId);
        if (sourceIndex > -1) {
            sourceList.splice(sourceIndex, 1);
        }

        targetList.splice(targetIndex, 0, draggingId);

        const newLayout = {
            ...layout,
            [draggingCol]: sourceList,
            [targetCol]: targetList,
        };

        if (draggingCol === targetCol) {
            newLayout[targetCol] = targetList;
        }

        setLayout(newLayout);
        setDraggingId(null);
        setDraggingCol(null);

        router.post(
            '/dashboard/layout',
            {
                dashboard_layout: newLayout,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        'Alhamdulillah! Dashboard layout updated successfully.',
                    );
                },
            },
        );
    };

    const handleResetLayout = () => {
        setLayout(defaultLayout);
        router.post(
            '/dashboard/layout',
            {
                dashboard_layout: defaultLayout,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        'Alhamdulillah! Dashboard layout reset successfully.',
                    );
                },
            },
        );
    };

    // Slot Creation Form
    const slotForm = useForm({
        start_time: '',
        duration: '60',
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
                toast.success(
                    'Alhamdulillah! Teaching hour opened successfully!',
                );
            },
            onError: (err: any) => {
                toast.error(
                    err.error ||
                        'Failed to open slot. Check overlapping times.',
                );
            },
        });
    };

    const handleBatchCreateSlots = (e: React.FormEvent) => {
        e.preventDefault();

        if (!batchForm.data.start_date || !batchForm.data.end_date) {
            toast.error('Please choose a start date & end date.');
            return;
        }

        batchForm.post(batchSlots().url, {
            onSuccess: () => {
                batchForm.reset();
                toast.success(
                    'Alhamdulillah! Weekend slots generated successfully!',
                );
            },
            onError: (err: any) => {
                toast.error(err.error || 'Failed to generate batch slots.');
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

    const handleEditSlotSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSlot) return;

        if (!editSlotForm.data.start_time) {
            toast.error('Please choose a start date & time.');
            return;
        }

        editSlotForm.put(`/teacher/slots/${editingSlot.id}`, {
            onSuccess: () => {
                setEditingSlot(null);
                editSlotForm.reset();
                toast.success(
                    'Alhamdulillah! Teaching hour updated successfully.',
                );
            },
            onError: (err: any) => {
                toast.error(err.error || 'Failed to update slot.');
            },
        });
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
                toast.success(
                    'Class marked as completed! Student progress report has been filed.',
                );
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
        (b) =>
            b.status === 'confirmed' &&
            new Date(b.slot.start_time) >= new Date(),
    );

    // Filter previous booked sessions (need feedback logging)
    const pendingFeedback = bookings.filter(
        (b) =>
            b.status === 'confirmed' &&
            new Date(b.slot.start_time) < new Date(),
    );

    // Filter finished sessions
    const completedBookings = bookings.filter((b) => b.status === 'completed');

    const renderSection = (id: string) => {
        switch (id) {
            case 'create_slot':
                return (
                    <div className="space-y-4">
                        <div className="flex cursor-grab items-center justify-between active:cursor-grabbing">
                            <h3 className="flex items-center gap-1.5 font-serif text-lg font-black text-arabic-bronze">
                                <GripVertical className="h-4 w-4 shrink-0 text-arabic-gold/70" />
                                <Plus className="h-4.5 w-4.5 text-arabic-gold" />{' '}
                                Open Teaching Hour
                            </h3>
                            <Badge className="bg-arabic-cream text-[9px] font-bold text-arabic-bronze">
                                Draggable
                            </Badge>
                        </div>
                        <Card className="rounded-[1.5rem] border border-arabic-cream bg-arabic-sand shadow-sm">
                            <CardHeader className="p-5 pb-2">
                                <div className="mb-4 flex border-b border-arabic-cream/60">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('single')}
                                        className={`flex-1 cursor-pointer pb-2 text-center text-xs font-black transition-colors ${
                                            activeTab === 'single'
                                                ? 'border-b-2 border-arabic-gold text-arabic-bronze'
                                                : 'text-arabic-bronze/40 hover:text-arabic-bronze/75'
                                        }`}
                                    >
                                        Single Slot
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('batch')}
                                        className={`flex-1 cursor-pointer pb-2 text-center text-xs font-black transition-colors ${
                                            activeTab === 'batch'
                                                ? 'border-b-2 border-arabic-gold text-arabic-bronze'
                                                : 'text-arabic-bronze/40 hover:text-arabic-bronze/75'
                                        }`}
                                    >
                                        Batch Weekends
                                    </button>
                                </div>
                                <CardTitle className="flex items-center gap-1.5 text-sm font-black text-arabic-bronze">
                                    <Plus className="h-4 w-4 text-arabic-gold" />{' '}
                                    {activeTab === 'single'
                                        ? 'Open Teaching Hour'
                                        : 'Generate Weekend Slots'}
                                </CardTitle>
                                <CardDescription className="text-[11px] font-medium text-arabic-bronze/70">
                                    {activeTab === 'single'
                                        ? 'Create a custom private session slot for students to book.'
                                        : 'Automatically generate slots for every Sat & Sun (8 AM - 6 PM) in a date range.'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-5 pt-2">
                                {activeTab === 'single' ? (
                                    <form
                                        onSubmit={handleCreateSlot}
                                        className="space-y-4"
                                    >
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-bold text-arabic-bronze/60 uppercase">
                                                Class Start Time
                                            </label>
                                            <Input
                                                type="datetime-local"
                                                value={slotForm.data.start_time}
                                                onChange={(e) =>
                                                    slotForm.setData(
                                                        'start_time',
                                                        e.target.value,
                                                    )
                                                }
                                                className="rounded-xl border-arabic-cream bg-arabic-sand text-xs placeholder:text-arabic-bronze/40 focus:border-arabic-gold focus-visible:ring-0"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-bold text-arabic-bronze/60 uppercase">
                                                Session Duration
                                            </label>
                                            <select
                                                value={slotForm.data.duration}
                                                onChange={(e) =>
                                                    slotForm.setData(
                                                        'duration',
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-xl border border-arabic-cream bg-arabic-sand p-2.5 text-xs font-bold text-arabic-bronze shadow-sm outline-none focus:border-arabic-gold focus-visible:ring-0"
                                            >
                                                <option value="30">
                                                    30 minutes
                                                </option>
                                                <option value="45">
                                                    45 minutes
                                                </option>
                                                <option value="60">
                                                    60 minutes (1 hour)
                                                </option>
                                                <option value="90">
                                                    90 minutes (1.5 hours)
                                                </option>
                                                <option value="120">
                                                    120 minutes (2 hours)
                                                </option>
                                            </select>
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={slotForm.processing}
                                            className="h-10 w-full rounded-xl bg-arabic-bronze text-xs font-bold text-arabic-sand shadow-sm hover:bg-arabic-bronze/90"
                                        >
                                            {slotForm.processing
                                                ? 'Opening...'
                                                : 'Open Slot'}
                                        </Button>
                                    </form>
                                ) : (
                                    <form
                                        onSubmit={handleBatchCreateSlots}
                                        className="space-y-4"
                                    >
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-bold text-arabic-bronze/60 uppercase">
                                                Start Date
                                            </label>
                                            <Input
                                                type="date"
                                                value={
                                                    batchForm.data.start_date
                                                }
                                                onChange={(e) =>
                                                    batchForm.setData(
                                                        'start_date',
                                                        e.target.value,
                                                    )
                                                }
                                                className="rounded-xl border-arabic-cream bg-arabic-sand text-xs placeholder:text-arabic-bronze/40 focus:border-arabic-gold focus-visible:ring-0"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-bold text-arabic-bronze/60 uppercase">
                                                End Date
                                            </label>
                                            <Input
                                                type="date"
                                                value={batchForm.data.end_date}
                                                onChange={(e) =>
                                                    batchForm.setData(
                                                        'end_date',
                                                        e.target.value,
                                                    )
                                                }
                                                className="rounded-xl border-arabic-cream bg-arabic-sand text-xs placeholder:text-arabic-bronze/40 focus:border-arabic-gold focus-visible:ring-0"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-bold text-arabic-bronze/60 uppercase">
                                                Session Duration
                                            </label>
                                            <select
                                                value={batchForm.data.duration}
                                                onChange={(e) =>
                                                    batchForm.setData(
                                                        'duration',
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-xl border border-arabic-cream bg-arabic-sand p-2.5 text-xs font-bold text-arabic-bronze shadow-sm outline-none focus:border-arabic-gold focus-visible:ring-0"
                                            >
                                                <option value="30">
                                                    30 minutes
                                                </option>
                                                <option value="45">
                                                    45 minutes
                                                </option>
                                                <option value="60">
                                                    60 minutes (1 hour)
                                                </option>
                                                <option value="90">
                                                    90 minutes (1.5 hours)
                                                </option>
                                                <option value="120">
                                                    120 minutes (2 hours)
                                                </option>
                                            </select>
                                        </div>
                                        <div className="rounded-xl border border-arabic-cream bg-arabic-cream/30 p-3 text-[10px] leading-normal font-medium text-arabic-bronze/80">
                                            💡 Generates non-overlapping slots
                                            on **Saturdays & Sundays (8:00 AM to
                                            6:00 PM)** within this range.
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={batchForm.processing}
                                            className="h-10 w-full rounded-xl bg-arabic-bronze text-xs font-bold text-arabic-sand shadow-sm hover:bg-arabic-bronze/90"
                                        >
                                            {batchForm.processing
                                                ? 'Generating...'
                                                : 'Generate Weekend Slots'}
                                        </Button>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                );

            case 'slots_list':
                return (
                    <div className="space-y-4">
                        <div className="flex cursor-grab items-center justify-between active:cursor-grabbing">
                            <h3 className="flex items-center gap-2 font-serif text-lg font-black text-arabic-bronze">
                                <GripVertical className="h-4 w-4 shrink-0 text-arabic-gold/70" />
                                <Clock className="h-4.5 w-4.5 text-arabic-gold" />{' '}
                                Hour Slots List
                            </h3>
                            <Badge className="bg-arabic-cream text-[9px] font-bold text-arabic-bronze">
                                Draggable
                            </Badge>
                        </div>

                        {slots.length > 0 ? (
                            <div className="max-h-[350px] space-y-2 overflow-y-auto pr-1">
                                {slots.map((slot) => {
                                    const startTime = new Date(slot.start_time);
                                    const endTime = new Date(slot.end_time);
                                    const duration = Math.round(
                                        (endTime.getTime() -
                                            startTime.getTime()) /
                                            (1000 * 60),
                                    );
                                    const formattedTime =
                                        startTime.toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                        }) +
                                        ' @ ' +
                                        startTime.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        }) +
                                        ' - ' +
                                        endTime.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        }) +
                                        ` (${duration} mins)`;

                                    return (
                                        <div
                                            key={slot.id}
                                            className="flex items-center justify-between rounded-xl border border-arabic-cream bg-arabic-sand p-3 text-xs font-semibold"
                                        >
                                            <span className="text-arabic-bronze">
                                                {formattedTime}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {slot.is_booked ? (
                                                    <Badge className="rounded-full bg-arabic-gold text-[9px] font-bold text-arabic-bronze">
                                                        Booked
                                                    </Badge>
                                                ) : (
                                                    <>
                                                        <Badge
                                                            variant="outline"
                                                            className="rounded-full border-arabic-cream text-[9px] font-bold text-arabic-bronze/60"
                                                        >
                                                            Available
                                                        </Badge>
                                                        <button
                                                            onClick={() => {
                                                                setEditingSlot(
                                                                    slot,
                                                                );
                                                                const currentDuration =
                                                                    Math.round(
                                                                        (new Date(
                                                                            slot.end_time,
                                                                        ).getTime() -
                                                                            new Date(
                                                                                slot.start_time,
                                                                            ).getTime()) /
                                                                            (1000 *
                                                                                60),
                                                                    );
                                                                editSlotForm.setData(
                                                                    {
                                                                        start_time:
                                                                            formatForDateTimeLocal(
                                                                                slot.start_time,
                                                                            ),
                                                                        duration:
                                                                            String(
                                                                                currentDuration,
                                                                            ),
                                                                    },
                                                                );
                                                            }}
                                                            className="cursor-pointer rounded-lg p-1 text-arabic-gold transition hover:bg-arabic-gold/10"
                                                            title="Edit Slot Time"
                                                        >
                                                            <Pen className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteSlot(
                                                                    slot.id,
                                                                )
                                                            }
                                                            className="cursor-pointer rounded-lg p-1 text-rose-500 transition hover:bg-rose-500/10"
                                                            title="Delete Slot"
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
                            <div className="rounded-2xl border border-arabic-cream bg-arabic-sand p-6 text-center text-xs font-bold text-arabic-bronze/60">
                                No teaching hour slots created yet. Use the card
                                above to open hours.
                            </div>
                        )}
                    </div>
                );

            case 'pending_feedback':
                return (
                    <div className="space-y-4">
                        <div className="flex cursor-grab items-center justify-between active:cursor-grabbing">
                            <h3 className="flex items-center gap-2 font-serif text-xl font-black text-rose-600">
                                <GripVertical className="h-4 w-4 shrink-0 text-rose-500/70" />
                                <MessageSquare className="h-5 w-5 animate-pulse text-rose-500" />{' '}
                                Log Students Assessment Progress
                            </h3>
                            <Badge className="bg-arabic-cream text-[9px] font-bold text-arabic-bronze">
                                Draggable
                            </Badge>
                        </div>

                        {pendingFeedback.length > 0 ? (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {pendingFeedback.map((booking) => {
                                    const startTime = new Date(
                                        booking.slot.start_time,
                                    );
                                    const formattedTime =
                                        startTime.toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                        }) +
                                        ' @ ' +
                                        startTime.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        });

                                    return (
                                        <Card
                                            key={booking.id}
                                            className="relative flex flex-col justify-between overflow-hidden rounded-[1.5rem] border border-rose-500/20 bg-arabic-sand shadow-sm"
                                        >
                                            <div className="absolute top-0 left-0 h-full w-1.5 bg-rose-500" />
                                            <CardHeader className="p-5 pb-2">
                                                <div className="flex items-center justify-between">
                                                    <Badge
                                                        variant="secondary"
                                                        className="rounded-full bg-rose-100 text-[9px] font-bold text-rose-700 uppercase"
                                                    >
                                                        {booking.program.name}
                                                    </Badge>
                                                    <span className="text-[10px] font-black text-rose-600">
                                                        Pending Feedback
                                                    </span>
                                                </div>
                                                <CardTitle className="mt-2 text-sm font-black text-arabic-bronze">
                                                    {booking.student.name}
                                                </CardTitle>
                                                <CardDescription className="mt-1 text-[11px] font-medium text-arabic-bronze/70">
                                                    Session held on{' '}
                                                    {formattedTime}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-5 pt-2 pb-4">
                                                {booking.student_notes && (
                                                    <p className="text-[10px] font-medium text-arabic-bronze/70 italic">
                                                        Student note: "
                                                        {booking.student_notes}"
                                                    </p>
                                                )}
                                            </CardContent>
                                            <CardFooter className="border-t border-arabic-cream/45 bg-arabic-cream/10 p-5 pt-2">
                                                <Button
                                                    onClick={() =>
                                                        setSelectedBooking(
                                                            booking,
                                                        )
                                                    }
                                                    className="h-9 w-full rounded-xl bg-rose-600 text-xs font-bold text-arabic-sand shadow-sm hover:bg-rose-700"
                                                >
                                                    Log Assessment report
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="rounded-[2rem] border border-arabic-cream bg-arabic-sand p-8 text-center text-xs font-bold text-arabic-bronze/60">
                                Alhamdulillah! You have no pending progress
                                reports to file.
                            </div>
                        )}
                    </div>
                );

            case 'upcoming_classes':
                return (
                    <div className="space-y-4">
                        <div className="flex cursor-grab items-center justify-between active:cursor-grabbing">
                            <h3 className="flex items-center gap-2 font-serif text-xl font-black text-arabic-bronze">
                                <GripVertical className="h-4 w-4 shrink-0 text-arabic-gold/70" />
                                <Calendar className="h-5 w-5 text-arabic-gold" />{' '}
                                Upcoming Booked Classes
                            </h3>
                            <Badge className="bg-arabic-cream text-[9px] font-bold text-arabic-bronze">
                                Draggable
                            </Badge>
                        </div>

                        {upcomingBooked.length > 0 ? (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {upcomingBooked.map((booking) => {
                                    const startTime = new Date(
                                        booking.slot.start_time,
                                    );
                                    const formattedTime =
                                        startTime.toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                        }) +
                                        ' @ ' +
                                        startTime.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        });

                                    return (
                                        <Card
                                            key={booking.id}
                                            className="relative flex flex-col justify-between overflow-hidden rounded-[1.5rem] border border-arabic-cream bg-arabic-sand shadow-sm"
                                        >
                                            <div className="absolute top-0 left-0 h-full w-1.5 bg-arabic-gold" />
                                            <CardHeader className="p-5 pb-2">
                                                <div className="flex items-center justify-between">
                                                    <Badge
                                                        variant="secondary"
                                                        className="rounded-full bg-arabic-cream text-[9px] font-bold text-arabic-bronze uppercase"
                                                    >
                                                        {booking.program.name.replace(
                                                            ' Program',
                                                            '',
                                                        )}
                                                    </Badge>
                                                    <span className="text-[10px] font-black text-arabic-emerald">
                                                        Booked
                                                    </span>
                                                </div>
                                                <CardTitle className="mt-2 text-sm font-black text-arabic-bronze">
                                                    Student:{' '}
                                                    {booking.student.name}
                                                </CardTitle>
                                                <CardDescription className="mt-1 text-[11px] font-medium text-arabic-bronze/70">
                                                    Scheduled for{' '}
                                                    {formattedTime}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-3 p-5 pt-2 pb-4">
                                                {booking.student_notes && (
                                                    <div className="rounded-xl border border-arabic-cream/60 bg-arabic-cream/30 p-3 text-[10px] font-medium text-arabic-bronze/80">
                                                        <span className="mb-0.5 block font-bold text-arabic-bronze">
                                                            Intentions:
                                                        </span>
                                                        "{booking.student_notes}
                                                        "
                                                    </div>
                                                )}
                                            </CardContent>
                                            <CardFooter className="border-t border-arabic-cream/45 bg-arabic-cream/15 p-5 pt-2">
                                                <a
                                                    href={booking.video_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full"
                                                >
                                                    <Button className="h-9 w-full gap-1.5 rounded-xl bg-arabic-bronze text-xs font-bold text-arabic-sand shadow-sm hover:bg-arabic-bronze/90">
                                                        <Video className="h-4 w-4 animate-bounce text-arabic-gold" />{' '}
                                                        Open Meeting link
                                                    </Button>
                                                </a>
                                            </CardFooter>
                                        </Card>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="rounded-[2rem] border border-arabic-cream bg-arabic-sand p-8 text-center text-xs font-bold text-arabic-bronze/60">
                                No upcoming sessions have been booked yet.
                                Opened slots will appear on the calendar for
                                students.
                            </div>
                        )}
                    </div>
                );

            case 'completed_logs':
                return (
                    <div className="space-y-4">
                        <div className="flex cursor-grab items-center justify-between active:cursor-grabbing">
                            <h3 className="flex items-center gap-2 font-serif text-xl font-black text-arabic-bronze">
                                <GripVertical className="h-4 w-4 shrink-0 text-arabic-gold/70" />
                                <CheckCircle2 className="h-5 w-5 text-arabic-gold" />{' '}
                                Finished Class Logs
                            </h3>
                            <Badge className="bg-arabic-cream text-[9px] font-bold text-arabic-bronze">
                                Draggable
                            </Badge>
                        </div>

                        {completedBookings.length > 0 ? (
                            <div className="space-y-3">
                                {completedBookings.map((booking) => {
                                    const dateStr = new Date(
                                        booking.slot.start_time,
                                    ).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    });

                                    return (
                                        <div
                                            key={booking.id}
                                            className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-arabic-cream bg-arabic-sand p-4 text-xs font-semibold sm:flex-row sm:items-center"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="rounded-xl bg-arabic-cream p-3 text-lg">
                                                    🎓
                                                </div>
                                                <div>
                                                    <span className="block text-xs font-black text-arabic-bronze">
                                                        Student:{' '}
                                                        {booking.student.name}
                                                    </span>
                                                    <span className="mt-1 block text-[10px] font-medium text-arabic-bronze/60">
                                                        Program:{' '}
                                                        {booking.program.name} •
                                                        Completed on {dateStr}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="max-w-sm rounded-xl border border-arabic-cream/60 bg-arabic-cream/35 p-3 text-[10px] leading-normal text-arabic-bronze/70">
                                                <span className="mb-0.5 block font-bold text-arabic-bronze">
                                                    My Logged Feedback:
                                                </span>
                                                "{booking.teacher_feedback}"
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="rounded-[2rem] border border-arabic-cream bg-arabic-sand p-8 text-center text-xs font-bold text-arabic-bronze/60">
                                No completed lessons recorded in your system
                                yet.
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Teacher Portal" />

            <div className="min-h-screen w-full space-y-8 bg-arabic-sand/20 p-6">
                {/* Header Welcome Bar */}
                <div className="flex flex-col justify-between gap-4 border-b border-arabic-cream/60 pb-6 md:flex-row md:items-center">
                    <div>
                        <h1 className="font-serif text-3xl font-black text-arabic-bronze">
                            Teacher Portal
                        </h1>
                        <p className="mt-1 text-xs font-medium text-arabic-bronze/70">
                            Manage your available hours, connect with private
                            students on Zoom/Meet, and submit progress feedback
                            reports.
                        </p>
                    </div>
                    {JSON.stringify(layout) !==
                        JSON.stringify(defaultLayout) && (
                        <div className="flex shrink-0 items-center gap-2">
                            <Button
                                onClick={handleResetLayout}
                                variant="outline"
                                className="h-9 gap-1 rounded-full border-arabic-bronze/25 px-4 text-xs font-bold text-arabic-bronze shadow-sm hover:bg-arabic-cream"
                            >
                                <RefreshCw className="h-3.5 w-3.5 text-arabic-gold" />{' '}
                                Reset Layout
                            </Button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    {/* Left Column */}
                    <div className="min-h-[300px] space-y-8 lg:col-span-4">
                        {layout.left.map((sectionId, index) => (
                            <div
                                key={sectionId}
                                draggable
                                onDragStart={(e) =>
                                    handleDragStart(e, sectionId, 'left')
                                }
                                onDragOver={(e) => handleDragOver(e, sectionId)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, index, 'left')}
                                className={`transition-all duration-200 ${
                                    dragOverId === sectionId
                                        ? 'scale-[0.98] rounded-[1.5rem] border-2 border-dashed border-arabic-gold/80 p-1 opacity-50'
                                        : ''
                                }`}
                            >
                                {renderSection(sectionId)}
                            </div>
                        ))}
                    </div>

                    {/* Right Column */}
                    <div className="min-h-[300px] space-y-8 lg:col-span-8">
                        {layout.right.map((sectionId, index) => (
                            <div
                                key={sectionId}
                                draggable
                                onDragStart={(e) =>
                                    handleDragStart(e, sectionId, 'right')
                                }
                                onDragOver={(e) => handleDragOver(e, sectionId)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, index, 'right')}
                                className={`transition-all duration-200 ${
                                    dragOverId === sectionId
                                        ? 'scale-[0.98] rounded-[1.5rem] border-2 border-dashed border-arabic-gold/80 p-1 opacity-50'
                                        : ''
                                }`}
                            >
                                {renderSection(sectionId)}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Progress Log Submission Modal Drawer */}
                {selectedBooking && (
                    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-arabic-bronze/45 p-4 backdrop-blur-sm duration-200 fade-in">
                        <div className="flex max-h-[90vh] w-full max-w-lg animate-in flex-col overflow-hidden rounded-[2rem] border-2 border-arabic-cream bg-arabic-sand shadow-2xl duration-200 zoom-in-95">
                            <div className="flex shrink-0 items-center justify-between border-b border-arabic-cream bg-arabic-cream/60 px-6 py-4">
                                <div>
                                    <span className="block text-[9px] font-bold tracking-widest text-arabic-gold uppercase">
                                        Log Progress Report
                                    </span>
                                    <h4 className="font-serif text-base font-black text-arabic-bronze">
                                        Recap for {selectedBooking.student.name}
                                    </h4>
                                </div>
                                <button
                                    onClick={() => setSelectedBooking(null)}
                                    className="rounded-full p-2 text-arabic-bronze/60 transition hover:bg-arabic-cream hover:text-arabic-bronze"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form
                                onSubmit={handleCompleteBookingSubmit}
                                className="flex flex-1 flex-col overflow-hidden"
                            >
                                <div className="flex-1 space-y-6 overflow-y-auto p-6">
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                            Class Program
                                        </label>
                                        <span className="block text-xs font-bold text-arabic-bronze">
                                            {selectedBooking.program.name}
                                        </span>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                            Detailed Performance Feedback
                                        </label>
                                        <Textarea
                                            placeholder="Write constructive progress comments on student pronunciation accuracy, surah mastery, tajweed rules learned, etc..."
                                            value={
                                                completionForm.data
                                                    .teacher_feedback
                                            }
                                            onChange={(e) =>
                                                completionForm.setData(
                                                    'teacher_feedback',
                                                    e.target.value,
                                                )
                                            }
                                            className="min-h-[120px] rounded-xl border-arabic-cream bg-arabic-sand text-xs placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                        />
                                        <span className="block text-[10px] leading-relaxed text-arabic-bronze/50">
                                            Student will immediately view these
                                            notes on their portal.
                                        </span>
                                    </div>

                                    <div className="flex items-start gap-2.5 rounded-2xl border border-arabic-gold/30 bg-arabic-gold/10 p-4">
                                        <Checkbox
                                            id="issue_cert"
                                            checked={
                                                completionForm.data
                                                    .issue_certificate
                                            }
                                            onCheckedChange={(checked) =>
                                                completionForm.setData(
                                                    'issue_certificate',
                                                    !!checked,
                                                )
                                            }
                                            className="mt-0.5 border-arabic-gold data-[state=checked]:bg-arabic-gold data-[state=checked]:text-arabic-bronze"
                                        />
                                        <div>
                                            <label
                                                htmlFor="issue_cert"
                                                className="block cursor-pointer text-xs font-black text-arabic-bronze"
                                            >
                                                Award Program Completion
                                                Certificate
                                            </label>
                                            <p className="mt-0.5 text-[10px] leading-normal font-medium text-arabic-bronze/80">
                                                If the student has fully
                                                completed all rules, lessons,
                                                and surahs required for **
                                                {selectedBooking.program.name}
                                                **, award their official
                                                platform credentials.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex shrink-0 justify-end gap-2 border-t border-arabic-cream bg-arabic-cream/30 px-6 py-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setSelectedBooking(null)}
                                        className="rounded-full border-arabic-bronze/25 text-xs font-bold text-arabic-bronze hover:bg-arabic-cream"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={completionForm.processing}
                                        className="rounded-full bg-arabic-bronze px-6 text-xs font-bold text-arabic-sand shadow-sm hover:bg-arabic-bronze/90"
                                    >
                                        {completionForm.processing
                                            ? 'Submitting...'
                                            : 'Mark as Completed'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                {/* Edit Slot Modal Drawer */}
                {editingSlot && (
                    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-arabic-bronze/45 p-4 backdrop-blur-sm duration-200 fade-in">
                        <div className="flex max-h-[90vh] w-full max-w-md animate-in flex-col overflow-hidden rounded-[2rem] border-2 border-arabic-cream bg-arabic-sand shadow-2xl duration-200 zoom-in-95">
                            <div className="flex shrink-0 items-center justify-between border-b border-arabic-cream bg-arabic-cream/60 px-6 py-4">
                                <div>
                                    <span className="block text-[9px] font-bold tracking-widest text-arabic-gold uppercase">
                                        Slot Manager
                                    </span>
                                    <h4 className="font-serif text-base font-black text-arabic-bronze">
                                        Edit Teaching Hour
                                    </h4>
                                </div>
                                <button
                                    onClick={() => setEditingSlot(null)}
                                    className="rounded-full p-2 text-arabic-bronze/60 transition hover:bg-arabic-cream hover:text-arabic-bronze"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form
                                onSubmit={handleEditSlotSubmit}
                                className="flex flex-1 flex-col overflow-hidden"
                            >
                                <div className="flex-1 space-y-4 overflow-y-auto p-6">
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                            Class Start Time
                                        </label>
                                        <Input
                                            type="datetime-local"
                                            value={editSlotForm.data.start_time}
                                            onChange={(e) =>
                                                editSlotForm.setData(
                                                    'start_time',
                                                    e.target.value,
                                                )
                                            }
                                            className="rounded-xl border-arabic-cream bg-arabic-sand text-xs placeholder:text-arabic-bronze/40 focus:border-arabic-gold focus-visible:ring-0"
                                        />
                                    </div>
                                    <div className="mt-4 space-y-1.5">
                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                            Session Duration
                                        </label>
                                        <select
                                            value={editSlotForm.data.duration}
                                            onChange={(e) =>
                                                editSlotForm.setData(
                                                    'duration',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-xl border border-arabic-cream bg-arabic-sand p-2.5 text-xs font-bold text-arabic-bronze shadow-sm outline-none focus:border-arabic-gold focus-visible:ring-0"
                                        >
                                            <option value="30">
                                                30 minutes
                                            </option>
                                            <option value="45">
                                                45 minutes
                                            </option>
                                            <option value="60">
                                                60 minutes (1 hour)
                                            </option>
                                            <option value="90">
                                                90 minutes (1.5 hours)
                                            </option>
                                            <option value="120">
                                                120 minutes (2 hours)
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex shrink-0 justify-end gap-2 border-t border-arabic-cream bg-arabic-cream/30 px-6 py-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setEditingSlot(null)}
                                        className="h-9 rounded-full border-arabic-bronze/25 text-xs font-bold text-arabic-bronze hover:bg-arabic-cream"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={editSlotForm.processing}
                                        className="h-9 rounded-full bg-arabic-bronze px-6 text-xs font-bold text-arabic-sand shadow-sm hover:bg-arabic-bronze/90"
                                    >
                                        {editSlotForm.processing
                                            ? 'Saving...'
                                            : 'Save Changes'}
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
