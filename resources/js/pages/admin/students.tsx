import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import {
    Users,
    Plus,
    X,
    Edit2,
    Trash2,
    Mail,
    Key,
    Search,
    ArrowRight,
    GraduationCap,
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
    CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { dashboard } from '@/routes';
import { dashboard as adminDashboard } from '@/routes/admin';
import { useTranslation } from '@/hooks/use-translation';

interface Student {
    id: number;
    name: string;
    email: string;
    student_bookings_count: number;
}

interface StudentsProps {
    students: Student[];
}

export default function Students({ students = [] }: StudentsProps) {
    const { t } = useTranslation();
    const [isAddingStudent, setIsAddingStudent] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [searchFilter, setSearchFilter] = useState('');

    const filteredStudents = students.filter((student) => {
        const matchesName = student.name
            .toLowerCase()
            .includes(searchFilter.toLowerCase());
        const matchesEmail = student.email
            .toLowerCase()
            .includes(searchFilter.toLowerCase());
        return matchesName || matchesEmail;
    });

    const newStudentForm = useForm({
        name: '',
        email: '',
        password: '',
    });

    const editStudentForm = useForm({
        name: '',
        email: '',
        password: '',
    });

    const deleteStudentForm = useForm({});

    const handleAddStudentSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!newStudentForm.data.name) {
            toast.error(t("Please provide the student's name."));
            return;
        }
        if (!newStudentForm.data.email) {
            toast.error(t('Please provide a valid email address.'));
            return;
        }
        if (
            !newStudentForm.data.password ||
            newStudentForm.data.password.length < 8
        ) {
            toast.error(t('Password must be at least 8 characters long.'));
            return;
        }

        newStudentForm.post('/admin/students', {
            onSuccess: () => {
                setIsAddingStudent(false);
                newStudentForm.reset();
                toast.success(
                    t('Alhamdulillah! New Student account successfully created!'),
                );
            },
            onError: (err: any) => {
                toast.error(err.error || t('Failed to add student.'));
            },
        });
    };

    const handleEditStudentSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingStudent) return;

        if (!editStudentForm.data.name) {
            toast.error(t("Please provide the student's name."));
            return;
        }
        if (!editStudentForm.data.email) {
            toast.error(t('Please provide a valid email address.'));
            return;
        }
        if (
            editStudentForm.data.password &&
            editStudentForm.data.password.length < 8
        ) {
            toast.error(t('Password must be at least 8 characters long.'));
            return;
        }

        editStudentForm.put(`/admin/students/${editingStudent.id}`, {
            onSuccess: () => {
                setEditingStudent(null);
                editStudentForm.reset();
                toast.success(
                    t('Alhamdulillah! Student account updated successfully!'),
                );
            },
            onError: (err: any) => {
                toast.error(err.error || t('Failed to update student.'));
            },
        });
    };

    const startEditing = (student: Student) => {
        setEditingStudent(student);
        editStudentForm.setData({
            name: student.name,
            email: student.email,
            password: '',
        });
    };

    const handleDeleteStudent = (student: Student) => {
        if (
            confirm(
                t('Are you sure you want to delete the student ":name"? This action cannot be undone.', {
                    name: student.name,
                }),
            )
        ) {
            deleteStudentForm.delete(`/admin/students/${student.id}`, {
                onSuccess: () => {
                    toast.success(
                        t('Alhamdulillah! Student successfully removed.'),
                    );
                },
                onError: (err: any) => {
                    toast.error(err.error || t('Failed to delete student.'));
                },
            });
        }
    };

    const breadcrumbs = [
        { title: t('Dashboard'), href: dashboard() },
        { title: t('Admin Portal'), href: adminDashboard() },
        { title: t('Students'), href: '/admin/students' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Manage Students')} />

            <div className="min-h-screen w-full space-y-8 bg-arabic-sand/20 p-6">
                {/* Header Welcome Bar */}
                <div className="flex flex-col justify-between gap-4 border-b border-arabic-cream/60 pb-6 md:flex-row md:items-center">
                    <div>
                        <h1 className="flex items-center gap-3 font-serif text-3xl font-black text-arabic-bronze">
                            <GraduationCap className="h-9 w-9 text-arabic-gold" />{' '}
                            {t('Manage Students')}
                        </h1>
                        <p className="mt-1 text-xs font-medium text-arabic-bronze/70">
                            {t('Register new students, update profiles, and monitor private tutoring bookings.')}
                        </p>
                    </div>
                    <div>
                        <Button
                            onClick={() => setIsAddingStudent(true)}
                            className="h-9 cursor-pointer gap-1 rounded-full bg-arabic-bronze px-4 text-xs font-black text-arabic-sand shadow-md transition hover:bg-arabic-bronze/90"
                        >
                            <Plus className="h-4 w-4" /> {t('Add New Student')}
                        </Button>
                    </div>
                </div>

                {/* Main Content Area */}
                <Card className="overflow-hidden rounded-[1.5rem] border border-arabic-cream bg-arabic-sand shadow-sm">
                    <CardHeader className="border-b border-arabic-cream/40 bg-arabic-cream/10 p-5 pb-4">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-sm font-black tracking-wider text-arabic-bronze uppercase">
                                    <Users className="h-4.5 w-4.5 text-arabic-gold" />{' '}
                                    {t('Student Directory')}
                                </CardTitle>
                                <CardDescription className="mt-1 text-[11px] font-medium text-arabic-bronze/70">
                                    {t('Registry list of all students enrolled in the platform.')}
                                </CardDescription>
                            </div>

                            {/* Search Filter Bar */}
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute top-1/2 left-3.5 h-3.5 w-3.5 -translate-y-1/2 text-arabic-bronze/40" />
                                <Input
                                    type="text"
                                    placeholder={t('Search by Name or Email...')}
                                    value={searchFilter}
                                    onChange={(e) =>
                                        setSearchFilter(e.target.value)
                                    }
                                    className="h-9 w-full rounded-xl border-arabic-cream bg-arabic-sand/50 pl-9 text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px] border-collapse text-left text-xs">
                                <thead>
                                    <tr className="border-b border-arabic-cream/45 bg-arabic-cream/20 text-[10px] font-black tracking-wider text-arabic-bronze/80 uppercase">
                                        <th className="p-4">{t('Student Profile')}</th>
                                        <th className="p-4">
                                            {t('Total Booking Activity')}
                                        </th>
                                        <th className="p-4">{t('Status')}</th>
                                        <th className="p-4 text-right">
                                            {t('Actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-arabic-cream/35 font-semibold text-arabic-bronze">
                                    {filteredStudents.map((student) => (
                                        <tr
                                            key={student.id}
                                            className="transition hover:bg-arabic-cream/10"
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-arabic-cream text-xs font-black text-arabic-bronze shadow-inner">
                                                        {student.name
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <span className="block text-sm font-extrabold text-arabic-bronze">
                                                            {student.name}
                                                        </span>
                                                        <span className="mt-0.5 block font-mono text-[10px] text-arabic-bronze/60">
                                                            {student.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-sm font-bold text-arabic-gold">
                                                    {t(':count slots booked', { count: String(student.student_bookings_count) })}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <Badge className="rounded-full border border-arabic-bronze/25 bg-arabic-bronze/10 px-2 py-0.5 text-[9px] font-bold text-arabic-bronze">
                                                    {t('Enrolled')}
                                                </Badge>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() =>
                                                            startEditing(
                                                                student,
                                                            )
                                                        }
                                                        className="cursor-pointer rounded-lg p-1.5 text-arabic-bronze/75 transition hover:bg-arabic-cream hover:text-arabic-bronze"
                                                        title={t('Edit Student')}
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteStudent(
                                                                student,
                                                            )
                                                        }
                                                        className="cursor-pointer rounded-lg p-1.5 text-rose-500 transition hover:bg-rose-500/10 hover:text-rose-700"
                                                        title={t('Delete Student')}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredStudents.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="p-8 text-center text-xs font-bold text-arabic-bronze/50"
                                            >
                                                {t('No student accounts found.')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Add Student Modal */}
                {isAddingStudent && (
                    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-arabic-bronze/45 p-4 backdrop-blur-sm duration-200 fade-in">
                        <div className="flex max-h-[90vh] w-full max-w-md animate-in flex-col overflow-hidden rounded-[2rem] border-2 border-arabic-cream bg-arabic-sand shadow-2xl duration-200 zoom-in-95">
                            <div className="flex shrink-0 items-center justify-between border-b border-arabic-cream bg-arabic-cream/60 px-6 py-4">
                                <div>
                                    <span className="block text-[9px] font-bold tracking-widest text-arabic-gold uppercase">
                                        {t('Student Onboarding')}
                                    </span>
                                    <h4 className="font-serif text-base font-black text-arabic-bronze">
                                        {t('Add New Student')}
                                    </h4>
                                </div>
                                <button
                                    onClick={() => setIsAddingStudent(false)}
                                    className="cursor-pointer rounded-full p-2 text-arabic-bronze/60 transition hover:bg-arabic-cream hover:text-arabic-bronze"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form
                                onSubmit={handleAddStudentSubmit}
                                className="flex flex-1 flex-col overflow-hidden"
                            >
                                <div className="flex-1 space-y-4 overflow-y-auto p-6 text-xs">
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                            {t('Full Name')}
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="e.g. Ahmad Ali"
                                            value={newStudentForm.data.name}
                                            onChange={(e) =>
                                                newStudentForm.setData(
                                                    'name',
                                                    e.target.value,
                                                )
                                            }
                                            className="rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                            {t('Email Address')}
                                        </label>
                                        <Input
                                            type="email"
                                            placeholder="e.g. ahmad@example.com"
                                            value={newStudentForm.data.email}
                                            onChange={(e) =>
                                                newStudentForm.setData(
                                                    'email',
                                                    e.target.value,
                                                )
                                            }
                                            className="rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                            {t('Account Password')}
                                        </label>
                                        <Input
                                            type="password"
                                            placeholder="Min 8 characters"
                                            value={newStudentForm.data.password}
                                            onChange={(e) =>
                                                newStudentForm.setData(
                                                    'password',
                                                    e.target.value,
                                                )
                                            }
                                            className="rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                        />
                                    </div>
                                </div>

                                <div className="flex shrink-0 justify-end gap-2 border-t border-arabic-cream bg-arabic-cream/30 px-6 py-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setIsAddingStudent(false)
                                        }
                                        className="h-9 cursor-pointer rounded-full border-arabic-bronze/25 text-xs font-bold text-arabic-bronze hover:bg-arabic-cream"
                                    >
                                        {t('Cancel')}
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={newStudentForm.processing}
                                        className="h-9 cursor-pointer rounded-full bg-arabic-bronze px-6 text-xs font-bold text-arabic-sand shadow-sm hover:bg-arabic-bronze/90"
                                    >
                                        {newStudentForm.processing
                                            ? t('Saving...')
                                            : t('Add Student')}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Student Modal */}
                {editingStudent && (
                    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-arabic-bronze/45 p-4 backdrop-blur-sm duration-200 fade-in">
                        <div className="flex max-h-[90vh] w-full max-w-md animate-in flex-col overflow-hidden rounded-[2rem] border-2 border-arabic-cream bg-arabic-sand shadow-2xl duration-200 zoom-in-95">
                            <div className="flex shrink-0 items-center justify-between border-b border-arabic-cream bg-arabic-cream/60 px-6 py-4">
                                <div>
                                    <span className="block text-[9px] font-bold tracking-widest text-arabic-gold uppercase">
                                        {t('Profile Editor')}
                                    </span>
                                    <h4 className="font-serif text-base font-black text-arabic-bronze">
                                        {t('Edit Student Profile')}
                                    </h4>
                                </div>
                                <button
                                    onClick={() => setEditingStudent(null)}
                                    className="cursor-pointer rounded-full p-2 text-arabic-bronze/60 transition hover:bg-arabic-cream hover:text-arabic-bronze"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form
                                onSubmit={handleEditStudentSubmit}
                                className="flex flex-1 flex-col overflow-hidden"
                            >
                                <div className="flex-1 space-y-4 overflow-y-auto p-6 text-xs">
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                            {t('Full Name')}
                                        </label>
                                        <Input
                                            type="text"
                                            value={editStudentForm.data.name}
                                            onChange={(e) =>
                                                editStudentForm.setData(
                                                    'name',
                                                    e.target.value,
                                                )
                                            }
                                            className="rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                            {t('Email Address')}
                                        </label>
                                        <Input
                                            type="email"
                                            value={editStudentForm.data.email}
                                            onChange={(e) =>
                                                editStudentForm.setData(
                                                    'email',
                                                    e.target.value,
                                                )
                                            }
                                            className="rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                            {t('New Password (Leave blank to keep current)')}
                                        </label>
                                        <Input
                                            type="password"
                                            placeholder="Min 8 characters"
                                            value={
                                                editStudentForm.data.password
                                            }
                                            onChange={(e) =>
                                                editStudentForm.setData(
                                                    'password',
                                                    e.target.value,
                                                )
                                            }
                                            className="rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                        />
                                    </div>
                                </div>

                                <div className="flex shrink-0 justify-end gap-2 border-t border-arabic-cream bg-arabic-cream/30 px-6 py-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setEditingStudent(null)}
                                        className="h-9 cursor-pointer rounded-full border-arabic-bronze/25 text-xs font-bold text-arabic-bronze hover:bg-arabic-cream"
                                    >
                                        {t('Cancel')}
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={editStudentForm.processing}
                                        className="h-9 cursor-pointer rounded-full bg-arabic-bronze px-6 text-xs font-bold text-arabic-sand shadow-sm hover:bg-arabic-bronze/90"
                                    >
                                        {editStudentForm.processing
                                            ? t('Saving...')
                                            : t('Save Changes')}
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
