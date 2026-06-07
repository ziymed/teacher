import AppLayout from '@/layouts/app-layout';
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

interface Program {
    id: number;
    name: string;
    description: string;
    details_json: string[];
    is_hidden: boolean;
}

interface ProgramsProps {
    programs: Program[];
}

export default function Programs({ programs = [] }: ProgramsProps) {
    const [isAddingProgram, setIsAddingProgram] = useState(false);
    const [editingProgram, setEditingProgram] = useState<Program | null>(null);

    const newProgramForm = useForm({
        name: '',
        description: '',
        details_json: '',
    });

    const editProgramForm = useForm({
        name: '',
        description: '',
        details_json: '',
    });

    const toggleVisibilityForm = useForm({});
    const deleteProgramForm = useForm({});

    const handleAddProgramSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!newProgramForm.data.name) {
            toast.error('Please provide a program name.');
            return;
        }
        if (!newProgramForm.data.description) {
            toast.error('Please provide a program description.');
            return;
        }

        newProgramForm.post('/admin/programs', {
            onSuccess: () => {
                setIsAddingProgram(false);
                newProgramForm.reset();
                toast.success(
                    'Alhamdulillah! New Quranic Program successfully added!',
                );
            },
            onError: (err: any) => {
                toast.error(err.error || 'Failed to add program.');
            },
        });
    };

    const handleEditProgramSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingProgram) return;

        if (!editProgramForm.data.name) {
            toast.error('Please provide a program name.');
            return;
        }
        if (!editProgramForm.data.description) {
            toast.error('Please provide a program description.');
            return;
        }

        editProgramForm.put(`/admin/programs/${editingProgram.id}`, {
            onSuccess: () => {
                setEditingProgram(null);
                editProgramForm.reset();
                toast.success('Alhamdulillah! Program updated successfully!');
            },
            onError: (err: any) => {
                toast.error(err.error || 'Failed to update program.');
            },
        });
    };

    const startEditing = (program: Program) => {
        setEditingProgram(program);
        editProgramForm.setData({
            name: program.name,
            description: program.description,
            details_json: Array.isArray(program.details_json)
                ? program.details_json.join(', ')
                : '',
        });
    };

    const handleToggleVisibility = (program: Program) => {
        const actionText = program.is_hidden ? 'show/unhide' : 'hide';
        if (
            confirm(
                `Are you sure you want to ${actionText} the program "${program.name}"?`,
            )
        ) {
            toggleVisibilityForm.patch(
                `/admin/programs/${program.id}/toggle-visibility`,
                {
                    onSuccess: () => {
                        toast.success(
                            `Alhamdulillah! Program successfully ${program.is_hidden ? 'made visible' : 'hidden'}!`,
                        );
                    },
                    onError: (err: any) => {
                        toast.error(
                            err.error || 'Failed to toggle program visibility.',
                        );
                    },
                },
            );
        }
    };

    const handleDeleteProgram = (program: Program) => {
        if (
            confirm(
                `Are you sure you want to delete the program "${program.name}"? This action cannot be undone.`,
            )
        ) {
            deleteProgramForm.delete(`/admin/programs/${program.id}`, {
                onSuccess: () => {
                    toast.success(
                        'Alhamdulillah! Program deleted successfully!',
                    );
                },
                onError: (err: any) => {
                    toast.error(err.error || 'Failed to delete program.');
                },
            });
        }
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Admin Portal', href: adminDashboard() },
        { title: 'Programs', href: '/admin/programs' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Programs" />

            <div className="min-h-screen w-full space-y-8 bg-arabic-sand/20 p-6">
                {/* Header Welcome Bar */}
                <div className="flex flex-col justify-between gap-4 border-b border-arabic-cream/60 pb-6 md:flex-row md:items-center">
                    <div>
                        <h1 className="font-serif text-3xl font-black text-arabic-bronze">
                            Manage Quranic Programs
                        </h1>
                        <p className="mt-1 text-xs font-medium text-arabic-bronze/70">
                            Add new learning courses, configure syllabus points,
                            and control user visibility settings.
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsAddingProgram(true)}
                        className="h-9 gap-1 rounded-full bg-arabic-bronze px-4 text-xs font-black text-arabic-sand shadow-md transition hover:bg-arabic-bronze/90"
                    >
                        <Plus className="h-4 w-4" /> Add New Program
                    </Button>
                </div>

                {/* Main Content Area */}
                <Card className="overflow-hidden rounded-[1.5rem] border border-arabic-cream bg-arabic-sand shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-arabic-cream/40 bg-arabic-cream/10 p-5 pb-2">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-sm font-black tracking-wider text-arabic-bronze uppercase">
                                <BookOpen className="h-4.5 w-4.5 text-arabic-gold" />{' '}
                                Listed Programs
                            </CardTitle>
                            <CardDescription className="mt-1 text-[11px] font-medium text-arabic-bronze/70">
                                Complete registry list of all platform academic
                                streams.
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px] border-collapse text-left text-xs">
                                <thead>
                                    <tr className="border-b border-arabic-cream/45 bg-arabic-cream/20 text-[10px] font-black tracking-wider text-arabic-bronze/80 uppercase">
                                        <th className="p-4">Program Details</th>
                                        <th className="p-4">
                                            Benefits/Target Metrics
                                        </th>
                                        <th className="p-4 text-center">
                                            Status
                                        </th>
                                        <th className="p-4 text-right">
                                            Actions
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
                                                    {program.name}
                                                </span>
                                                <p className="mt-1 text-[10px] leading-relaxed font-medium text-arabic-bronze/70">
                                                    {program.description}
                                                </p>
                                            </td>
                                            <td className="max-w-xs p-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {Array.isArray(
                                                        program.details_json,
                                                    ) &&
                                                        program.details_json.map(
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
                                                        Hidden
                                                    </Badge>
                                                ) : (
                                                    <Badge className="rounded-full bg-arabic-emerald px-2 py-0.5 text-[9px] font-bold text-white">
                                                        Visible
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
                                                        title="Edit Program"
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
                                                                ? 'Show/Unhide Program'
                                                                : 'Hide Program'
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
                                                        title="Delete Program"
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
                                                No programs defined in the
                                                database yet.
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
                                        Quranic Academy
                                    </span>
                                    <h4 className="font-serif text-base font-black text-arabic-bronze">
                                        Add New Learning Program
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
                                <div className="flex-1 space-y-4 overflow-y-auto p-6">
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                            Program Name
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="e.g. Qira'at Program"
                                            value={newProgramForm.data.name}
                                            onChange={(e) =>
                                                newProgramForm.setData(
                                                    'name',
                                                    e.target.value,
                                                )
                                            }
                                            className="rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                            Description
                                        </label>
                                        <Textarea
                                            placeholder="Describe the learning program parameters, targets, and target audience..."
                                            value={
                                                newProgramForm.data.description
                                            }
                                            onChange={(e) =>
                                                newProgramForm.setData(
                                                    'description',
                                                    e.target.value,
                                                )
                                            }
                                            className="min-h-[90px] rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                            Targets/Benefits (comma-separated)
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="e.g. Master riwayah rules, Recite with fluency, Study under Moroccan expert"
                                            value={
                                                newProgramForm.data.details_json
                                            }
                                            onChange={(e) =>
                                                newProgramForm.setData(
                                                    'details_json',
                                                    e.target.value,
                                                )
                                            }
                                            className="rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                        />
                                        <span className="block text-[9px] text-arabic-bronze/50">
                                            Separate each target with a comma.
                                            These will render as tags on the
                                            program listings.
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
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={newProgramForm.processing}
                                        className="h-9 rounded-full bg-arabic-bronze px-6 text-xs font-bold text-arabic-sand shadow-sm hover:bg-arabic-bronze/90"
                                    >
                                        {newProgramForm.processing
                                            ? 'Adding...'
                                            : 'Add Program'}
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
                                        Quranic Academy
                                    </span>
                                    <h4 className="font-serif text-base font-black text-arabic-bronze">
                                        Modify Quranic Program
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
                                <div className="flex-1 space-y-4 overflow-y-auto p-6">
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                            Program Name
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="e.g. Qira'at Program"
                                            value={editProgramForm.data.name}
                                            onChange={(e) =>
                                                editProgramForm.setData(
                                                    'name',
                                                    e.target.value,
                                                )
                                            }
                                            className="rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                            Description
                                        </label>
                                        <Textarea
                                            placeholder="Describe the learning program parameters, targets, and target audience..."
                                            value={
                                                editProgramForm.data.description
                                            }
                                            onChange={(e) =>
                                                editProgramForm.setData(
                                                    'description',
                                                    e.target.value,
                                                )
                                            }
                                            className="min-h-[90px] rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                            Targets/Benefits (comma-separated)
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="e.g. Master riwayah rules, Recite with fluency, Study under Moroccan expert"
                                            value={
                                                editProgramForm.data
                                                    .details_json
                                            }
                                            onChange={(e) =>
                                                editProgramForm.setData(
                                                    'details_json',
                                                    e.target.value,
                                                )
                                            }
                                            className="rounded-xl border-arabic-cream bg-arabic-sand text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                        />
                                        <span className="block text-[9px] text-arabic-bronze/50">
                                            Separate each target with a comma.
                                            These will render as tags on the
                                            program listings.
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
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={editProgramForm.processing}
                                        className="h-9 rounded-full bg-arabic-bronze px-6 text-xs font-bold text-arabic-sand shadow-sm hover:bg-arabic-bronze/90"
                                    >
                                        {editProgramForm.processing
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
