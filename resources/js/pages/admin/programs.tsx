import { Head, useForm } from '@inertiajs/react';
import {
    BookOpen,
    Calendar,
    Check,
    X,
    Eye,
    EyeOff,
    Edit2,
    Trash2,
    Plus,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { getTranslation, getTranslationList } from '@/lib/translation-utils';
import { dashboard } from '@/routes';
import { dashboard as adminDashboard } from '@/routes/admin';

interface Program {
    id: number;
    name: Record<string, string>;
    description: Record<string, string>;
    details_json: Record<string, string[]>;
    is_hidden: boolean;
    name_translation: string;
    description_translation: string;
    details_translation: string[];
}

interface ProgramsProps {
    programs: Program[];
}

export default function Programs({ programs = [] }: ProgramsProps) {
    const { t, locale } = useTranslation();
    const [isAddingProgram, setIsAddingProgram] = useState(false);
    const [editingProgram, setEditingProgram] = useState<Program | null>(null);

    const newProgramForm = useForm({
        name: { id: '', ar: '', en: '' },
        description: { id: '', ar: '', en: '' },
        details_json: { id: '', ar: '', en: '' },
    });

    const editProgramForm = useForm({
        name: { id: '', ar: '', en: '' },
        description: { id: '', ar: '', en: '' },
        details_json: { id: '', ar: '', en: '' },
    });

    const toggleVisibilityForm = useForm({});
    const deleteProgramForm = useForm({});

    const handleAddProgramSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !newProgramForm.data.name.id ||
            !newProgramForm.data.name.ar ||
            !newProgramForm.data.name.en
        ) {
            toast.error(t('Please provide a program name in all languages.'));

            return;
        }

        if (
            !newProgramForm.data.description.id ||
            !newProgramForm.data.description.ar ||
            !newProgramForm.data.description.en
        ) {
            toast.error(
                t('Please provide a program description in all languages.'),
            );

            return;
        }

        newProgramForm.post('/admin/programs', {
            onSuccess: () => {
                setIsAddingProgram(false);
                newProgramForm.reset();
                toast.success(
                    t('Alhamdulillah! New Quranic Program successfully added!'),
                );
            },
            onError: (err: any) => {
                toast.error(err.error || t('Failed to add program.'));
            },
        });
    };

    const handleEditProgramSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingProgram) {
            return;
        }

        if (
            !editProgramForm.data.name.id ||
            !editProgramForm.data.name.ar ||
            !editProgramForm.data.name.en
        ) {
            toast.error(t('Please provide a program name in all languages.'));

            return;
        }

        if (
            !editProgramForm.data.description.id ||
            !editProgramForm.data.description.ar ||
            !editProgramForm.data.description.en
        ) {
            toast.error(
                t('Please provide a program description in all languages.'),
            );

            return;
        }

        editProgramForm.put(`/admin/programs/${editingProgram.id}`, {
            onSuccess: () => {
                setEditingProgram(null);
                editProgramForm.reset();
                toast.success(
                    t('Alhamdulillah! Program updated successfully!'),
                );
            },
            onError: (err: any) => {
                toast.error(err.error || t('Failed to update program.'));
            },
        });
    };

    const startEditing = (program: Program) => {
        setEditingProgram(program);
        editProgramForm.setData({
            name: {
                id: getTranslation(program.name, 'id'),
                ar: getTranslation(program.name, 'ar'),
                en: getTranslation(program.name, 'en'),
            },
            description: {
                id: getTranslation(program.description, 'id'),
                ar: getTranslation(program.description, 'ar'),
                en: getTranslation(program.description, 'en'),
            },
            details_json: {
                id: getTranslationList(program.details_json, 'id').join(', '),
                ar: getTranslationList(program.details_json, 'ar').join(', '),
                en: getTranslationList(program.details_json, 'en').join(', '),
            },
        });
    };

    const handleToggleVisibility = (program: Program) => {
        const actionText = program.is_hidden ? t('show/unhide') : t('hide');
        const displayName = getTranslation(program.name, locale);

        if (
            confirm(
                t('Are you sure you want to :action the program ":name"?', {
                    action: actionText,
                    name: displayName,
                }),
            )
        ) {
            toggleVisibilityForm.patch(
                `/admin/programs/${program.id}/toggle-visibility`,
                {
                    onSuccess: () => {
                        toast.success(
                            program.is_hidden
                                ? t(
                                      'Alhamdulillah! Program successfully made visible!',
                                  )
                                : t(
                                      'Alhamdulillah! Program successfully hidden!',
                                  ),
                        );
                    },
                    onError: (err: any) => {
                        toast.error(
                            err.error ||
                                t('Failed to toggle program visibility.'),
                        );
                    },
                },
            );
        }
    };

    const handleDeleteProgram = (program: Program) => {
        const displayName = getTranslation(program.name, locale);

        if (
            confirm(
                t(
                    'Are you sure you want to delete the program ":name"? This action cannot be undone.',
                    {
                        name: displayName,
                    },
                ),
            )
        ) {
            deleteProgramForm.delete(`/admin/programs/${program.id}`, {
                onSuccess: () => {
                    toast.success(
                        t('Alhamdulillah! Program deleted successfully!'),
                    );
                },
                onError: (err: any) => {
                    toast.error(err.error || t('Failed to delete program.'));
                },
            });
        }
    };

    const breadcrumbs = [
        { title: t('Dashboard'), href: dashboard() },
        { title: t('Admin Portal'), href: adminDashboard() },
        { title: t('Programs'), href: '/admin/programs' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Manage Programs')} />

            <div className="min-h-screen w-full space-y-8 bg-arabic-sand/20 p-6">
                {/* Header Welcome Bar */}
                <div className="flex flex-col justify-between gap-4 border-b border-arabic-cream/60 pb-6 md:flex-row md:items-center">
                    <div>
                        <h1 className="font-serif text-3xl font-black text-arabic-bronze">
                            {t('Manage Programs')}
                        </h1>
                        <p className="mt-1 text-xs font-medium text-arabic-bronze/70">
                            {t(
                                'Add new learning courses, configure syllabus points, and control user visibility settings.',
                            )}
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsAddingProgram(true)}
                        className="h-9 gap-1 rounded-full bg-arabic-bronze px-4 text-xs font-black text-arabic-sand shadow-md transition hover:bg-arabic-bronze/90"
                    >
                        <Plus className="h-4 w-4" /> {t('Add New Program')}
                    </Button>
                </div>

                {/* Main Content Area */}
                <Card className="overflow-hidden rounded-[1.5rem] border border-arabic-cream bg-arabic-sand shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-arabic-cream/40 bg-arabic-cream/10 p-5 pb-2">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-sm font-black tracking-wider text-arabic-bronze uppercase">
                                <BookOpen className="h-4.5 w-4.5 text-arabic-gold" />{' '}
                                {t('Listed Programs')}
                            </CardTitle>
                            <CardDescription className="mt-1 text-[11px] font-medium text-arabic-bronze/70">
                                {t(
                                    'Complete registry list of all platform academic streams.',
                                )}
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px] border-collapse text-left text-xs">
                                <thead>
                                    <tr className="border-b border-arabic-cream/45 bg-arabic-cream/20 text-[10px] font-black tracking-wider text-arabic-bronze/80 uppercase">
                                        <th className="p-4">
                                            {t('Program Details')}
                                        </th>
                                        <th className="p-4">
                                            {t('Benefits/Target Metrics')}
                                        </th>
                                        <th className="p-4 text-center">
                                            {t('Status')}
                                        </th>
                                        <th className="p-4 text-right">
                                            {t('Actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-arabic-cream/35 font-semibold text-arabic-bronze">
                                    {programs.map((program) => (
                                        <tr
                                            key={program.id}
                                            className={`transition hover:bg-arabic-cream/10 ${program.is_hidden ? 'bg-arabic-cream/5 opacity-60' : ''}`}
                                        >
                                            <td className="max-w-xs p-4">
                                                <span className="block text-sm font-extrabold text-arabic-bronze">
                                                    {program.name_translation}
                                                </span>
                                                <p className="mt-1 text-[10px] leading-relaxed font-medium text-arabic-bronze/70">
                                                    {
                                                        program.description_translation
                                                    }
                                                </p>
                                            </td>
                                            <td className="max-w-xs p-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {Array.isArray(
                                                        program.details_translation,
                                                    ) &&
                                                        program.details_translation.map(
                                                            (detail, idx) => (
                                                                <Badge
                                                                    key={idx}
                                                                    variant="secondary"
                                                                    className="border border-arabic-cream/90 bg-arabic-cream/60 px-1.5 py-0 text-[9px] font-bold text-arabic-bronze"
                                                                >
                                                                    {detail}
                                                                </Badge>
                                                            ),
                                                        )}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                {program.is_hidden ? (
                                                    <Badge className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold text-amber-600">
                                                        {t('Hidden')}
                                                    </Badge>
                                                ) : (
                                                    <Badge className="rounded-full bg-arabic-emerald px-2 py-0.5 text-[9px] font-bold text-white">
                                                        {t('Visible')}
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() =>
                                                            startEditing(
                                                                program,
                                                            )
                                                        }
                                                        className="rounded-lg p-1.5 text-arabic-bronze/75 transition hover:bg-arabic-cream hover:text-arabic-bronze"
                                                        title={t(
                                                            'Edit Program',
                                                        )}
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleToggleVisibility(
                                                                program,
                                                            )
                                                        }
                                                        className="rounded-lg p-1.5 text-arabic-bronze/75 transition hover:bg-arabic-cream hover:text-arabic-bronze"
                                                        title={
                                                            program.is_hidden
                                                                ? t(
                                                                      'Show/Unhide Program',
                                                                  )
                                                                : t(
                                                                      'Hide Program',
                                                                  )
                                                        }
                                                    >
                                                        {program.is_hidden ? (
                                                            <Eye className="h-3.5 w-3.5 text-amber-600" />
                                                        ) : (
                                                            <EyeOff className="h-3.5 w-3.5" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteProgram(
                                                                program,
                                                            )
                                                        }
                                                        className="rounded-lg p-1.5 text-rose-500 transition hover:bg-rose-500/10 hover:text-rose-700"
                                                        title={t(
                                                            'Delete Program',
                                                        )}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {programs.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="p-8 text-center text-xs font-bold text-arabic-bronze/50"
                                            >
                                                {t(
                                                    'No programs defined in the database yet.',
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Add Program Modal */}
                {isAddingProgram && (
                    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-arabic-bronze/45 p-4 backdrop-blur-sm duration-200 fade-in">
                        <div className="flex max-h-[90vh] w-full max-w-lg animate-in flex-col overflow-hidden rounded-[2rem] border-2 border-arabic-cream bg-arabic-sand shadow-2xl duration-200 zoom-in-95">
                            <div className="flex shrink-0 items-center justify-between border-b border-arabic-cream bg-arabic-cream/60 px-6 py-4">
                                <div>
                                    <span className="block text-[9px] font-bold tracking-widest text-arabic-gold uppercase">
                                        {t('Tahseen')}
                                    </span>
                                    <h4 className="font-serif text-base font-black text-arabic-bronze">
                                        {t('Add New Learning Program')}
                                    </h4>
                                </div>
                                <button
                                    onClick={() => setIsAddingProgram(false)}
                                    className="rounded-full p-2 text-arabic-bronze/60 transition hover:bg-arabic-cream hover:text-arabic-bronze"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form
                                onSubmit={handleAddProgramSubmit}
                                className="flex flex-1 flex-col overflow-hidden"
                            >
                                <div className="flex-1 space-y-5 overflow-y-auto p-6">
                                    {/* Program Name Fields */}
                                    <div className="space-y-2 border-l-2 border-arabic-gold/30 pl-3">
                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                            {t('Program Name')}
                                        </label>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className="w-5 text-center text-sm">
                                                    🇮🇩
                                                </span>
                                                <Input
                                                    type="text"
                                                    placeholder="Nama Program (Indonesian)"
                                                    value={
                                                        newProgramForm.data.name
                                                            .id
                                                    }
                                                    onChange={(e) =>
                                                        newProgramForm.setData(
                                                            'name',
                                                            {
                                                                ...newProgramForm
                                                                    .data.name,
                                                                id: e.target
                                                                    .value,
                                                            },
                                                        )
                                                    }
                                                    className="rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-5 text-center text-sm">
                                                    🇲🇦
                                                </span>
                                                <Input
                                                    type="text"
                                                    placeholder="اسم البرنامج (Arabic)"
                                                    value={
                                                        newProgramForm.data.name
                                                            .ar
                                                    }
                                                    onChange={(e) =>
                                                        newProgramForm.setData(
                                                            'name',
                                                            {
                                                                ...newProgramForm
                                                                    .data.name,
                                                                ar: e.target
                                                                    .value,
                                                            },
                                                        )
                                                    }
                                                    className="rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-5 text-center text-sm">
                                                    🇬🇧
                                                </span>
                                                <Input
                                                    type="text"
                                                    placeholder="Program Name (English)"
                                                    value={
                                                        newProgramForm.data.name
                                                            .en
                                                    }
                                                    onChange={(e) =>
                                                        newProgramForm.setData(
                                                            'name',
                                                            {
                                                                ...newProgramForm
                                                                    .data.name,
                                                                en: e.target
                                                                    .value,
                                                            },
                                                        )
                                                    }
                                                    className="rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description Fields */}
                                    <div className="space-y-2 border-l-2 border-arabic-gold/30 pl-3">
                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                            {t('Description')}
                                        </label>
                                        <div className="space-y-1.5">
                                            <div className="flex items-start gap-2">
                                                <span className="w-5 pt-2 text-center text-sm">
                                                    🇮🇩
                                                </span>
                                                <Textarea
                                                    placeholder="Deskripsi program (Indonesian)..."
                                                    value={
                                                        newProgramForm.data
                                                            .description.id
                                                    }
                                                    onChange={(e) =>
                                                        newProgramForm.setData(
                                                            'description',
                                                            {
                                                                ...newProgramForm
                                                                    .data
                                                                    .description,
                                                                id: e.target
                                                                    .value,
                                                            },
                                                        )
                                                    }
                                                    className="min-h-[70px] rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                                />
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span className="w-5 pt-2 text-center text-sm">
                                                    🇲🇦
                                                </span>
                                                <Textarea
                                                    placeholder="وصف البرنامج (Arabic)..."
                                                    value={
                                                        newProgramForm.data
                                                            .description.ar
                                                    }
                                                    onChange={(e) =>
                                                        newProgramForm.setData(
                                                            'description',
                                                            {
                                                                ...newProgramForm
                                                                    .data
                                                                    .description,
                                                                ar: e.target
                                                                    .value,
                                                            },
                                                        )
                                                    }
                                                    className="min-h-[70px] rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                                />
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span className="w-5 pt-2 text-center text-sm">
                                                    🇬🇧
                                                </span>
                                                <Textarea
                                                    placeholder="Program description (English)..."
                                                    value={
                                                        newProgramForm.data
                                                            .description.en
                                                    }
                                                    onChange={(e) =>
                                                        newProgramForm.setData(
                                                            'description',
                                                            {
                                                                ...newProgramForm
                                                                    .data
                                                                    .description,
                                                                en: e.target
                                                                    .value,
                                                            },
                                                        )
                                                    }
                                                    className="min-h-[70px] rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Targets/Benefits Fields */}
                                    <div className="space-y-2 border-l-2 border-arabic-gold/30 pl-3">
                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                            {t(
                                                'Targets/Benefits (comma-separated)',
                                            )}
                                        </label>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className="w-5 text-center text-sm">
                                                    🇮🇩
                                                </span>
                                                <Input
                                                    type="text"
                                                    placeholder="Target (Indonesia), e.g. Koreksi makhraj, Melatih kelancaran"
                                                    value={
                                                        newProgramForm.data
                                                            .details_json.id
                                                    }
                                                    onChange={(e) =>
                                                        newProgramForm.setData(
                                                            'details_json',
                                                            {
                                                                ...newProgramForm
                                                                    .data
                                                                    .details_json,
                                                                id: e.target
                                                                    .value,
                                                            },
                                                        )
                                                    }
                                                    className="rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-5 text-center text-sm">
                                                    🇲🇦
                                                </span>
                                                <Input
                                                    type="text"
                                                    placeholder="الأهداف (العربية)، مثلاً: تصحيح المخارج، تدريب الطلاقة"
                                                    value={
                                                        newProgramForm.data
                                                            .details_json.ar
                                                    }
                                                    onChange={(e) =>
                                                        newProgramForm.setData(
                                                            'details_json',
                                                            {
                                                                ...newProgramForm
                                                                    .data
                                                                    .details_json,
                                                                ar: e.target
                                                                    .value,
                                                            },
                                                        )
                                                    }
                                                    className="rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-5 text-center text-sm">
                                                    🇬🇧
                                                </span>
                                                <Input
                                                    type="text"
                                                    placeholder="Targets (English), e.g. Correct makhraj, Master fluency"
                                                    value={
                                                        newProgramForm.data
                                                            .details_json.en
                                                    }
                                                    onChange={(e) =>
                                                        newProgramForm.setData(
                                                            'details_json',
                                                            {
                                                                ...newProgramForm
                                                                    .data
                                                                    .details_json,
                                                                en: e.target
                                                                    .value,
                                                            },
                                                        )
                                                    }
                                                    className="rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                                />
                                            </div>
                                        </div>
                                        <span className="ml-7 block text-[9px] text-arabic-bronze/50">
                                            {t(
                                                'Separate each target with a comma.',
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex shrink-0 justify-end gap-2 border-t border-arabic-cream bg-arabic-cream/30 px-6 py-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setIsAddingProgram(false)
                                        }
                                        className="h-9 rounded-full border-arabic-bronze/25 text-xs font-bold text-arabic-bronze hover:bg-arabic-cream"
                                    >
                                        {t('Cancel')}
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={newProgramForm.processing}
                                        className="h-9 rounded-full bg-arabic-bronze px-6 text-xs font-bold text-arabic-sand shadow-sm hover:bg-arabic-bronze/90"
                                    >
                                        {newProgramForm.processing
                                            ? t('Adding...')
                                            : t('Add Program')}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Program Modal */}
                {editingProgram && (
                    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-arabic-bronze/45 p-4 backdrop-blur-sm duration-200 fade-in">
                        <div className="flex max-h-[90vh] w-full max-w-lg animate-in flex-col overflow-hidden rounded-[2rem] border-2 border-arabic-cream bg-arabic-sand shadow-2xl duration-200 zoom-in-95">
                            <div className="flex shrink-0 items-center justify-between border-b border-arabic-cream bg-arabic-cream/60 px-6 py-4">
                                <div>
                                    <span className="block text-[9px] font-bold tracking-widest text-arabic-gold uppercase">
                                        {t('Tahseen')}
                                    </span>
                                    <h4 className="font-serif text-base font-black text-arabic-bronze">
                                        {t('Modify Quranic Program')}
                                    </h4>
                                </div>
                                <button
                                    onClick={() => setEditingProgram(null)}
                                    className="rounded-full p-2 text-arabic-bronze/60 transition hover:bg-arabic-cream hover:text-arabic-bronze"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form
                                onSubmit={handleEditProgramSubmit}
                                className="flex flex-1 flex-col overflow-hidden"
                            >
                                <div className="flex-1 space-y-5 overflow-y-auto p-6">
                                    {/* Program Name Fields */}
                                    <div className="space-y-2 border-l-2 border-arabic-gold/30 pl-3">
                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                            {t('Program Name')}
                                        </label>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className="w-5 text-center text-sm">
                                                    🇮🇩
                                                </span>
                                                <Input
                                                    type="text"
                                                    placeholder="Nama Program (Indonesian)"
                                                    value={
                                                        editProgramForm.data
                                                            .name.id
                                                    }
                                                    onChange={(e) =>
                                                        editProgramForm.setData(
                                                            'name',
                                                            {
                                                                ...editProgramForm
                                                                    .data.name,
                                                                id: e.target
                                                                    .value,
                                                            },
                                                        )
                                                    }
                                                    className="rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-5 text-center text-sm">
                                                    🇲🇦
                                                </span>
                                                <Input
                                                    type="text"
                                                    placeholder="اسم البرنامج (Arabic)"
                                                    value={
                                                        editProgramForm.data
                                                            .name.ar
                                                    }
                                                    onChange={(e) =>
                                                        editProgramForm.setData(
                                                            'name',
                                                            {
                                                                ...editProgramForm
                                                                    .data.name,
                                                                ar: e.target
                                                                    .value,
                                                            },
                                                        )
                                                    }
                                                    className="rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-5 text-center text-sm">
                                                    🇬🇧
                                                </span>
                                                <Input
                                                    type="text"
                                                    placeholder="Program Name (English)"
                                                    value={
                                                        editProgramForm.data
                                                            .name.en
                                                    }
                                                    onChange={(e) =>
                                                        editProgramForm.setData(
                                                            'name',
                                                            {
                                                                ...editProgramForm
                                                                    .data.name,
                                                                en: e.target
                                                                    .value,
                                                            },
                                                        )
                                                    }
                                                    className="rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description Fields */}
                                    <div className="space-y-2 border-l-2 border-arabic-gold/30 pl-3">
                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                            {t('Description')}
                                        </label>
                                        <div className="space-y-1.5">
                                            <div className="flex items-start gap-2">
                                                <span className="w-5 pt-2 text-center text-sm">
                                                    🇮🇩
                                                </span>
                                                <Textarea
                                                    placeholder="Deskripsi program (Indonesian)..."
                                                    value={
                                                        editProgramForm.data
                                                            .description.id
                                                    }
                                                    onChange={(e) =>
                                                        editProgramForm.setData(
                                                            'description',
                                                            {
                                                                ...editProgramForm
                                                                    .data
                                                                    .description,
                                                                id: e.target
                                                                    .value,
                                                            },
                                                        )
                                                    }
                                                    className="min-h-[70px] rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                                />
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span className="w-5 pt-2 text-center text-sm">
                                                    🇲🇦
                                                </span>
                                                <Textarea
                                                    placeholder="وصف البرنامج (Arabic)..."
                                                    value={
                                                        editProgramForm.data
                                                            .description.ar
                                                    }
                                                    onChange={(e) =>
                                                        editProgramForm.setData(
                                                            'description',
                                                            {
                                                                ...editProgramForm
                                                                    .data
                                                                    .description,
                                                                ar: e.target
                                                                    .value,
                                                            },
                                                        )
                                                    }
                                                    className="min-h-[70px] rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                                />
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span className="w-5 pt-2 text-center text-sm">
                                                    🇬🇧
                                                </span>
                                                <Textarea
                                                    placeholder="Program description (English)..."
                                                    value={
                                                        editProgramForm.data
                                                            .description.en
                                                    }
                                                    onChange={(e) =>
                                                        editProgramForm.setData(
                                                            'description',
                                                            {
                                                                ...editProgramForm
                                                                    .data
                                                                    .description,
                                                                en: e.target
                                                                    .value,
                                                            },
                                                        )
                                                    }
                                                    className="min-h-[70px] rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Targets/Benefits Fields */}
                                    <div className="space-y-2 border-l-2 border-arabic-gold/30 pl-3">
                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                            {t(
                                                'Targets/Benefits (comma-separated)',
                                            )}
                                        </label>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className="w-5 text-center text-sm">
                                                    🇮🇩
                                                </span>
                                                <Input
                                                    type="text"
                                                    placeholder="Target (Indonesia), e.g. Koreksi makhraj, Melatih kelancaran"
                                                    value={
                                                        editProgramForm.data
                                                            .details_json.id
                                                    }
                                                    onChange={(e) =>
                                                        editProgramForm.setData(
                                                            'details_json',
                                                            {
                                                                ...editProgramForm
                                                                    .data
                                                                    .details_json,
                                                                id: e.target
                                                                    .value,
                                                            },
                                                        )
                                                    }
                                                    className="rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-5 text-center text-sm">
                                                    🇲🇦
                                                </span>
                                                <Input
                                                    type="text"
                                                    placeholder="الأهداف (العربية)، misalnya: تصحيح المخارج، تدريب الطلاقة"
                                                    value={
                                                        editProgramForm.data
                                                            .details_json.ar
                                                    }
                                                    onChange={(e) =>
                                                        editProgramForm.setData(
                                                            'details_json',
                                                            {
                                                                ...editProgramForm
                                                                    .data
                                                                    .details_json,
                                                                ar: e.target
                                                                    .value,
                                                            },
                                                        )
                                                    }
                                                    className="rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-5 text-center text-sm">
                                                    🇬🇧
                                                </span>
                                                <Input
                                                    type="text"
                                                    placeholder="Targets (English), e.g. Correct makhraj, Master fluency"
                                                    value={
                                                        editProgramForm.data
                                                            .details_json.en
                                                    }
                                                    onChange={(e) =>
                                                        editProgramForm.setData(
                                                            'details_json',
                                                            {
                                                                ...editProgramForm
                                                                    .data
                                                                    .details_json,
                                                                en: e.target
                                                                    .value,
                                                            },
                                                        )
                                                    }
                                                    className="rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                                />
                                            </div>
                                        </div>
                                        <span className="ml-7 block text-[9px] text-arabic-bronze/50">
                                            {t(
                                                'Separate each target with a comma.',
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex shrink-0 justify-end gap-2 border-t border-arabic-cream bg-arabic-cream/30 px-6 py-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setEditingProgram(null)}
                                        className="h-9 rounded-full border-arabic-bronze/25 text-xs font-bold text-arabic-bronze hover:bg-arabic-cream"
                                    >
                                        {t('Cancel')}
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={editProgramForm.processing}
                                        className="h-9 rounded-full bg-arabic-bronze px-6 text-xs font-bold text-arabic-sand shadow-sm hover:bg-arabic-bronze/90"
                                    >
                                        {editProgramForm.processing
                                            ? t('Saving...')
                                            : t('Save changes')}
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
