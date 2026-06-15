import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import {
    BookOpen,
    Calendar,
    Clock,
    Award,
    Video,
    AlertCircle,
    FileText,
    ChevronRight,
    Check,
    X,
    ArrowUpRight,
    GripVertical,
    RefreshCw,
    Loader2,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { getTranslation } from '@/lib/translation-utils';
import { dashboard } from '@/routes';
import {
    destroy as destroyBooking,
    store as storeBooking,
} from '@/routes/bookings';
import { verify as verifyCertificate } from '@/routes/certificates';
import { dashboard as studentDashboard } from '@/routes/student';

interface Slot {
    id: number;
    teacher_id: number;
    start_time: string;
    end_time: string;
    is_booked: boolean;
    teacher?: {
        id: number;
        name: string;
        avatar?: string;
        teacher_profile?: {
            bio: any;
            specializations_json?: any;
            whatsapp_number: string;
            zoom_link?: string;
            google_meet_link?: string;
        };
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
    const { t, locale } = useTranslation();

    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(
        null,
    );

    const cancelForm = useForm({});

    // Booking States
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
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

    const defaultLayout = {
        left: ['book_session', 'upcoming_classes', 'past_sessions'],
        right: ['my_certificates'],
    };

    const [layout, setLayout] = useState(() => {
        let left = ['book_session', 'upcoming_classes', 'past_sessions'];
        let right = ['my_certificates'];

        if (
            user?.dashboard_layout &&
            typeof user.dashboard_layout === 'object'
        ) {
            const saved = user.dashboard_layout;

            if (Array.isArray(saved.left) && Array.isArray(saved.right)) {
                left = [...saved.left];
                right = [...saved.right];
            }
        }

        // Ensure book_session widget is present in user layout configuration
        if (!left.includes('book_session') && !right.includes('book_session')) {
            left.unshift('book_session');
        }

        return { left, right };
    });

    // Booking Helpers
    const getSlotDateString = (dateTimeStr: string) => {
        const dateObj = new Date(dateTimeStr);
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');

        return `${yyyy}-${mm}-${dd}`;
    };

    const availableDates = Array.from(
        new Set(
            availableSlots
                .filter((slot) => new Date(slot.start_time).getTime() > Date.now())
                .map((slot) => getSlotDateString(slot.start_time)),
        ),
    ).sort();

    const getSlotsForDate = (dateStr: string) => {
        return availableSlots.filter(
            (slot) => getSlotDateString(slot.start_time) === dateStr && new Date(slot.start_time).getTime() > Date.now(),
        );
    };

    const getTeachersForDate = (dateStr: string) => {
        const slotsOnDate = getSlotsForDate(dateStr);
        const teachersMap = new Map<number, any>();
        slotsOnDate.forEach((slot) => {
            if (slot.teacher) {
                teachersMap.set(slot.teacher_id, slot.teacher);
            }
        });
        return Array.from(teachersMap.values());
    };

    const getSlotsForDateAndTeacher = (dateStr: string, teacherId: number) => {
        return getSlotsForDate(dateStr).filter((slot) => slot.teacher_id === teacherId);
    };

    const handleSelectDate = (dateStr: string) => {
        setSelectedDate(dateStr);
        setSelectedTeacherId(null);
        setSelectedSlot(null);
    };

    const handleSelectSlot = (slot: any) => {
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

        if (!selectedSlot) {
            toast.error(t('Please choose a time slot.'));

            return;
        }

        if (!selectedProgramId) {
            toast.error(t('Please select one of our Quranic programs.'));

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
                    t(
                        'Alhamdulillah! Your private 1-to-1 session has been booked successfully.',
                    ),
                );
            },
            onError: (err: any) => {
                toast.error(
                    err.error || t('Failed to submit session booking.'),
                );
            },
        });
    };

    // Smooth Scroll to Book Session Widget when directed from sidebar
    useEffect(() => {
        const scrollToWidget = () => {
            if (
                window.location.hash === '#book-session' ||
                window.location.search.includes('book=true')
            ) {
                const element = document.getElementById('book-session-widget');

                if (element) {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                    });
                    element.classList.add(
                        'ring-2',
                        'ring-arabic-gold',
                        'ring-offset-2',
                    );
                    const timeoutId = setTimeout(() => {
                        element.classList.remove(
                            'ring-2',
                            'ring-arabic-gold',
                            'ring-offset-2',
                        );
                    }, 2000);

                    return () => clearTimeout(timeoutId);
                }
            }
        };

        // Scroll on initial mount or change
        scrollToWidget();

        // Listen for hashchange events for same-page link clicks
        window.addEventListener('hashchange', scrollToWidget);

        return () => {
            window.removeEventListener('hashchange', scrollToWidget);
        };
    }, []);

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

        if (!draggingId || !draggingCol) {
            return;
        }

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
                        t(
                            'Alhamdulillah! Dashboard layout updated successfully.',
                        ),
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
                        t(
                            'Alhamdulillah! Dashboard layout reset successfully.',
                        ),
                    );
                },
            },
        );
    };

    const handleCancelBooking = (bookingId: number) => {
        if (
            confirm(
                t(
                    'Are you sure you want to cancel this scheduled learning session?',
                ),
            )
        ) {
            cancelForm.delete(destroyBooking.url(bookingId), {
                onSuccess: () => {
                    toast.success(
                        t(
                            'Alhamdulillah! Your booking has been cancelled and the slot is open.',
                        ),
                    );
                },
                onError: (err: any) => {
                    toast.error(err.error || t('Failed to cancel session.'));
                },
            });
        }
    };

    const breadcrumbs = [
        { title: t('Dashboard'), href: dashboard() },
        { title: t('Student Portal'), href: studentDashboard() },
    ];

    const renderSection = (id: string) => {
        switch (id) {
            case 'book_session':
                return (
                    <Card
                        id="book-session-widget"
                        className="relative flex flex-col justify-between overflow-hidden rounded-[1.5rem] border border-arabic-cream bg-arabic-sand shadow-sm transition hover:shadow-md"
                    >
                        <div className="absolute top-0 left-0 h-full w-1.5 bg-arabic-gold" />
                        <CardHeader className="flex cursor-grab flex-row items-center justify-between p-5 pb-3 active:cursor-grabbing">
                            <div className="space-y-1">
                                <CardTitle className="flex items-center gap-2 font-serif text-lg font-black text-arabic-bronze">
                                    <GripVertical className="h-4 w-4 shrink-0 text-arabic-gold/70" />
                                    <Calendar className="h-5 w-5 text-arabic-gold" />{' '}
                                    {t('Book a New Session')}
                                </CardTitle>
                                <CardDescription className="text-xs text-muted-foreground">
                                    {t(
                                        'Choose an available slot with our Moroccan teachers.',
                                    )}
                                </CardDescription>
                            </div>
                            <Badge className="bg-arabic-cream text-[9px] font-bold text-arabic-bronze">
                                {t('Draggable')}
                            </Badge>
                        </CardHeader>

                        <CardContent className="space-y-4 p-5 pt-2">
                            {availableSlots.length > 0 ? (
                                <div className="space-y-4">
                                    {/* Step 1: Select Date */}
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                            {t('Select Date')}
                                        </label>
                                        <div className="flex scrollbar-thin gap-2 overflow-x-auto pb-1.5">
                                            {availableDates.map((dateStr) => {
                                                const dateObj = new Date(
                                                    dateStr,
                                                );
                                                const isSelected =
                                                    selectedDate === dateStr;
                                                const dayName =
                                                    dateObj.toLocaleDateString(
                                                        locale === 'id'
                                                            ? 'id-ID'
                                                            : locale === 'ar'
                                                              ? 'ar-EG'
                                                              : 'en-US',
                                                        { weekday: 'short' },
                                                    );
                                                const dayNum =
                                                    dateObj.getDate();
                                                const monthName =
                                                    dateObj.toLocaleDateString(
                                                        locale === 'id'
                                                            ? 'id-ID'
                                                            : locale === 'ar'
                                                              ? 'ar-EG'
                                                              : 'en-US',
                                                        { month: 'short' },
                                                    );

                                                return (
                                                    <button
                                                        key={dateStr}
                                                        type="button"
                                                        onClick={() =>
                                                            handleSelectDate(
                                                                dateStr,
                                                            )
                                                        }
                                                        className={`flex min-w-[60px] cursor-pointer flex-col items-center justify-center rounded-xl border p-2 text-center transition ${
                                                            isSelected
                                                                ? 'border-arabic-bronze bg-arabic-bronze text-arabic-sand'
                                                                : 'border-arabic-cream bg-arabic-sand text-arabic-bronze hover:border-arabic-gold'
                                                        }`}
                                                    >
                                                        <span className="text-[9px] font-bold tracking-wider uppercase opacity-80">
                                                            {dayName}
                                                        </span>
                                                        <span className="text-sm font-black">
                                                            {dayNum}
                                                        </span>
                                                        <span className="text-[9px] font-medium">
                                                            {monthName}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Step 2: Select Teacher OR Show Selected Teacher */}
                                    {selectedDate && (
                                        <div className="animate-in space-y-4 duration-200 fade-in">
                                            {!selectedTeacherId ? (
                                                <div className="space-y-2.5">
                                                    <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                                        {t('Select Teacher')}
                                                    </label>
                                                    <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                                                        {getTeachersForDate(selectedDate).map((teacher) => (
                                                            <div
                                                                key={teacher.id}
                                                                className="flex items-center justify-between rounded-xl border border-arabic-cream bg-arabic-sand p-3 transition hover:border-arabic-gold hover:shadow-xs"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-arabic-gold bg-arabic-cream shadow-xs flex items-center justify-center">
                                                                        {teacher.avatar ? (
                                                                            <img
                                                                                src={teacher.avatar}
                                                                                alt={teacher.name}
                                                                                className="h-full w-full object-cover"
                                                                            />
                                                                        ) : (
                                                                            <span className="text-xs font-black text-arabic-bronze uppercase">
                                                                                {teacher.name.charAt(0)}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <h5 className="font-serif text-[11px] font-black text-arabic-bronze leading-tight">
                                                                            {teacher.name}
                                                                        </h5>
                                                                        {teacher.teacher_profile?.bio && (
                                                                            <p className="text-[9px] font-medium text-arabic-bronze/70 line-clamp-1 mt-0.5 max-w-[180px] sm:max-w-xs">
                                                                                {typeof teacher.teacher_profile.bio === 'object'
                                                                                    ? getTranslation(teacher.teacher_profile.bio, locale)
                                                                                    : teacher.teacher_profile.bio}
                                                                            </p>
                                                                        )}
                                                                        {teacher.teacher_profile?.specializations_json && (
                                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                                {(Array.isArray(teacher.teacher_profile.specializations_json)
                                                                                    ? teacher.teacher_profile.specializations_json
                                                                                    : typeof teacher.teacher_profile.specializations_json === 'string'
                                                                                      ? JSON.parse(teacher.teacher_profile.specializations_json)
                                                                                      : []
                                                                                ).slice(0, 2).map((spec: string, idx: number) => (
                                                                                    <Badge
                                                                                        key={idx}
                                                                                        variant="outline"
                                                                                        className="rounded-full border-arabic-cream/60 text-[8px] font-bold text-arabic-bronze/60 bg-arabic-cream/10 px-1.5 py-0"
                                                                                    >
                                                                                        {spec}
                                                                                    </Badge>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    onClick={() => setSelectedTeacherId(teacher.id)}
                                                                    className="h-6.5 rounded-full bg-arabic-bronze px-2.5 text-[9px] font-black tracking-widest uppercase text-arabic-sand shadow-sm hover:bg-arabic-bronze/90 cursor-pointer"
                                                                >
                                                                    {t('Select')}
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {/* Selected Teacher Summary Banner */}
                                                    <div className="flex items-center justify-between rounded-xl border border-arabic-gold/30 bg-arabic-gold/5 p-2.5">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="h-8 w-8 overflow-hidden rounded-full border border-arabic-gold bg-arabic-cream flex items-center justify-center shrink-0">
                                                                {(() => {
                                                                    const selectedTeacher = getTeachersForDate(selectedDate).find(
                                                                        (t) => t.id === selectedTeacherId,
                                                                    );
                                                                    return selectedTeacher?.avatar ? (
                                                                        <img
                                                                            src={selectedTeacher.avatar}
                                                                            alt={selectedTeacher.name}
                                                                            className="h-full w-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <span className="text-xs font-black text-arabic-bronze uppercase">
                                                                            {selectedTeacher?.name.charAt(0)}
                                                                        </span>
                                                                    );
                                                                })()}
                                                            </div>
                                                            <div>
                                                                <span className="block text-[8px] font-black text-arabic-gold uppercase tracking-widest leading-none mb-0.5">
                                                                    {t('Selected Teacher')}
                                                                </span>
                                                                <span className="block text-[11px] font-black text-arabic-bronze leading-none">
                                                                    {
                                                                        getTeachersForDate(selectedDate).find(
                                                                            (t) => t.id === selectedTeacherId,
                                                                        )?.name
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedTeacherId(null);
                                                                setSelectedSlot(null);
                                                            }}
                                                            className="text-[9px] font-bold text-rose-600 hover:underline cursor-pointer"
                                                        >
                                                            {t('Change Teacher')}
                                                        </button>
                                                    </div>

                                                    {/* Step 3: Select Time Slot */}
                                                    <div className="space-y-2 animate-in duration-200 fade-in">
                                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                                            {t('Select Time Slot')}
                                                        </label>
                                                        <div className="grid max-h-[140px] grid-cols-2 gap-2 overflow-y-auto pr-1">
                                                            {getSlotsForDateAndTeacher(
                                                                selectedDate,
                                                                selectedTeacherId,
                                                            ).map((slot) => {
                                                                const isSelected = selectedSlot?.id === slot.id;
                                                                const startTime = new Date(slot.start_time);
                                                                const endTime = new Date(slot.end_time);
                                                                const duration = Math.round(
                                                                    (endTime.getTime() - startTime.getTime()) / (1000 * 60)
                                                                );
                                                                const startStr = startTime.toLocaleTimeString([], {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                });
                                                                const endStr = endTime.toLocaleTimeString([], {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                });

                                                                return (
                                                                    <button
                                                                        key={slot.id}
                                                                        type="button"
                                                                        onClick={() => handleSelectSlot(slot)}
                                                                        className={`cursor-pointer rounded-lg border p-2 text-center text-[10px] font-bold transition ${
                                                                            isSelected
                                                                                ? 'border-arabic-bronze bg-arabic-bronze text-arabic-sand'
                                                                                : 'border-arabic-cream bg-arabic-sand text-arabic-bronze hover:border-arabic-gold'
                                                                        }`}
                                                                    >
                                                                        {startStr} - {endStr} ({duration}m)
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Step 3: Select Program & Meeting Platform & Notes */}
                                    {selectedSlot && (
                                        <div className="animate-in space-y-4 border-t border-arabic-cream/40 pt-4 duration-200 fade-in">
                                            {/* Select Program */}
                                            <div className="space-y-2">
                                                <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                                    {t('Select Class Program')}
                                                </label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {programs.map((prog) => (
                                                        <button
                                                            key={prog.id}
                                                            type="button"
                                                            onClick={() =>
                                                                setSelectedProgramId(
                                                                    prog.id,
                                                                )
                                                            }
                                                            className={`cursor-pointer rounded-lg border p-2 text-center text-[10px] font-bold transition ${
                                                                selectedProgramId ===
                                                                prog.id
                                                                    ? 'border-arabic-gold bg-arabic-gold/10 font-black text-arabic-bronze shadow-xs'
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
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Select Platform */}
                                            <div className="space-y-2">
                                                <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                                    {t(
                                                        'Select Meeting Platform',
                                                    )}
                                                </label>
                                                <div className="flex gap-2">
                                                    {(!selectedSlot.teacher
                                                        ?.teacher_profile
                                                        ?.zoom_link ||
                                                        selectedSlot.teacher
                                                            ?.teacher_profile
                                                            ?.google_meet_link) && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setSelectedPlatform(
                                                                    'google_meet',
                                                                )
                                                            }
                                                            className={`flex-1 cursor-pointer rounded-lg border p-2 text-center text-[10px] font-bold transition ${
                                                                selectedPlatform ===
                                                                'google_meet'
                                                                    ? 'border-arabic-gold bg-arabic-gold/10 font-black text-arabic-bronze shadow-xs'
                                                                    : 'border-arabic-cream bg-arabic-sand text-arabic-bronze hover:bg-arabic-cream'
                                                            }`}
                                                        >
                                                            Google Meet
                                                        </button>
                                                    )}
                                                    {(!selectedSlot.teacher
                                                        ?.teacher_profile
                                                        ?.google_meet_link ||
                                                        selectedSlot.teacher
                                                            ?.teacher_profile
                                                            ?.zoom_link) && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setSelectedPlatform(
                                                                    'zoom',
                                                                )
                                                            }
                                                            className={`flex-1 cursor-pointer rounded-lg border p-2 text-center text-[10px] font-bold transition ${
                                                                selectedPlatform ===
                                                                'zoom'
                                                                    ? 'border-arabic-gold bg-arabic-gold/10 font-black text-arabic-bronze shadow-xs'
                                                                    : 'border-arabic-cream bg-arabic-sand text-arabic-bronze hover:bg-arabic-cream'
                                                            }`}
                                                        >
                                                            Zoom
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Notes */}
                                            <div className="space-y-2">
                                                <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                                    {t(
                                                        'Study Notes (Optional)',
                                                    )}
                                                </label>
                                                <Textarea
                                                    placeholder={t(
                                                        'Focus areas (e.g. pronunciation, memorization)...',
                                                    )}
                                                    value={notes}
                                                    onChange={(e) =>
                                                        setNotes(e.target.value)
                                                    }
                                                    className="min-h-[50px] rounded-lg border-arabic-cream bg-arabic-sand text-xs placeholder:text-arabic-bronze/30 focus:border-arabic-gold"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-2 bg-arabic-sand p-4 text-center">
                                    <AlertCircle className="mx-auto h-6 w-6 text-arabic-bronze/30" />
                                    <p className="text-xs font-semibold text-arabic-bronze/60">
                                        {t(
                                            'No available time slots. Please check back later.',
                                        )}
                                    </p>
                                </div>
                            )}
                        </CardContent>

                        {selectedSlot && (
                            <CardFooter className="flex justify-end border-t border-arabic-cream/40 bg-arabic-cream/10 p-5 pt-2">
                                <Button
                                    onClick={handleConfirmBooking}
                                    disabled={bookingForm.processing}
                                    className="h-9 w-full cursor-pointer gap-1 rounded-xl bg-arabic-bronze text-xs font-bold text-arabic-sand shadow-sm hover:bg-arabic-bronze/90 sm:w-auto"
                                >
                                    {bookingForm.processing ? (
                                        <>
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            {t('Booking...')}
                                        </>
                                    ) : (
                                        t('Confirm Booking')
                                    )}
                                </Button>
                            </CardFooter>
                        )}
                    </Card>
                );

            case 'upcoming_classes':
                return (
                    <div className="space-y-4">
                        <div className="flex cursor-grab items-center justify-between active:cursor-grabbing">
                            <h3 className="flex items-center gap-2 font-serif text-xl font-black text-arabic-bronze">
                                <GripVertical className="h-4 w-4 shrink-0 text-arabic-gold/70" />
                                <Calendar className="h-5 w-5 text-arabic-gold" />{' '}
                                {t('Upcoming Private Classes')}
                            </h3>
                            <Badge className="bg-arabic-cream text-[9px] font-bold text-arabic-bronze">
                                {t('Draggable')}
                            </Badge>
                        </div>

                        {upcomingBookings.length > 0 ? (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {upcomingBookings.map((booking) => {
                                    const startTime = new Date(
                                        booking.slot.start_time,
                                    );
                                    const endTime = new Date(
                                        booking.slot.end_time,
                                    );

                                    const formattedDate =
                                        startTime.toLocaleDateString(
                                            locale === 'id'
                                                ? 'id-ID'
                                                : locale === 'ar'
                                                  ? 'ar-EG'
                                                  : 'en-US',
                                            {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric',
                                            },
                                        );

                                    const formattedTime =
                                        startTime.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        }) +
                                        ' - ' +
                                        endTime.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        });

                                    return (
                                        <Card
                                            key={booking.id}
                                            className="relative flex flex-col justify-between overflow-hidden rounded-[1.5rem] border border-arabic-cream bg-arabic-sand shadow-sm transition hover:shadow-md"
                                        >
                                            <div className="absolute top-0 left-0 h-full w-1.5 bg-arabic-gold" />

                                            <CardHeader className="p-5 pb-2">
                                                <div className="flex items-center justify-between">
                                                    <Badge
                                                        variant="secondary"
                                                        className="rounded-full bg-arabic-cream text-[9px] font-bold text-arabic-bronze uppercase"
                                                    >
                                                        {getTranslation(
                                                            booking.program
                                                                .name,
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
                                                    </Badge>
                                                    <span className="flex items-center gap-1 text-[10px] font-black text-arabic-emerald">
                                                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-arabic-emerald" />{' '}
                                                        {t(
                                                            'Confirmed Bookings',
                                                        )}
                                                    </span>
                                                </div>
                                                <CardTitle className="mt-2 text-sm font-black text-arabic-bronze">
                                                    {t('Class with')}{' '}
                                                    {booking.slot.teacher.name}
                                                </CardTitle>
                                                <CardDescription className="mt-1 flex items-center gap-1 text-[11px] font-medium text-arabic-bronze/70">
                                                    <Clock className="h-3.5 w-3.5 text-arabic-gold" />{' '}
                                                    {formattedDate} @{' '}
                                                    {formattedTime}
                                                </CardDescription>
                                            </CardHeader>

                                            <CardContent className="space-y-3 p-5 pt-2 pb-4">
                                                {booking.student_notes && (
                                                    <div className="rounded-xl border border-arabic-cream/60 bg-arabic-cream/35 p-3 text-[10px] font-medium text-arabic-bronze/80">
                                                        <span className="mb-0.5 block font-bold text-arabic-bronze">
                                                            {t('My Notes:')}
                                                        </span>
                                                        "{booking.student_notes}
                                                        "
                                                    </div>
                                                )}
                                            </CardContent>

                                            <CardFooter className="flex gap-2 border-t border-arabic-cream/45 bg-arabic-cream/15 p-5 pt-2">
                                                <a
                                                    href={booking.video_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1"
                                                >
                                                    <Button className="h-9 w-full gap-1.5 rounded-xl bg-arabic-bronze text-xs font-bold text-arabic-sand shadow-sm hover:bg-arabic-bronze/90">
                                                        <Video className="h-4 w-4 animate-bounce text-arabic-gold" />{' '}
                                                        {t('Join Video')}
                                                    </Button>
                                                </a>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() =>
                                                        handleCancelBooking(
                                                            booking.id,
                                                        )
                                                    }
                                                    className="h-9 rounded-xl border border-rose-500/25 text-xs text-rose-600 hover:bg-rose-500/10"
                                                >
                                                    {t('Cancel')}
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="space-y-3 rounded-[2rem] border border-arabic-cream bg-arabic-sand p-8 text-center">
                                <AlertCircle className="mx-auto h-8 w-8 text-arabic-bronze/30" />
                                <p className="text-xs font-bold text-arabic-bronze/60">
                                    {t(
                                        'You have no upcoming private classes scheduled.',
                                    )}
                                </p>
                                <Link href="/">
                                    <Button
                                        size="sm"
                                        className="mt-1 h-8 rounded-full bg-arabic-bronze text-[11px] text-arabic-sand"
                                    >
                                        {t('Book Class Now')}
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                );

            case 'past_sessions':
                return (
                    <div className="space-y-4">
                        <div className="flex cursor-grab items-center justify-between active:cursor-grabbing">
                            <h3 className="flex items-center gap-2 font-serif text-xl font-black text-arabic-bronze">
                                <GripVertical className="h-4 w-4 shrink-0 text-arabic-gold/70" />
                                <BookOpen className="h-5 w-5 text-arabic-gold" />{' '}
                                {t('Previous Sessions & Progress History')}
                            </h3>
                            <Badge className="bg-arabic-cream text-[9px] font-bold text-arabic-bronze">
                                {t('Draggable')}
                            </Badge>
                        </div>

                        {pastBookings.length > 0 ? (
                            <div className="space-y-3">
                                {pastBookings.map((booking) => {
                                    const dateStr = new Date(
                                        booking.slot.start_time,
                                    ).toLocaleDateString(
                                        locale === 'id'
                                            ? 'id-ID'
                                            : locale === 'ar'
                                              ? 'ar-EG'
                                              : 'en-US',
                                        {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        },
                                    );

                                    return (
                                        <div
                                            key={booking.id}
                                            onClick={() =>
                                                setSelectedBooking(booking)
                                            }
                                            className="flex cursor-pointer flex-col items-start justify-between gap-4 rounded-2xl border border-arabic-cream bg-arabic-sand p-4 transition hover:border-arabic-gold/50 hover:bg-arabic-cream/20 sm:flex-row sm:items-center"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="rounded-xl bg-arabic-cream p-3 text-lg">
                                                    🏫
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-black text-arabic-bronze">
                                                            {getTranslation(
                                                                booking.program
                                                                    .name,
                                                                locale,
                                                            )}
                                                        </span>
                                                        <Badge
                                                            variant="secondary"
                                                            className="bg-arabic-cream px-1.5 py-0 text-[9px] font-bold text-arabic-bronze uppercase"
                                                        >
                                                            {
                                                                booking.slot
                                                                    .teacher
                                                                    .name
                                                            }
                                                        </Badge>
                                                    </div>
                                                    <span className="mt-1 block text-[10px] font-medium text-arabic-bronze/60">
                                                        {dateStr}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 self-end sm:self-center">
                                                {booking.teacher_feedback ? (
                                                    <Badge className="rounded-full bg-arabic-gold px-2 py-0.5 text-[9px] font-bold text-arabic-bronze">
                                                        {t(
                                                            'Feedback Available',
                                                        )}
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className="rounded-full border-arabic-cream px-2 py-0.5 text-[9px] font-bold text-arabic-bronze/60"
                                                    >
                                                        {t('Finished')}
                                                    </Badge>
                                                )}
                                                <ChevronRight className="h-4 w-4 text-arabic-bronze/40" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="rounded-[2rem] border border-arabic-cream bg-arabic-sand p-8 text-center text-xs font-bold text-arabic-bronze/60">
                                {t(
                                    'No completed sessions yet. Once your teacher completes a class, progress details will appear here.',
                                )}
                            </div>
                        )}
                    </div>
                );

            case 'my_certificates':
                return (
                    <div className="space-y-4">
                        <div className="flex cursor-grab items-center justify-between active:cursor-grabbing">
                            <h3 className="flex items-center gap-2 font-serif text-xl font-black text-arabic-bronze">
                                <GripVertical className="h-4 w-4 shrink-0 text-arabic-gold/70" />
                                <Award className="h-5 w-5 text-arabic-gold" />{' '}
                                {t('My Certificates')}
                            </h3>
                            <Badge className="bg-arabic-cream text-[9px] font-bold text-arabic-bronze">
                                {t('Draggable')}
                            </Badge>
                        </div>

                        {certificates.length > 0 ? (
                            <div className="space-y-3">
                                {certificates.map((cert) => {
                                    const issueDate = new Date(
                                        cert.issued_at,
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
                                    );

                                    return (
                                        <Card
                                            key={cert.id}
                                            className="relative overflow-hidden rounded-[1.5rem] border border-arabic-cream bg-arabic-sand shadow-sm transition hover:shadow-md"
                                        >
                                            <div className="absolute top-0 right-0 left-0 h-1 bg-arabic-gold" />
                                            <CardHeader className="p-5 pb-2">
                                                <Award className="mb-2 h-8 w-8 text-arabic-gold" />
                                                <CardTitle className="text-xs font-black tracking-wider text-arabic-bronze uppercase">
                                                    {t(
                                                        'Certificate of Completion',
                                                    )}
                                                </CardTitle>
                                                <CardDescription className="mt-1 text-xs font-bold text-arabic-gold">
                                                    {getTranslation(
                                                        cert.program.name,
                                                        locale,
                                                    )}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-5 pt-2 pb-4 text-[10px] leading-relaxed font-medium text-arabic-bronze/70">
                                                {cert.notes}
                                                <span className="mt-2 block font-bold text-arabic-bronze">
                                                    {t('Issued on:')}{' '}
                                                    {issueDate}
                                                </span>
                                            </CardContent>
                                            <CardFooter className="border-t border-arabic-cream/45 bg-arabic-cream/15 p-5 pt-2">
                                                <Link
                                                    href={verifyCertificate(
                                                        cert.verification_hash,
                                                    )}
                                                    className="w-full"
                                                >
                                                    <Button className="h-9 w-full gap-1 rounded-xl bg-arabic-bronze text-xs font-bold text-arabic-sand shadow-sm hover:bg-arabic-bronze/90">
                                                        {t('View Credential')}{' '}
                                                        <ArrowUpRight className="h-3.5 w-3.5 text-arabic-gold" />
                                                    </Button>
                                                </Link>
                                            </CardFooter>
                                        </Card>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="space-y-2 rounded-[2rem] border border-arabic-cream bg-arabic-sand p-8 text-center">
                                <Award className="mx-auto h-8 w-8 text-arabic-bronze/30" />
                                <span className="block text-xs font-bold text-arabic-bronze/60">
                                    {t('No certificates earned yet.')}
                                </span>
                                <p className="mx-auto max-w-[200px] text-[10px] leading-relaxed text-arabic-bronze/50">
                                    {t(
                                        'Complete program levels and receive recommendations from your teacher to earn certificates.',
                                    )}
                                </p>
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
            <Head title={t('Student Portal')} />

            <div className="min-h-screen w-full space-y-8 bg-arabic-sand/20 p-6">
                {/* Header Welcome Bar */}
                <div className="flex flex-col justify-between gap-4 border-b border-arabic-cream/60 pb-6 md:flex-row md:items-center">
                    <div>
                        <h1 className="font-serif text-3xl font-black text-arabic-bronze">
                            {t('Ahlan wa Sahlan!')}
                        </h1>
                        <p className="mt-1 text-xs font-medium text-arabic-bronze/70">
                            {t(
                                'Manage your private Al-Quran sessions, review teacher feedback, and view earned certifications.',
                            )}
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        {JSON.stringify(layout) !==
                            JSON.stringify(defaultLayout) && (
                            <Button
                                onClick={handleResetLayout}
                                variant="outline"
                                className="h-9 gap-1 rounded-full border-arabic-bronze/25 px-4 text-xs font-bold text-arabic-bronze shadow-sm hover:bg-arabic-cream"
                            >
                                <RefreshCw className="h-3.5 w-3.5 text-arabic-gold" />{' '}
                                {t('Reset Layout')}
                            </Button>
                        )}
                        <Link href="/student/dashboard#book-session">
                            <Button className="gap-1 rounded-full bg-arabic-gold text-xs font-black text-arabic-bronze shadow-md transition hover:bg-arabic-gold/90">
                                {t('Book Another Session')}{' '}
                                <ArrowUpRight className="h-3.5 w-3.5" />
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    {/* Left Grid */}
                    <div className="min-h-[300px] space-y-8 lg:col-span-8">
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

                    {/* Right Grid */}
                    <div className="min-h-[300px] space-y-8 lg:col-span-4">
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

                {/* Progress Details / Teacher Feedback Modal Drawer */}
                {selectedBooking && (
                    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-arabic-bronze/45 p-4 backdrop-blur-sm duration-200 fade-in">
                        <div className="flex max-h-[90vh] w-full max-w-lg animate-in flex-col overflow-hidden rounded-[2rem] border-2 border-arabic-cream bg-arabic-sand shadow-2xl duration-200 zoom-in-95">
                            <div className="flex shrink-0 items-center justify-between border-b border-arabic-cream bg-arabic-cream/60 px-6 py-4">
                                <div>
                                    <span className="block text-[9px] font-bold tracking-widest text-arabic-gold uppercase">
                                        {t('Class Recap')}
                                    </span>
                                    <h4 className="font-serif text-base font-black text-arabic-bronze">
                                        {getTranslation(
                                            selectedBooking.program.name,
                                            locale,
                                        )}
                                    </h4>
                                </div>
                                <button
                                    onClick={() => setSelectedBooking(null)}
                                    className="rounded-full p-2 text-arabic-bronze/60 transition hover:bg-arabic-cream hover:text-arabic-bronze"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="flex-1 space-y-6 overflow-y-auto p-6">
                                <div className="flex items-center justify-between rounded-xl border border-arabic-cream bg-arabic-cream/20 p-3 text-[11px] font-bold">
                                    <div>
                                        <span className="block text-[9px] text-arabic-bronze/60">
                                            {t('Teacher')}
                                        </span>
                                        <span className="text-arabic-bronze">
                                            {selectedBooking.slot.teacher.name}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-[9px] text-arabic-bronze/60">
                                            {t('Date')}
                                        </span>
                                        <span className="text-arabic-bronze">
                                            {new Date(
                                                selectedBooking.slot.start_time,
                                            ).toLocaleDateString(
                                                locale === 'id'
                                                    ? 'id-ID'
                                                    : locale === 'ar'
                                                      ? 'ar-EG'
                                                      : 'en-US',
                                                {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                },
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <span className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                        {t('Teacher Assessment & Feedback')}
                                    </span>
                                    <div className="min-h-[120px] rounded-2xl border border-arabic-cream bg-arabic-cream/40 p-4 text-xs leading-relaxed font-medium whitespace-pre-line text-arabic-bronze/90">
                                        {selectedBooking.teacher_feedback ||
                                            t(
                                                "The teacher hasn't logged the progress feedback for this session yet.",
                                            )}
                                    </div>
                                </div>

                                {selectedBooking.student_notes && (
                                    <div className="space-y-1">
                                        <span className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                            {t('My Study Intentions')}
                                        </span>
                                        <p className="text-xs font-medium text-arabic-bronze/80 italic">
                                            "{selectedBooking.student_notes}"
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex shrink-0 justify-end border-t border-arabic-cream bg-arabic-cream/30 px-6 py-4">
                                <Button
                                    onClick={() => setSelectedBooking(null)}
                                    className="rounded-full bg-arabic-bronze px-6 text-xs font-bold text-arabic-sand hover:bg-arabic-bronze/90"
                                >
                                    {t('Close')}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
