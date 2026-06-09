import { Head, useForm, Link, router, usePage } from '@inertiajs/react';
import {
    Award,
    Users,
    BookOpen,
    Calendar,
    Clock,
    Check,
    X,
    User,
    ArrowRight,
    GripVertical,
    RefreshCw,
} from 'lucide-react';
import React, { useState } from 'react';
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
import { dashboard as adminDashboard } from '@/routes/admin';
import { store as storeCertificate } from '@/routes/admin/certificates';

interface Student {
    id: number;
    name: string;
    email: string;
    student_bookings_count: number;
}

interface Teacher {
    id: number;
    name: string;
    email: string;
    slots_count: number;
    teacher_profile?: {
        bio: string;
        whatsapp_number: string;
    };
}

interface Booking {
    id: number;
    status: string;
    student: {
        name: string;
    };
    slot: {
        start_time: string;
        teacher: {
            name: string;
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
    student: {
        name: string;
        email: string;
    };
    program: {
        name: string;
    };
}

interface Program {
    id: number;
    name: string;
    description: string;
    is_hidden: boolean;
}

interface AdminDashboardProps {
    metrics: {
        totalBookings: number;
        completedBookings: number;
        activeStudentsCount: number;
        activeTeachersCount: number;
        totalCertificatesCount: number;
    };
    students: Student[];
    teachers: Teacher[];
    bookings: Booking[];
    certificates: Certificate[];
    programs: Program[];
}

export default function AdminDashboard({
    metrics,
    students = [],
    teachers = [],
    bookings = [],
    certificates = [],
    programs = [],
}: AdminDashboardProps) {
    const [isIssuing, setIsIssuing] = useState(false);
    const { t, locale } = useTranslation();

    const { auth } = usePage<any>().props;
    const user = auth?.user;

    const defaultLayout = {
        left: ['teachers_registry', 'students_registry', 'classroom_activity'],
        right: ['programs_overview', 'certificates_audit'],
    };

    const [layout, setLayout] = useState(() => {
        let left = [
            'teachers_registry',
            'students_registry',
            'classroom_activity',
        ];
        let right = ['programs_overview', 'certificates_audit'];

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

        return { left, right };
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

    const certForm = useForm({
        student_id: '',
        program_id: '',
        notes: '',
    });

    const handleIssueCertificateSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!certForm.data.student_id) {
            toast.error('Please select a student.');

            return;
        }

        if (!certForm.data.program_id) {
            toast.error('Please select a program.');

            return;
        }

        certForm.post(storeCertificate().url, {
            onSuccess: () => {
                setIsIssuing(false);
                certForm.reset();
                toast.success(
                    'Alhamdulillah! Official learning certificate has been successfully issued!',
                );
            },
            onError: (err: any) => {
                toast.error(err.error || 'Failed to issue certificate.');
            },
        });
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Admin Portal', href: adminDashboard() },
    ];

    const renderSection = (id: string) => {
        switch (id) {
            case 'teachers_registry':
                return (
                    <Card className="overflow-hidden rounded-[1.5rem] border border-arabic-cream bg-arabic-sand shadow-sm">
                        <CardHeader className="border-b border-arabic-cream/40 bg-arabic-cream/10 p-5 pb-2">
                            <div className="flex cursor-grab items-center justify-between active:cursor-grabbing">
                                <CardTitle className="flex items-center gap-2 text-sm font-black tracking-wider text-arabic-bronze uppercase">
                                    <GripVertical className="h-4 w-4 shrink-0 text-arabic-gold/70" />
                                    <Users className="h-4.5 w-4.5 text-arabic-gold" />{' '}
                                    Moroccan Teachers Registry
                                </CardTitle>
                                <Badge className="bg-arabic-cream text-[9px] font-bold text-arabic-bronze">
                                    Draggable
                                </Badge>
                            </div>
                            <CardDescription className="mt-1 text-[11px] font-medium text-arabic-bronze/70">
                                Approved native teachers and their scheduled
                                tutoring capacities.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[600px] border-collapse text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-arabic-cream/45 bg-arabic-cream/20 text-[10px] font-black tracking-wider text-arabic-bronze/80 uppercase">
                                            <th className="p-4">
                                                Teacher Name
                                            </th>
                                            <th className="p-4">
                                                Contact Info
                                            </th>
                                            <th className="p-4 text-center">
                                                Open Hours
                                            </th>
                                            <th className="p-4 text-right">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-arabic-cream/35 font-semibold text-arabic-bronze">
                                        {teachers.map((teacher) => (
                                            <tr
                                                key={teacher.id}
                                                className="transition hover:bg-arabic-cream/10"
                                            >
                                                <td className="flex items-center gap-2.5 p-4">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-arabic-cream text-xs shadow-inner">
                                                        🇲🇦
                                                    </div>
                                                    <span className="font-extrabold text-arabic-bronze">
                                                        {teacher.name}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-mono text-[10px] text-arabic-bronze/70">
                                                    {teacher.email} <br />
                                                    <span className="text-[10px] font-bold text-arabic-gold">
                                                        {
                                                            teacher
                                                                .teacher_profile
                                                                ?.whatsapp_number
                                                        }
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center font-extrabold text-arabic-gold">
                                                    {teacher.slots_count} slots
                                                </td>
                                                <td className="p-4 text-right">
                                                    <Badge className="rounded-full bg-arabic-emerald px-2 py-0.5 text-[9px] font-bold text-white">
                                                        Active
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end border-t border-arabic-cream/40 bg-arabic-cream/5 p-5">
                            <Link
                                href="/admin/teachers"
                                className="w-full sm:w-auto"
                            >
                                <Button className="h-9 w-full gap-1.5 rounded-xl bg-arabic-bronze text-xs font-bold text-arabic-sand shadow-sm hover:bg-arabic-bronze/90 sm:w-auto">
                                    Manage Teachers{' '}
                                    <ArrowRight className="h-3.5 w-3.5 text-arabic-gold" />
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                );

            case 'students_registry':
                return (
                    <Card className="overflow-hidden rounded-[1.5rem] border border-arabic-cream bg-arabic-sand shadow-sm">
                        <CardHeader className="border-b border-arabic-cream/40 bg-arabic-cream/10 p-5 pb-2">
                            <div className="flex cursor-grab items-center justify-between active:cursor-grabbing">
                                <CardTitle className="flex items-center gap-2 text-sm font-black tracking-wider text-arabic-bronze uppercase">
                                    <GripVertical className="h-4 w-4 shrink-0 text-arabic-gold/70" />
                                    <Users className="h-4.5 w-4.5 text-arabic-gold" />{' '}
                                    Active Students Registry
                                </CardTitle>
                                <Badge className="bg-arabic-cream text-[9px] font-bold text-arabic-bronze">
                                    Draggable
                                </Badge>
                            </div>
                            <CardDescription className="mt-1 text-[11px] font-medium text-arabic-bronze/70">
                                Registered students and their total private
                                learning hours booked.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[500px] border-collapse text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-arabic-cream/45 bg-arabic-cream/20 text-[10px] font-black tracking-wider text-arabic-bronze/80 uppercase">
                                            <th className="p-4">
                                                Student Name & Account
                                            </th>
                                            <th className="p-4">
                                                Total Bookings
                                            </th>
                                            <th className="p-4 text-right">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-arabic-cream/35 font-semibold text-arabic-bronze">
                                        {students.map((student) => (
                                            <tr
                                                key={student.id}
                                                className="transition hover:bg-arabic-cream/10"
                                            >
                                                <td className="p-4">
                                                    <span className="block font-extrabold text-arabic-bronze">
                                                        {student.name}
                                                    </span>
                                                    <span className="mt-0.5 block font-mono text-[10px] text-arabic-bronze/60">
                                                        {student.email}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-bold text-arabic-bronze/70">
                                                    {
                                                        student.student_bookings_count
                                                    }{' '}
                                                    hours booked
                                                </td>
                                                <td className="p-4 text-right">
                                                    <Badge className="rounded-full border border-arabic-bronze/25 bg-arabic-bronze/10 px-2 py-0.5 text-[9px] font-bold text-arabic-bronze">
                                                        Enrolled
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end border-t border-arabic-cream/40 bg-arabic-cream/5 p-5">
                            <Link
                                href="/admin/students"
                                className="w-full sm:w-auto"
                            >
                                <Button className="h-9 w-full gap-1.5 rounded-xl bg-arabic-bronze text-xs font-bold text-arabic-sand shadow-sm hover:bg-arabic-bronze/90 sm:w-auto">
                                    Manage Students{' '}
                                    <ArrowRight className="h-3.5 w-3.5 text-arabic-gold" />
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                );

            case 'classroom_activity':
                return (
                    <Card className="overflow-hidden rounded-[1.5rem] border border-arabic-cream bg-arabic-sand shadow-sm">
                        <CardHeader className="border-b border-arabic-cream/40 bg-arabic-cream/10 p-5 pb-2">
                            <div className="flex cursor-grab items-center justify-between active:cursor-grabbing">
                                <CardTitle className="flex items-center gap-2 text-sm font-black tracking-wider text-arabic-bronze uppercase">
                                    <GripVertical className="h-4 w-4 shrink-0 text-arabic-gold/70" />
                                    <Calendar className="h-4.5 w-4.5 text-arabic-gold" />{' '}
                                    Recent Classroom Activity
                                </CardTitle>
                                <Badge className="bg-arabic-cream text-[9px] font-bold text-arabic-bronze">
                                    Draggable
                                </Badge>
                            </div>
                            <CardDescription className="mt-1 text-[11px] font-medium text-arabic-bronze/70">
                                Latest scheduled private sessions across all
                                Quranic programs.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[600px] border-collapse text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-arabic-cream/45 bg-arabic-cream/20 text-[10px] font-black tracking-wider text-arabic-bronze/80 uppercase">
                                            <th className="p-4">Student</th>
                                            <th className="p-4">
                                                Teacher & Time
                                            </th>
                                            <th className="p-4">Program</th>
                                            <th className="p-4 text-right">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-arabic-cream/35 font-semibold text-arabic-bronze">
                                        {bookings.map((booking) => {
                                            const dateStr = new Date(
                                                booking.slot.start_time,
                                            ).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            });

                                            return (
                                                <tr
                                                    key={booking.id}
                                                    className="transition hover:bg-arabic-cream/10"
                                                >
                                                    <td className="p-4">
                                                        <span className="font-extrabold text-arabic-bronze">
                                                            {
                                                                booking.student
                                                                    .name
                                                            }
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="block font-bold text-arabic-bronze">
                                                            {
                                                                booking.slot
                                                                    .teacher
                                                                    .name
                                                            }
                                                        </span>
                                                        <span className="mt-0.5 block text-[10px] font-medium text-arabic-bronze/60">
                                                            {dateStr}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="rounded-full border border-arabic-cream/80 bg-arabic-cream px-2 py-0.5 text-[10px] font-bold text-arabic-bronze">
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
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <Badge
                                                            className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                                                booking.status ===
                                                                'completed'
                                                                    ? 'bg-arabic-emerald text-white'
                                                                    : booking.status ===
                                                                        'confirmed'
                                                                      ? 'bg-arabic-gold text-arabic-bronze'
                                                                      : 'bg-rose-500 text-white'
                                                            }`}
                                                        >
                                                            {booking.status}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {bookings.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="p-8 text-center text-xs font-bold text-arabic-bronze/50"
                                                >
                                                    No sessions booked yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                );

            case 'programs_overview':
                return (
                    <Card className="overflow-hidden rounded-[1.5rem] border border-arabic-cream bg-arabic-sand shadow-sm">
                        <CardHeader className="border-b border-arabic-cream/40 bg-arabic-cream/10 p-5 pb-2">
                            <div className="flex cursor-grab items-center justify-between active:cursor-grabbing">
                                <CardTitle className="flex items-center gap-2 text-sm font-black tracking-wider text-arabic-bronze uppercase">
                                    <GripVertical className="h-4 w-4 shrink-0 text-arabic-gold/70" />
                                    <BookOpen className="h-4.5 w-4.5 text-arabic-gold" />{' '}
                                    Programs Overview
                                </CardTitle>
                                <Badge className="bg-arabic-cream text-[9px] font-bold text-arabic-bronze">
                                    Draggable
                                </Badge>
                            </div>
                            <CardDescription className="mt-1 text-[11px] font-medium text-arabic-bronze/70">
                                Quick look at listed learning programs.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 pb-0">
                            <div className="space-y-3.5">
                                {programs.slice(0, 5).map((program) => (
                                    <div
                                        key={program.id}
                                        className="flex items-center justify-between text-xs font-semibold"
                                    >
                                        <span className="block font-bold text-arabic-bronze">
                                            {getTranslation(
                                                program.name,
                                                locale,
                                            )}
                                        </span>
                                        {program.is_hidden ? (
                                            <Badge className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold text-amber-600">
                                                Hidden
                                            </Badge>
                                        ) : (
                                            <Badge className="rounded-full bg-arabic-emerald px-2 py-0.5 text-[9px] font-bold text-white">
                                                Visible
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                                {programs.length === 0 && (
                                    <p className="py-2 text-center text-xs font-bold text-arabic-bronze/50">
                                        No programs defined.
                                    </p>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="p-5 pt-0">
                            <Link href="/admin/programs" className="w-full">
                                <Button className="mt-4 h-9 w-full gap-1 rounded-xl bg-arabic-bronze text-xs font-bold text-arabic-sand shadow-sm hover:bg-arabic-bronze/90">
                                    Manage Programs{' '}
                                    <ArrowRight className="h-3.5 w-3.5 text-arabic-gold" />
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                );

            case 'certificates_audit':
                return (
                    <Card className="overflow-hidden rounded-[1.5rem] border border-arabic-cream bg-arabic-sand shadow-sm">
                        <CardHeader className="border-b border-arabic-cream/40 bg-arabic-cream/10 p-5 pb-2">
                            <div className="flex cursor-grab items-center justify-between active:cursor-grabbing">
                                <CardTitle className="flex items-center gap-2 text-sm font-black tracking-wider text-arabic-bronze uppercase">
                                    <GripVertical className="h-4 w-4 shrink-0 text-arabic-gold/70" />
                                    <Award className="h-4.5 w-4.5 text-arabic-gold" />{' '}
                                    Certificates Audit Logs
                                </CardTitle>
                                <Badge className="bg-arabic-cream text-[9px] font-bold text-arabic-bronze">
                                    Draggable
                                </Badge>
                            </div>
                            <CardDescription className="mt-1 text-[11px] font-medium text-arabic-bronze/70">
                                Historical log of officially awarded
                                credentials.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-5">
                            {certificates.length > 0 ? (
                                <div className="relative max-h-[640px] space-y-5 overflow-y-auto border-l border-arabic-cream pr-1 pl-4">
                                    {certificates.map((cert) => {
                                        const issueDate = new Date(
                                            cert.issued_at,
                                        ).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        });

                                        return (
                                            <div
                                                key={cert.id}
                                                className="relative text-xs"
                                            >
                                                <div className="absolute top-1.5 -left-[21px] h-2 w-2 rounded-full border border-arabic-sand bg-arabic-gold" />

                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <span className="block text-[9px] font-bold tracking-wider text-arabic-bronze/60 uppercase">
                                                            Recipient
                                                        </span>
                                                        <span className="block font-extrabold text-arabic-bronze">
                                                            {cert.student.name}
                                                        </span>
                                                    </div>
                                                    <span className="shrink-0 text-[10px] font-bold text-arabic-gold">
                                                        {issueDate}
                                                    </span>
                                                </div>
                                                <div className="mt-2 rounded-xl border border-arabic-cream/60 bg-arabic-cream/35 p-2.5">
                                                    <span className="block font-extrabold text-arabic-bronze">
                                                        {getTranslation(
                                                            cert.program.name,
                                                            locale,
                                                        )}
                                                    </span>
                                                    {cert.notes && (
                                                        <p className="mt-1 text-[10px] leading-relaxed font-medium text-arabic-bronze/80">
                                                            "{cert.notes}"
                                                        </p>
                                                    )}
                                                    <span className="mt-1.5 block truncate font-mono text-[8px] leading-none text-arabic-bronze/55">
                                                        Hash:{' '}
                                                        {cert.verification_hash.substring(
                                                            0,
                                                            16,
                                                        )}
                                                        ...
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="rounded-xl border border-arabic-cream bg-arabic-sand/50 p-8 text-center text-xs font-bold text-arabic-bronze/50">
                                    No credentials issued on the platform yet.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );

            default:
                return null;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />

            <div className="min-h-screen w-full space-y-8 bg-arabic-sand/20 p-6">
                {/* Header Welcome Bar */}
                <div className="flex flex-col justify-between gap-4 border-b border-arabic-cream/60 pb-6 md:flex-row md:items-center">
                    <div>
                        <h1 className="font-serif text-3xl font-black text-arabic-bronze">
                            Admin Control Panel
                        </h1>
                        <p className="mt-1 text-xs font-medium text-arabic-bronze/70">
                            Review platform analytics, manage user registries,
                            and award credentials.
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
                                Reset Layout
                            </Button>
                        )}
                        <Button
                            onClick={() => setIsIssuing(true)}
                            className="h-9 shrink-0 gap-1 rounded-full bg-arabic-gold px-4 text-xs font-black text-arabic-bronze shadow-md transition hover:bg-arabic-gold/90"
                        >
                            <Award className="h-4 w-4" /> Issue Official
                            Certificate
                        </Button>
                    </div>
                </div>

                {/* Analytical Summary Metrics Grid */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
                    {/* Total Bookings */}
                    <Card className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-arabic-cream bg-arabic-sand p-5 shadow-sm">
                        <BookOpen className="mb-2 h-8 w-8 text-arabic-gold" />
                        <div>
                            <span className="text-2xl font-black text-arabic-bronze">
                                {metrics.totalBookings}
                            </span>
                            <p className="text-[10px] font-bold tracking-wider text-arabic-bronze/60 uppercase">
                                {t('Total Bookings')}
                            </p>
                        </div>
                    </Card>

                    {/* Completed Sessions */}
                    <Card className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-arabic-cream bg-arabic-sand p-5 shadow-sm">
                        <Check className="mb-2 h-8 w-8 text-arabic-emerald" />
                        <div>
                            <span className="text-2xl font-black text-arabic-bronze">
                                {metrics.completedBookings}
                            </span>
                            <p className="text-[10px] font-bold tracking-wider text-arabic-bronze/60 uppercase">
                                {t('Completed Sessions')}
                            </p>
                        </div>
                    </Card>

                    {/* Active Students */}
                    <Card className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-arabic-cream bg-arabic-sand p-5 shadow-sm">
                        <Users className="mb-2 h-8 w-8 text-arabic-gold" />
                        <div>
                            <span className="text-2xl font-black text-arabic-bronze">
                                {metrics.activeStudentsCount}
                            </span>
                            <p className="text-[10px] font-bold tracking-wider text-arabic-bronze/60 uppercase">
                                {t('Active Students')}
                            </p>
                        </div>
                    </Card>

                    {/* Native Teachers */}
                    <Card className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-arabic-cream bg-arabic-sand p-5 shadow-sm">
                        <User className="mb-2 h-8 w-8 text-arabic-gold" />
                        <div>
                            <span className="text-2xl font-black text-arabic-bronze">
                                {metrics.activeTeachersCount}
                            </span>
                            <p className="text-[10px] font-bold tracking-wider text-arabic-bronze/60 uppercase">
                                {t('Active Teachers')}
                            </p>
                        </div>
                    </Card>

                    {/* Credentials Issued */}
                    <Card className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-arabic-cream bg-arabic-sand p-5 shadow-sm">
                        <Award className="mb-2 h-8 w-8 text-arabic-gold" />
                        <div>
                            <span className="text-2xl font-black text-arabic-bronze">
                                {metrics.totalCertificatesCount}
                            </span>
                            <p className="text-[10px] font-bold tracking-wider text-arabic-bronze/60 uppercase">
                                {t('Issued Certificates')}
                            </p>
                        </div>
                    </Card>
                </div>

                {/* Main Content Layout Grid */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    {/* Left Column */}
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

                    {/* Right Column */}
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

                {/* Issue Certificate Modal */}
                {isIssuing && (
                    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-arabic-bronze/45 p-4 backdrop-blur-sm duration-200 fade-in">
                        <div className="flex max-h-[90vh] w-full max-w-lg animate-in flex-col overflow-hidden rounded-[2rem] border-2 border-arabic-cream bg-arabic-sand shadow-2xl duration-200 zoom-in-95">
                            <div className="flex shrink-0 items-center justify-between border-b border-arabic-cream bg-arabic-cream/60 px-6 py-4">
                                <div>
                                    <span className="block text-[9px] font-bold tracking-widest text-arabic-gold uppercase">
                                        Credential Manager
                                    </span>
                                    <h4 className="font-serif text-base font-black text-arabic-bronze">
                                        Award Official Certificate
                                    </h4>
                                </div>
                                <button
                                    onClick={() => setIsIssuing(false)}
                                    className="rounded-full p-2 text-arabic-bronze/60 transition hover:bg-arabic-cream hover:text-arabic-bronze"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form
                                onSubmit={handleIssueCertificateSubmit}
                                className="flex flex-1 flex-col overflow-hidden"
                            >
                                <div className="flex-1 space-y-4 overflow-y-auto p-6">
                                    {/* Select Student */}
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                            Select Student Recipient
                                        </label>
                                        <select
                                            value={certForm.data.student_id}
                                            onChange={(e) =>
                                                certForm.setData(
                                                    'student_id',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-xl border border-arabic-cream bg-arabic-sand p-3 text-xs font-bold text-arabic-bronze shadow-sm outline-none focus:border-arabic-gold"
                                        >
                                            <option value="">
                                                -- Choose student recipient --
                                            </option>
                                            {students.map((student) => (
                                                <option
                                                    key={student.id}
                                                    value={student.id}
                                                >
                                                    {student.name} (
                                                    {student.email})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Select Program */}
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                            Select Quranic Program
                                        </label>
                                        <select
                                            value={certForm.data.program_id}
                                            onChange={(e) =>
                                                certForm.setData(
                                                    'program_id',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-xl border border-arabic-cream bg-arabic-sand p-3 text-xs font-bold text-arabic-bronze shadow-sm outline-none focus:border-arabic-gold"
                                        >
                                            <option value="">
                                                -- Choose Quranic program --
                                            </option>
                                            {programs.map((prog) => (
                                                <option
                                                    key={prog.id}
                                                    value={prog.id}
                                                >
                                                    {getTranslation(
                                                        prog.name,
                                                        locale,
                                                    )}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Custom Notes */}
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                            Audit/Issuance Notes
                                        </label>
                                        <Textarea
                                            placeholder="Write special citation (e.g. Completed Tajweed recitation with excellent marks under teacher evaluation)..."
                                            value={certForm.data.notes}
                                            onChange={(e) =>
                                                certForm.setData(
                                                    'notes',
                                                    e.target.value,
                                                )
                                            }
                                            className="min-h-[90px] rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                        />
                                    </div>
                                </div>

                                <div className="flex shrink-0 justify-end gap-2 border-t border-arabic-cream bg-arabic-cream/30 px-6 py-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsIssuing(false)}
                                        className="h-9 rounded-full border-arabic-bronze/25 text-xs font-bold text-arabic-bronze hover:bg-arabic-cream"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={certForm.processing}
                                        className="h-9 rounded-full bg-arabic-bronze px-6 text-xs font-bold text-arabic-sand shadow-sm hover:bg-arabic-bronze/90"
                                    >
                                        {certForm.processing
                                            ? 'Issuing...'
                                            : 'Issue Certificate'}
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
