import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    Users,
    Plus,
    X,
    Edit2,
    Trash2,
    Video,
    Phone,
    Award,
    Mail,
    Key,
    Clock,
    Search,
    Calendar,
    Check,
    Trash,
} from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { dashboard } from '@/routes';
import { dashboard as adminDashboard } from '@/routes/admin';

interface Teacher {
    id: number;
    name: string;
    email: string;
    slots_count: number;
    teacher_profile?: {
        bio: string;
        whatsapp_number: string;
        zoom_link?: string;
        google_meet_link?: string;
        specializations_json?: string[];
    };
}

interface Slot {
    id: number;
    teacher_id: number;
    start_time: string;
    end_time: string;
    is_booked: boolean;
    teacher?: {
        name: string;
    };
}

interface TeachersProps {
    teachers: Teacher[];
    slots?: Slot[];
}

// Custom type helper for our form state
interface TeacherFormState {
    name: string;
    email: string;
    password?: string;
    bio: string;
    whatsapp_number: string;
    zoom_link: string;
    google_meet_link: string;
    specializations_json: string;
}

export default function Teachers({ teachers = [], slots = [] }: TeachersProps) {
    const [isAddingTeacher, setIsAddingTeacher] = useState(false);
    const [isAddingSlot, setIsAddingSlot] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

    const [teacherFilter, setTeacherFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [selectedSlotIds, setSelectedSlotIds] = useState<number[]>([]);

    const filteredSlots = slots.filter((slot) => {
        const teacherName = slot.teacher?.name || '';
        const matchesTeacher = teacherName
            .toLowerCase()
            .includes(teacherFilter.toLowerCase());

        let matchesDate = true;
        if (dateFilter) {
            const slotDateStr = new Date(slot.start_time)
                .toISOString()
                .split('T')[0];
            matchesDate = slotDateStr === dateFilter;
        }

        return matchesTeacher && matchesDate;
    });

    const unbookedFilteredSlots = filteredSlots.filter((s) => !s.is_booked);
    const allFilteredUnbookedSelected =
        unbookedFilteredSlots.length > 0 &&
        unbookedFilteredSlots.every((s) => selectedSlotIds.includes(s.id));

    const toggleSelectSlot = (slotId: number) => {
        setSelectedSlotIds((prev) =>
            prev.includes(slotId)
                ? prev.filter((id) => id !== slotId)
                : [...prev, slotId],
        );
    };

    const toggleSelectAllFiltered = () => {
        if (allFilteredUnbookedSelected) {
            const filteredIds = unbookedFilteredSlots.map((s) => s.id);
            setSelectedSlotIds((prev) =>
                prev.filter((id) => !filteredIds.includes(id)),
            );
        } else {
            const filteredIds = unbookedFilteredSlots.map((s) => s.id);
            setSelectedSlotIds((prev) => {
                const newIds = [...prev];
                filteredIds.forEach((id) => {
                    if (!newIds.includes(id)) {
                        newIds.push(id);
                    }
                });
                return newIds;
            });
        }
    };

    const handleDeleteSelected = () => {
        const unbookedSelectedIds = selectedSlotIds.filter((id) => {
            const slot = slots.find((s) => s.id === id);
            return slot && !slot.is_booked;
        });

        if (unbookedSelectedIds.length === 0) {
            toast.error('No available/unbooked slots selected.');
            return;
        }

        if (
            confirm(
                `Are you sure you want to delete the ${unbookedSelectedIds.length} selected unbooked slots?`,
            )
        ) {
            router.delete('/admin/slots/bulk', {
                data: { ids: unbookedSelectedIds },
                onSuccess: () => {
                    setSelectedSlotIds([]);
                    toast.success(
                        'Selected teaching slots deleted successfully.',
                    );
                },
                onError: (err: any) => {
                    toast.error(
                        err.error || 'Failed to delete selected slots.',
                    );
                },
            });
        }
    };

    const handleDeleteAllUnbooked = () => {
        if (
            confirm(
                'Are you sure you want to delete ALL available (unbooked) teaching slots across the entire platform? This action cannot be undone.',
            )
        ) {
            router.delete('/admin/slots/all', {
                onSuccess: () => {
                    setSelectedSlotIds([]);
                    toast.success(
                        'All unbooked teaching slots cleared successfully.',
                    );
                },
                onError: (err: any) => {
                    toast.error(err.error || 'Failed to clear slots.');
                },
            });
        }
    };

    const handleDeleteSingleSlot = (slotId: number) => {
        if (confirm('Are you sure you want to delete this teaching slot?')) {
            router.delete(`/teacher/slots/${slotId}`, {
                onSuccess: () => {
                    setSelectedSlotIds((prev) =>
                        prev.filter((id) => id !== slotId),
                    );
                    toast.success('Teaching slot deleted successfully.');
                },
                onError: (err: any) => {
                    toast.error(err.error || 'Failed to delete slot.');
                },
            });
        }
    };

    const newTeacherForm = useForm<Required<TeacherFormState>>({
        name: '',
        email: '',
        password: '',
        bio: '',
        whatsapp_number: '',
        zoom_link: '',
        google_meet_link: '',
        specializations_json: '',
    });

    const editTeacherForm = useForm<TeacherFormState>({
        name: '',
        email: '',
        password: '',
        bio: '',
        whatsapp_number: '',
        zoom_link: '',
        google_meet_link: '',
        specializations_json: '',
    });

    const deleteTeacherForm = useForm({});

    const newSlotForm = useForm({
        teacher_id: '',
        start_time: '',
        duration: '60',
    });

    const handleAddSlotSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!newSlotForm.data.teacher_id) {
            toast.error('Please select a teacher.');
            return;
        }
        if (!newSlotForm.data.start_time) {
            toast.error('Please select a start date & time.');
            return;
        }

        newSlotForm.post('/admin/slots', {
            onSuccess: () => {
                setIsAddingSlot(false);
                newSlotForm.reset();
                toast.success(
                    'Alhamdulillah! Teaching slot successfully created.',
                );
            },
            onError: (err: any) => {
                toast.error(err.error || 'Failed to create slot.');
            },
        });
    };

    const handleAddTeacherSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!newTeacherForm.data.name) {
            toast.error("Please provide the teacher's name.");
            return;
        }
        if (!newTeacherForm.data.email) {
            toast.error('Please provide a valid email address.');
            return;
        }
        if (
            !newTeacherForm.data.password ||
            newTeacherForm.data.password.length < 8
        ) {
            toast.error('Password must be at least 8 characters long.');
            return;
        }
        if (!newTeacherForm.data.bio) {
            toast.error('Please provide a brief teacher biography.');
            return;
        }
        if (!newTeacherForm.data.whatsapp_number) {
            toast.error('Please provide a WhatsApp contact number.');
            return;
        }

        newTeacherForm.post('/admin/teachers', {
            onSuccess: () => {
                setIsAddingTeacher(false);
                newTeacherForm.reset();
                toast.success(
                    'Alhamdulillah! New Teacher account successfully created!',
                );
            },
            onError: (err: any) => {
                toast.error(err.error || 'Failed to add teacher.');
            },
        });
    };

    const handleEditTeacherSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingTeacher) return;

        if (!editTeacherForm.data.name) {
            toast.error("Please provide the teacher's name.");
            return;
        }
        if (!editTeacherForm.data.email) {
            toast.error('Please provide a valid email address.');
            return;
        }
        if (
            editTeacherForm.data.password &&
            editTeacherForm.data.password.length < 8
        ) {
            toast.error('Password must be at least 8 characters long.');
            return;
        }
        if (!editTeacherForm.data.bio) {
            toast.error('Please provide a brief teacher biography.');
            return;
        }
        if (!editTeacherForm.data.whatsapp_number) {
            toast.error('Please provide a WhatsApp contact number.');
            return;
        }

        editTeacherForm.put(`/admin/teachers/${editingTeacher.id}`, {
            onSuccess: () => {
                setEditingTeacher(null);
                editTeacherForm.reset();
                toast.success(
                    'Alhamdulillah! Teacher account updated successfully!',
                );
            },
            onError: (err: any) => {
                toast.error(err.error || 'Failed to update teacher.');
            },
        });
    };

    const startEditing = (teacher: Teacher) => {
        setEditingTeacher(teacher);
        editTeacherForm.setData({
            name: teacher.name,
            email: teacher.email,
            password: '',
            bio: teacher.teacher_profile?.bio || '',
            whatsapp_number: teacher.teacher_profile?.whatsapp_number || '',
            zoom_link: teacher.teacher_profile?.zoom_link || '',
            google_meet_link: teacher.teacher_profile?.google_meet_link || '',
            specializations_json: Array.isArray(
                teacher.teacher_profile?.specializations_json,
            )
                ? teacher.teacher_profile.specializations_json.join(', ')
                : '',
        });
    };

    const handleDeleteTeacher = (teacher: Teacher) => {
        if (
            confirm(
                `Are you sure you want to delete the teacher "${teacher.name}"? This action cannot be undone.`,
            )
        ) {
            deleteTeacherForm.delete(`/admin/teachers/${teacher.id}`, {
                onSuccess: () => {
                    toast.success(
                        'Alhamdulillah! Teacher successfully removed.',
                    );
                },
                onError: (err: any) => {
                    toast.error(err.error || 'Failed to delete teacher.');
                },
            });
        }
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Admin Portal', href: adminDashboard() },
        { title: 'Teachers', href: '/admin/teachers' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Teachers" />

            <div className="min-h-screen w-full space-y-8 bg-arabic-sand/20 p-6">
                {/* Header Welcome Bar */}
                <div className="flex flex-col justify-between gap-4 border-b border-arabic-cream/60 pb-6 md:flex-row md:items-center">
                    <div>
                        <h1 className="font-serif text-3xl font-black text-arabic-bronze">
                            Manage Native Teachers
                        </h1>
                        <p className="mt-1 text-xs font-medium text-arabic-bronze/70">
                            Add approved Moroccan educators, configure contact
                            credentials, and audit active teaching capacities.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            onClick={() => setIsAddingSlot(true)}
                            className="h-9 cursor-pointer gap-1 rounded-full border border-arabic-bronze/35 bg-arabic-cream px-4 text-xs font-black text-arabic-bronze shadow-md transition hover:bg-arabic-cream/80"
                        >
                            <Clock className="h-4 w-4 text-arabic-gold" /> Open
                            Teaching Hour
                        </Button>
                        <Button
                            onClick={() => setIsAddingTeacher(true)}
                            className="h-9 cursor-pointer gap-1 rounded-full bg-arabic-bronze px-4 text-xs font-black text-arabic-sand shadow-md transition hover:bg-arabic-bronze/90"
                        >
                            <Plus className="h-4 w-4" /> Add New Teacher
                        </Button>
                    </div>
                </div>

                {/* Main Content Area */}
                <Card className="overflow-hidden rounded-[1.5rem] border border-arabic-cream bg-arabic-sand shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-arabic-cream/40 bg-arabic-cream/10 p-5 pb-2">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-sm font-black tracking-wider text-arabic-bronze uppercase">
                                <Users className="h-4.5 w-4.5 text-arabic-gold" />{' '}
                                Teacher Directory
                            </CardTitle>
                            <CardDescription className="mt-1 text-[11px] font-medium text-arabic-bronze/70">
                                Complete registry list of all platform
                                educators.
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px] border-collapse text-left text-xs">
                                <thead>
                                    <tr className="border-b border-arabic-cream/45 bg-arabic-cream/20 text-[10px] font-black tracking-wider text-arabic-bronze/80 uppercase">
                                        <th className="p-4">Teacher Profile</th>
                                        <th className="p-4">Biography</th>
                                        <th className="p-4">
                                            Classrooms (Zoom/Meet)
                                        </th>
                                        <th className="p-4 text-center">
                                            Open Hours
                                        </th>
                                        <th className="p-4 text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-arabic-cream/35 font-semibold text-arabic-bronze">
                                    {teachers.map((teacher) => (
                                        <tr
                                            key={teacher.id}
                                            className="transition hover:bg-arabic-cream/10"
                                        >
                                            <td className="max-w-xs p-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-arabic-cream text-xs shadow-inner">
                                                        🇲🇦
                                                    </div>
                                                    <div>
                                                        <span className="block text-sm font-extrabold text-arabic-bronze">
                                                            {teacher.name}
                                                        </span>
                                                        <span className="mt-0.5 block font-mono text-[10px] text-arabic-bronze/60">
                                                            {teacher.email}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="mt-2.5 flex flex-wrap gap-1">
                                                    {Array.isArray(
                                                        teacher.teacher_profile
                                                            ?.specializations_json,
                                                    ) &&
                                                        teacher.teacher_profile.specializations_json.map(
                                                            (spec, idx) => (
                                                                <Badge
                                                                    key={idx}
                                                                    variant="secondary"
                                                                    className="border border-arabic-cream/90 bg-arabic-cream px-1.5 py-0 text-[8px] font-bold text-arabic-bronze"
                                                                >
                                                                    {spec}
                                                                </Badge>
                                                            ),
                                                        )}
                                                </div>
                                            </td>
                                            <td className="max-w-sm p-4">
                                                <p className="line-clamp-3 text-[10px] leading-relaxed font-medium text-arabic-bronze/80">
                                                    {teacher.teacher_profile
                                                        ?.bio ||
                                                        'No biography details logged.'}
                                                </p>
                                                <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-arabic-gold">
                                                    <Phone className="h-3.5 w-3.5" />{' '}
                                                    {teacher.teacher_profile
                                                        ?.whatsapp_number ||
                                                        'No number'}
                                                </div>
                                            </td>
                                            <td className="max-w-xs space-y-1 p-4 text-[10px]">
                                                {teacher.teacher_profile
                                                    ?.zoom_link && (
                                                    <a
                                                        href={
                                                            teacher
                                                                .teacher_profile
                                                                .zoom_link
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1.5 text-blue-600 hover:underline"
                                                    >
                                                        <Video className="h-3.5 w-3.5 text-blue-500" />{' '}
                                                        Zoom Room
                                                    </a>
                                                )}
                                                {teacher.teacher_profile
                                                    ?.google_meet_link && (
                                                    <a
                                                        href={
                                                            teacher
                                                                .teacher_profile
                                                                .google_meet_link
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1.5 text-emerald-600 hover:underline"
                                                    >
                                                        <Video className="h-3.5 w-3.5 text-emerald-500" />{' '}
                                                        Google Meet
                                                    </a>
                                                )}
                                                {!teacher.teacher_profile
                                                    ?.zoom_link &&
                                                    !teacher.teacher_profile
                                                        ?.google_meet_link && (
                                                        <span className="text-arabic-bronze/50">
                                                            No meeting links
                                                            set.
                                                        </span>
                                                    )}
                                            </td>
                                            <td className="p-4 text-center font-extrabold text-arabic-gold">
                                                {teacher.slots_count} slots
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() =>
                                                            startEditing(
                                                                teacher,
                                                            )
                                                        }
                                                        className="rounded-lg p-1.5 text-arabic-bronze/75 transition hover:bg-arabic-cream hover:text-arabic-bronze"
                                                        title="Edit Teacher Profile"
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteTeacher(
                                                                teacher,
                                                            )
                                                        }
                                                        className="rounded-lg p-1.5 text-rose-500 transition hover:bg-rose-500/10 hover:text-rose-700"
                                                        title="Delete Teacher"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {teachers.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="p-8 text-center text-xs font-bold text-arabic-bronze/50"
                                            >
                                                No teacher accounts defined in
                                                the database yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Slots Registry Section */}
                <Card className="mt-8 overflow-hidden rounded-[1.5rem] border border-arabic-cream bg-arabic-sand shadow-sm">
                    <CardHeader className="border-b border-arabic-cream/40 bg-arabic-cream/10 p-5 pb-4">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-sm font-black tracking-wider text-arabic-bronze uppercase">
                                    <Clock className="h-4.5 w-4.5 text-arabic-gold" />{' '}
                                    All Open Teaching Slots
                                </CardTitle>
                                <CardDescription className="mt-1 text-[11px] font-medium text-arabic-bronze/70">
                                    Manage, search, and bulk delete teaching
                                    availability slots across the platform.
                                </CardDescription>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    onClick={handleDeleteAllUnbooked}
                                    variant="outline"
                                    className="h-8 gap-1.5 rounded-full border-rose-500/30 px-3.5 text-[10px] font-bold text-rose-600 shadow-sm hover:bg-rose-500/10"
                                >
                                    <Trash className="h-3.5 w-3.5" /> Delete All
                                    Available
                                </Button>
                                <Button
                                    onClick={handleDeleteSelected}
                                    disabled={selectedSlotIds.length === 0}
                                    className="h-8 gap-1.5 rounded-full bg-rose-600 px-3.5 text-[10px] font-bold text-white shadow-sm hover:bg-rose-700 disabled:bg-arabic-bronze/10 disabled:text-arabic-bronze/40"
                                >
                                    <Trash2 className="h-3.5 w-3.5" /> Delete
                                    Selected ({selectedSlotIds.length})
                                </Button>
                            </div>
                        </div>

                        {/* Search & Filter Bar */}
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3.5 h-3.5 w-3.5 -translate-y-1/2 text-arabic-bronze/40" />
                                <Input
                                    type="text"
                                    placeholder="Filter by Teacher Name..."
                                    value={teacherFilter}
                                    onChange={(e) =>
                                        setTeacherFilter(e.target.value)
                                    }
                                    className="h-9 rounded-xl border-arabic-cream bg-arabic-sand/50 pl-9 text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                />
                            </div>
                            <div className="relative">
                                <Calendar className="pointer-events-none absolute top-1/2 left-3.5 h-3.5 w-3.5 -translate-y-1/2 text-arabic-bronze/40" />
                                <Input
                                    type="date"
                                    value={dateFilter}
                                    onChange={(e) =>
                                        setDateFilter(e.target.value)
                                    }
                                    className="h-9 rounded-xl border-arabic-cream bg-arabic-sand/50 pl-9 text-xs font-semibold text-arabic-bronze/70 shadow-sm focus:border-arabic-gold"
                                />
                                {dateFilter && (
                                    <button
                                        onClick={() => setDateFilter('')}
                                        className="absolute top-1/2 right-3.5 -translate-y-1/2 text-xs font-bold text-rose-500 hover:underline"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="max-h-[400px] overflow-x-auto overflow-y-auto">
                            <table className="w-full min-w-[600px] border-collapse text-left text-xs">
                                <thead>
                                    <tr className="border-b border-arabic-cream/45 bg-arabic-cream/20 text-[10px] font-black tracking-wider text-arabic-bronze/80 uppercase">
                                        <th className="w-12 p-4 text-center">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    allFilteredUnbookedSelected
                                                }
                                                onChange={
                                                    toggleSelectAllFiltered
                                                }
                                                disabled={
                                                    unbookedFilteredSlots.length ===
                                                    0
                                                }
                                                className="cursor-pointer rounded border-arabic-cream text-arabic-gold focus:ring-arabic-gold disabled:cursor-not-allowed disabled:opacity-40"
                                            />
                                        </th>
                                        <th className="p-4">Teacher</th>
                                        <th className="p-4">Slot Time</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-arabic-cream/35 font-semibold text-arabic-bronze">
                                    {filteredSlots.map((slot) => {
                                        const startTime = new Date(
                                            slot.start_time,
                                        );
                                        const endTime = new Date(slot.end_time);
                                        const duration = Math.round(
                                            (endTime.getTime() -
                                                startTime.getTime()) /
                                                (1000 * 60),
                                        );
                                        const formattedTime =
                                            startTime.toLocaleDateString(
                                                'en-US',
                                                {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                },
                                            ) +
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
                                            <tr
                                                key={slot.id}
                                                className="transition hover:bg-arabic-cream/10"
                                            >
                                                <td className="p-4 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedSlotIds.includes(
                                                            slot.id,
                                                        )}
                                                        onChange={() =>
                                                            toggleSelectSlot(
                                                                slot.id,
                                                            )
                                                        }
                                                        disabled={
                                                            slot.is_booked
                                                        }
                                                        className="cursor-pointer rounded border-arabic-cream text-arabic-gold focus:ring-arabic-gold disabled:cursor-not-allowed disabled:opacity-40"
                                                    />
                                                </td>
                                                <td className="flex items-center gap-2.5 p-4">
                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-arabic-cream text-[10px] shadow-inner">
                                                        👨‍🏫
                                                    </div>
                                                    <span className="font-bold text-arabic-bronze">
                                                        {slot.teacher?.name ||
                                                            'Unknown Teacher'}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-mono text-[11px] text-arabic-bronze/80">
                                                    {formattedTime}
                                                </td>
                                                <td className="p-4">
                                                    {slot.is_booked ? (
                                                        <Badge className="rounded-full bg-arabic-gold px-2 py-0.5 text-[9px] font-bold text-arabic-bronze">
                                                            Booked
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="outline"
                                                            className="rounded-full border-arabic-cream px-2 py-0.5 text-[9px] font-bold text-arabic-bronze/60"
                                                        >
                                                            Available
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="p-4 text-right">
                                                    {!slot.is_booked && (
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteSingleSlot(
                                                                    slot.id,
                                                                )
                                                            }
                                                            className="cursor-pointer rounded-lg p-1.5 text-rose-500 transition hover:bg-rose-500/10"
                                                            title="Delete Slot"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filteredSlots.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="p-8 text-center text-xs font-bold text-arabic-bronze/50"
                                            >
                                                No teaching slots found matching
                                                filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Open Teaching Hour Modal */}
                {isAddingSlot && (
                    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-arabic-bronze/45 p-4 backdrop-blur-sm duration-200 fade-in">
                        <div className="flex max-h-[90vh] w-full max-w-md animate-in flex-col overflow-hidden rounded-[2rem] border-2 border-arabic-cream bg-arabic-sand shadow-2xl duration-200 zoom-in-95">
                            <div className="flex shrink-0 items-center justify-between border-b border-arabic-cream bg-arabic-cream/60 px-6 py-4">
                                <div>
                                    <span className="block text-[9px] font-bold tracking-widest text-arabic-gold uppercase">
                                        Slot Configurator
                                    </span>
                                    <h4 className="font-serif text-base font-black text-arabic-bronze">
                                        Open Teaching Hour
                                    </h4>
                                </div>
                                <button
                                    onClick={() => setIsAddingSlot(false)}
                                    className="rounded-full p-2 text-arabic-bronze/60 transition hover:bg-arabic-cream hover:text-arabic-bronze"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form
                                onSubmit={handleAddSlotSubmit}
                                className="flex flex-1 flex-col overflow-hidden"
                            >
                                <div className="flex-1 space-y-4 overflow-y-auto p-6 text-xs">
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                            Select Teacher
                                        </label>
                                        <select
                                            value={newSlotForm.data.teacher_id}
                                            onChange={(e) =>
                                                newSlotForm.setData(
                                                    'teacher_id',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full cursor-pointer rounded-xl border border-arabic-cream bg-arabic-sand p-2.5 text-xs font-bold text-arabic-bronze shadow-sm outline-none focus:border-arabic-gold focus-visible:ring-0"
                                        >
                                            <option value="">
                                                -- Select a Teacher --
                                            </option>
                                            {teachers.map((t) => (
                                                <option key={t.id} value={t.id}>
                                                    {t.name} ({t.email})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                            Class Start Time
                                        </label>
                                        <Input
                                            type="datetime-local"
                                            value={newSlotForm.data.start_time}
                                            onChange={(e) =>
                                                newSlotForm.setData(
                                                    'start_time',
                                                    e.target.value,
                                                )
                                            }
                                            className="rounded-xl border-arabic-cream bg-arabic-sand text-xs placeholder:text-arabic-bronze/40 focus:border-arabic-gold focus-visible:ring-0"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                            Session Duration
                                        </label>
                                        <select
                                            value={newSlotForm.data.duration}
                                            onChange={(e) =>
                                                newSlotForm.setData(
                                                    'duration',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full cursor-pointer rounded-xl border border-arabic-cream bg-arabic-sand p-2.5 text-xs font-bold text-arabic-bronze shadow-sm outline-none focus:border-arabic-gold focus-visible:ring-0"
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
                                        onClick={() => setIsAddingSlot(false)}
                                        className="h-9 rounded-full border-arabic-bronze/25 text-xs font-bold text-arabic-bronze hover:bg-arabic-cream"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={newSlotForm.processing}
                                        className="h-9 rounded-full bg-arabic-bronze px-6 text-xs font-bold text-arabic-sand shadow-sm hover:bg-arabic-bronze/90"
                                    >
                                        {newSlotForm.processing
                                            ? 'Opening...'
                                            : 'Open Slot'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Add Teacher Modal */}
                {isAddingTeacher && (
                    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-arabic-bronze/45 p-4 backdrop-blur-sm duration-200 fade-in">
                        <div className="flex max-h-[90vh] w-full max-w-lg animate-in flex-col overflow-hidden rounded-[2rem] border-2 border-arabic-cream bg-arabic-sand shadow-2xl duration-200 zoom-in-95">
                            <div className="flex shrink-0 items-center justify-between border-b border-arabic-cream bg-arabic-cream/60 px-6 py-4">
                                <div>
                                    <span className="block text-[9px] font-bold tracking-widest text-arabic-gold uppercase">
                                        Teacher Onboarding
                                    </span>
                                    <h4 className="font-serif text-base font-black text-arabic-bronze">
                                        Add Native Moroccan Teacher
                                    </h4>
                                </div>
                                <button
                                    onClick={() => setIsAddingTeacher(false)}
                                    className="rounded-full p-2 text-arabic-bronze/60 transition hover:bg-arabic-cream hover:text-arabic-bronze"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form
                                onSubmit={handleAddTeacherSubmit}
                                className="flex flex-1 flex-col overflow-hidden"
                            >
                                <div className="flex-1 space-y-4 overflow-y-auto p-6 text-xs">
                                    {/* Core Login details */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                                Full Name
                                            </label>
                                            <Input
                                                type="text"
                                                placeholder="e.g. Ustaz Anas"
                                                value={newTeacherForm.data.name}
                                                onChange={(e) =>
                                                    newTeacherForm.setData(
                                                        'name',
                                                        e.target.value,
                                                    )
                                                }
                                                className="rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                                Email Address
                                            </label>
                                            <Input
                                                type="email"
                                                placeholder="e.g. anas@example.com"
                                                value={
                                                    newTeacherForm.data.email
                                                }
                                                onChange={(e) =>
                                                    newTeacherForm.setData(
                                                        'email',
                                                        e.target.value,
                                                    )
                                                }
                                                className="rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                            Temporary Password
                                        </label>
                                        <Input
                                            type="password"
                                            placeholder="Min 8 characters"
                                            value={newTeacherForm.data.password}
                                            onChange={(e) =>
                                                newTeacherForm.setData(
                                                    'password',
                                                    e.target.value,
                                                )
                                            }
                                            className="rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                        />
                                    </div>

                                    {/* Teacher Profile details */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                                WhatsApp Number
                                            </label>
                                            <Input
                                                type="text"
                                                placeholder="e.g. +212612345678"
                                                value={
                                                    newTeacherForm.data
                                                        .whatsapp_number
                                                }
                                                onChange={(e) =>
                                                    newTeacherForm.setData(
                                                        'whatsapp_number',
                                                        e.target.value,
                                                    )
                                                }
                                                className="rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                                Specializations
                                                (comma-separated)
                                            </label>
                                            <Input
                                                type="text"
                                                placeholder="e.g. Tajweed, Talqin, Makhraj"
                                                value={
                                                    newTeacherForm.data
                                                        .specializations_json
                                                }
                                                onChange={(e) =>
                                                    newTeacherForm.setData(
                                                        'specializations_json',
                                                        e.target.value,
                                                    )
                                                }
                                                className="rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                            Biography
                                        </label>
                                        <Textarea
                                            placeholder="Write brief description of teaching history, credentials, educational backgrounds..."
                                            value={newTeacherForm.data.bio}
                                            onChange={(e) =>
                                                newTeacherForm.setData(
                                                    'bio',
                                                    e.target.value,
                                                )
                                            }
                                            className="min-h-[90px] rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                                Personal Zoom Link
                                            </label>
                                            <Input
                                                type="url"
                                                placeholder="https://zoom.us/..."
                                                value={
                                                    newTeacherForm.data
                                                        .zoom_link
                                                }
                                                onChange={(e) =>
                                                    newTeacherForm.setData(
                                                        'zoom_link',
                                                        e.target.value,
                                                    )
                                                }
                                                className="rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                                Google Meet Room Link
                                            </label>
                                            <Input
                                                type="url"
                                                placeholder="https://meet.google.com/..."
                                                value={
                                                    newTeacherForm.data
                                                        .google_meet_link
                                                }
                                                onChange={(e) =>
                                                    newTeacherForm.setData(
                                                        'google_meet_link',
                                                        e.target.value,
                                                    )
                                                }
                                                className="rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex shrink-0 justify-end gap-2 border-t border-arabic-cream bg-arabic-cream/30 px-6 py-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setIsAddingTeacher(false)
                                        }
                                        className="h-9 rounded-full border-arabic-bronze/25 text-xs font-bold text-arabic-bronze hover:bg-arabic-cream"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={newTeacherForm.processing}
                                        className="h-9 rounded-full bg-arabic-bronze px-6 text-xs font-bold text-arabic-sand shadow-sm hover:bg-arabic-bronze/90"
                                    >
                                        {newTeacherForm.processing
                                            ? 'Saving...'
                                            : 'Add Teacher'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Teacher Modal */}
                {editingTeacher && (
                    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-arabic-bronze/45 p-4 backdrop-blur-sm duration-200 fade-in">
                        <div className="flex max-h-[90vh] w-full max-w-lg animate-in flex-col overflow-hidden rounded-[2rem] border-2 border-arabic-cream bg-arabic-sand shadow-2xl duration-200 zoom-in-95">
                            <div className="flex shrink-0 items-center justify-between border-b border-arabic-cream bg-arabic-cream/60 px-6 py-4">
                                <div>
                                    <span className="block text-[9px] font-bold tracking-widest text-arabic-gold uppercase">
                                        Teacher Profile Editor
                                    </span>
                                    <h4 className="font-serif text-base font-black text-arabic-bronze">
                                        Modify Teacher: {editingTeacher.name}
                                    </h4>
                                </div>
                                <button
                                    onClick={() => setEditingTeacher(null)}
                                    className="rounded-full p-2 text-arabic-bronze/60 transition hover:bg-arabic-cream hover:text-arabic-bronze"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form
                                onSubmit={handleEditTeacherSubmit}
                                className="flex flex-1 flex-col overflow-hidden"
                            >
                                <div className="flex-1 space-y-4 overflow-y-auto p-6 text-xs">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                                Full Name
                                            </label>
                                            <Input
                                                type="text"
                                                placeholder="e.g. Ustaz Anas"
                                                value={
                                                    editTeacherForm.data.name
                                                }
                                                onChange={(e) =>
                                                    editTeacherForm.setData(
                                                        'name',
                                                        e.target.value,
                                                    )
                                                }
                                                className="rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                                Email Address
                                            </label>
                                            <Input
                                                type="email"
                                                placeholder="e.g. anas@example.com"
                                                value={
                                                    editTeacherForm.data.email
                                                }
                                                onChange={(e) =>
                                                    editTeacherForm.setData(
                                                        'email',
                                                        e.target.value,
                                                    )
                                                }
                                                className="rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                            Reset Password (leave empty to keep
                                            current)
                                        </label>
                                        <Input
                                            type="password"
                                            placeholder="Min 8 characters"
                                            value={
                                                editTeacherForm.data.password
                                            }
                                            onChange={(e) =>
                                                editTeacherForm.setData(
                                                    'password',
                                                    e.target.value,
                                                )
                                            }
                                            className="rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                                WhatsApp Number
                                            </label>
                                            <Input
                                                type="text"
                                                placeholder="e.g. +212612345678"
                                                value={
                                                    editTeacherForm.data
                                                        .whatsapp_number
                                                }
                                                onChange={(e) =>
                                                    editTeacherForm.setData(
                                                        'whatsapp_number',
                                                        e.target.value,
                                                    )
                                                }
                                                className="rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                                Specializations
                                                (comma-separated)
                                            </label>
                                            <Input
                                                type="text"
                                                placeholder="e.g. Tajweed, Talqin, Makhraj"
                                                value={
                                                    editTeacherForm.data
                                                        .specializations_json
                                                }
                                                onChange={(e) =>
                                                    editTeacherForm.setData(
                                                        'specializations_json',
                                                        e.target.value,
                                                    )
                                                }
                                                className="rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                            Biography
                                        </label>
                                        <Textarea
                                            placeholder="Write brief description of teaching history, credentials, educational backgrounds..."
                                            value={editTeacherForm.data.bio}
                                            onChange={(e) =>
                                                editTeacherForm.setData(
                                                    'bio',
                                                    e.target.value,
                                                )
                                            }
                                            className="min-h-[90px] rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                                Personal Zoom Link
                                            </label>
                                            <Input
                                                type="url"
                                                placeholder="https://zoom.us/..."
                                                value={
                                                    editTeacherForm.data
                                                        .zoom_link
                                                }
                                                onChange={(e) =>
                                                    editTeacherForm.setData(
                                                        'zoom_link',
                                                        e.target.value,
                                                    )
                                                }
                                                className="rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                                Google Meet Room Link
                                            </label>
                                            <Input
                                                type="url"
                                                placeholder="https://meet.google.com/..."
                                                value={
                                                    editTeacherForm.data
                                                        .google_meet_link
                                                }
                                                onChange={(e) =>
                                                    editTeacherForm.setData(
                                                        'google_meet_link',
                                                        e.target.value,
                                                    )
                                                }
                                                className="rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex shrink-0 justify-end gap-2 border-t border-arabic-cream bg-arabic-cream/30 px-6 py-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setEditingTeacher(null)}
                                        className="h-9 rounded-full border-arabic-bronze/25 text-xs font-bold text-arabic-bronze hover:bg-arabic-cream"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={editTeacherForm.processing}
                                        className="h-9 rounded-full bg-arabic-bronze px-6 text-xs font-bold text-arabic-sand shadow-sm hover:bg-arabic-bronze/90"
                                    >
                                        {editTeacherForm.processing
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
