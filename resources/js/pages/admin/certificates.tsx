import { Head, useForm, router } from '@inertiajs/react';
import {
    Award,
    Plus,
    X,
    Edit2,
    Trash2,
    Search,
    ExternalLink,
    Mail,
    FileText,
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
import { useTranslation } from '@/hooks/use-translation';
import AppLayout from '@/layouts/app-layout';
import { getTranslation } from '@/lib/translation-utils';
import { dashboard } from '@/routes';
import { dashboard as adminDashboard } from '@/routes/admin';

interface Student {
    id: number;
    name: string;
    email: string;
}

interface Program {
    id: number;
    name: string | Record<string, string>;
    description: string | Record<string, string>;
}

interface Certificate {
    id: number;
    verification_hash: string;
    issued_at: string;
    notes?: string;
    student: {
        id: number;
        name: string;
        email: string;
    };
    program: {
        id: number;
        name: string | Record<string, string>;
    };
}

interface CertificatesProps {
    certificates: Certificate[];
    students: Student[];
    programs: Program[];
}

export default function Certificates({
    certificates = [],
    students = [],
    programs = [],
}: CertificatesProps) {
    const { t, locale } = useTranslation();
    const [isIssuing, setIsIssuing] = useState(false);
    const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
    const [searchFilter, setSearchFilter] = useState('');

    const issueForm = useForm({
        student_id: '',
        program_id: '',
        notes: '',
    });

    const editForm = useForm({
        notes: '',
    });

    const deleteForm = useForm({});

    const handleIssueSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!issueForm.data.student_id) {
            toast.error(t('Please select a student.'));
            return;
        }

        if (!issueForm.data.program_id) {
            toast.error(t('Please select a program.'));
            return;
        }

        issueForm.post('/admin/certificates', {
            onSuccess: () => {
                setIsIssuing(false);
                issueForm.reset();
                toast.success(
                    t('Alhamdulillah! Learning certificate has been successfully issued!'),
                );
            },
            onError: (err: any) => {
                toast.error(err.error || t('Failed to issue certificate.'));
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingCertificate) {
            return;
        }

        editForm.put(`/admin/certificates/${editingCertificate.id}`, {
            onSuccess: () => {
                setEditingCertificate(null);
                editForm.reset();
                toast.success(
                    t('Alhamdulillah! Certificate notes updated successfully!'),
                );
            },
            onError: (err: any) => {
                toast.error(err.error || t('Failed to update certificate notes.'));
            },
        });
    };

    const startEditing = (certificate: Certificate) => {
        setEditingCertificate(certificate);
        editForm.setData({
            notes: certificate.notes || '',
        });
    };

    const handleRevoke = (certificate: Certificate) => {
        if (
            confirm(
                t(
                    'Are you sure you want to revoke the certificate issued to ":student" for ":program"? This action cannot be undone and will invalidate the verification link.',
                    {
                        student: certificate.student.name,
                        program: getTranslation(certificate.program.name, locale),
                    },
                ),
            )
        ) {
            deleteForm.delete(`/admin/certificates/${certificate.id}`, {
                onSuccess: () => {
                    toast.success(
                        t('Alhamdulillah! Certificate has been successfully revoked.'),
                    );
                },
                onError: (err: any) => {
                    toast.error(err.error || t('Failed to revoke certificate.'));
                },
            });
        }
    };

    const filteredCertificates = certificates.filter((cert) => {
        const query = searchFilter.toLowerCase();
        const matchesStudentName = cert.student.name.toLowerCase().includes(query);
        const matchesStudentEmail = cert.student.email.toLowerCase().includes(query);
        const matchesHash = cert.verification_hash.toLowerCase().includes(query);
        const matchesProgramName = getTranslation(cert.program.name, locale)
            .toLowerCase()
            .includes(query);

        return (
            matchesStudentName ||
            matchesStudentEmail ||
            matchesHash ||
            matchesProgramName
        );
    });

    const breadcrumbs = [
        { title: t('Dashboard'), href: dashboard() },
        { title: t('Admin Portal'), href: adminDashboard() },
        { title: t('Certificates'), href: '/admin/certificates' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('Manage Certificates')} />

            <div className="min-h-screen w-full space-y-8 bg-arabic-sand/20 p-6">
                {/* Header Welcome Bar */}
                <div className="flex flex-col justify-between gap-4 border-b border-arabic-cream/60 pb-6 md:flex-row md:items-center">
                    <div>
                        <h1 className="flex items-center gap-3 font-serif text-3xl font-black text-arabic-bronze">
                            <Award className="h-9 w-9 text-arabic-gold" />{' '}
                            {t('Manage Certificates')}
                        </h1>
                        <p className="mt-1 text-xs font-medium text-arabic-bronze/70">
                            {t(
                                'Issue official learning certifications, modify metadata, and audit verified platform achievements.',
                            )}
                        </p>
                    </div>
                    <div>
                        <Button
                            onClick={() => setIsIssuing(true)}
                            className="h-9 cursor-pointer gap-1 rounded-full bg-arabic-bronze px-4 text-xs font-black text-arabic-sand shadow-md transition hover:bg-arabic-bronze/90"
                        >
                            <Plus className="h-4 w-4" /> {t('Issue New Certificate')}
                        </Button>
                    </div>
                </div>

                {/* Analytical summary metrics */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <Card className="rounded-2xl border border-arabic-cream bg-arabic-sand p-5 shadow-sm">
                        <span className="block text-[10px] font-black tracking-widest text-arabic-bronze/60 uppercase">
                            {t('Total Issued')}
                        </span>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="font-serif text-3xl font-black text-arabic-bronze">
                                {certificates.length}
                            </span>
                            <span className="text-xs font-bold text-arabic-gold">
                                {t('Credentials')}
                            </span>
                        </div>
                    </Card>

                    <Card className="rounded-2xl border border-arabic-cream bg-arabic-sand p-5 shadow-sm">
                        <span className="block text-[10px] font-black tracking-widest text-arabic-bronze/60 uppercase">
                            {t('Eligible Students')}
                        </span>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="font-serif text-3xl font-black text-arabic-bronze">
                                {students.length}
                            </span>
                            <span className="text-xs font-bold text-arabic-gold">
                                {t('Enrolled')}
                            </span>
                        </div>
                    </Card>

                    <Card className="rounded-2xl border border-arabic-cream bg-arabic-sand p-5 shadow-sm">
                        <span className="block text-[10px] font-black tracking-widest text-arabic-bronze/60 uppercase">
                            {t('Active Programs')}
                        </span>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="font-serif text-3xl font-black text-arabic-bronze">
                                {programs.length}
                            </span>
                            <span className="text-xs font-bold text-arabic-gold">
                                {t('Streams')}
                            </span>
                        </div>
                    </Card>
                </div>

                {/* Main Content Area */}
                <Card className="overflow-hidden rounded-[1.5rem] border border-arabic-cream bg-arabic-sand shadow-sm">
                    <CardHeader className="border-b border-arabic-cream/40 bg-arabic-cream/10 p-5 pb-4">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-sm font-black tracking-wider text-arabic-bronze uppercase">
                                    <Award className="h-4.5 w-4.5 text-arabic-gold" />{' '}
                                    {t('Certificate Registry')}
                                </CardTitle>
                                <CardDescription className="mt-1 text-[11px] font-medium text-arabic-bronze/70">
                                    {t(
                                        'Verified list of all issued certificates and cryptographic signatures.',
                                    )}
                                </CardDescription>
                            </div>

                            {/* Search Filter Bar */}
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute top-1/2 left-3.5 h-3.5 w-3.5 -translate-y-1/2 text-arabic-bronze/40" />
                                <Input
                                    type="text"
                                    placeholder={t('Search by student, program or hash...')}
                                    value={searchFilter}
                                    onChange={(e) => setSearchFilter(e.target.value)}
                                    className="h-9 w-full rounded-xl border-arabic-cream bg-arabic-sand/50 pl-9 text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px] border-collapse text-left text-xs">
                                <thead>
                                    <tr className="border-b border-arabic-cream/45 bg-arabic-cream/20 text-[10px] font-black tracking-wider text-arabic-bronze/80 uppercase">
                                        <th className="p-4">{t('Student')}</th>
                                        <th className="p-4">{t('Program')}</th>
                                        <th className="p-4">{t('Verification Signature')}</th>
                                        <th className="p-4">{t('Notes')}</th>
                                        <th className="p-4">{t('Date Issued')}</th>
                                        <th className="p-4 text-right">{t('Actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-arabic-cream/35 font-semibold text-arabic-bronze">
                                    {filteredCertificates.map((cert) => (
                                        <tr
                                            key={cert.id}
                                            className="transition hover:bg-arabic-cream/10"
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-arabic-cream text-xs font-black text-arabic-bronze shadow-inner">
                                                        {cert.student.name
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <span className="block text-sm font-extrabold text-arabic-bronze">
                                                            {cert.student.name}
                                                        </span>
                                                        <span className="mt-0.5 block font-mono text-[10px] text-arabic-bronze/60">
                                                            {cert.student.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-xs font-extrabold text-arabic-gold">
                                                    {getTranslation(cert.program.name, locale)}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-1.5 font-mono text-[10px] text-arabic-bronze/70">
                                                    <span className="truncate max-w-[120px]" title={cert.verification_hash}>
                                                        {cert.verification_hash}
                                                    </span>
                                                    <a
                                                        href={`/certificates/verify/${cert.verification_hash}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex cursor-pointer text-arabic-gold hover:text-arabic-bronze"
                                                        title={t('Verify Credential')}
                                                    >
                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                    </a>
                                                </div>
                                            </td>
                                            <td className="p-4 max-w-[200px]">
                                                <p className="truncate text-[11px] text-arabic-bronze/70" title={cert.notes}>
                                                    {cert.notes || t('No specific notes shared.')}
                                                </p>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-[11px] font-bold text-arabic-bronze/80">
                                                    {new Date(cert.issued_at).toLocaleDateString(
                                                        locale === 'ar'
                                                            ? 'ar-EG'
                                                            : locale === 'id'
                                                            ? 'id-ID'
                                                            : 'en-US',
                                                        {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                        },
                                                    )}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => startEditing(cert)}
                                                        className="cursor-pointer rounded-lg p-1.5 text-arabic-bronze/75 transition hover:bg-arabic-cream hover:text-arabic-bronze"
                                                        title={t('Edit notes')}
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRevoke(cert)}
                                                        className="cursor-pointer rounded-lg p-1.5 text-rose-500 transition hover:bg-rose-500/10 hover:text-rose-700"
                                                        title={t('Revoke Certificate')}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredCertificates.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="p-8 text-center text-xs font-bold text-arabic-bronze/50"
                                            >
                                                {t('No certificates found.')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Issue Certificate Modal */}
                {isIssuing && (
                    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-arabic-bronze/45 p-4 backdrop-blur-sm duration-200 fade-in">
                        <div className="flex max-h-[90vh] w-full max-w-md animate-in flex-col overflow-hidden rounded-[2rem] border-2 border-arabic-cream bg-arabic-sand shadow-2xl duration-200 zoom-in-95">
                            <div className="flex shrink-0 items-center justify-between border-b border-arabic-cream bg-arabic-cream/60 px-6 py-4">
                                <div>
                                    <span className="block text-[9px] font-bold tracking-widest text-arabic-gold uppercase">
                                        {t('Issue Credential')}
                                    </span>
                                    <h4 className="font-serif text-base font-black text-arabic-bronze">
                                        {t('Issue New Certificate')}
                                    </h4>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsIssuing(false);
                                        issueForm.reset();
                                    }}
                                    className="cursor-pointer rounded-full p-2 text-arabic-bronze/60 transition hover:bg-arabic-cream hover:text-arabic-bronze"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleIssueSubmit} className="flex flex-1 flex-col overflow-hidden">
                                <div className="flex-1 space-y-4 overflow-y-auto p-6 text-xs">
                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                            {t('Select Student')}
                                        </label>
                                        <select
                                            value={issueForm.data.student_id}
                                            onChange={(e) => issueForm.setData('student_id', e.target.value)}
                                            className="w-full h-9 rounded-xl border border-arabic-cream bg-arabic-sand px-3 text-xs font-semibold shadow-sm focus:border-arabic-gold focus:outline-none"
                                            required
                                        >
                                            <option value="">{t('-- Choose a Student --')}</option>
                                            {students.map((student) => (
                                                <option key={student.id} value={student.id}>
                                                    {student.name} ({student.email})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                            {t('Select Program')}
                                        </label>
                                        <select
                                            value={issueForm.data.program_id}
                                            onChange={(e) => issueForm.setData('program_id', e.target.value)}
                                            className="w-full h-9 rounded-xl border border-arabic-cream bg-arabic-sand px-3 text-xs font-semibold shadow-sm focus:border-arabic-gold focus:outline-none"
                                            required
                                        >
                                            <option value="">{t('-- Choose a Program --')}</option>
                                            {programs.map((program) => (
                                                <option key={program.id} value={program.id}>
                                                    {getTranslation(program.name, locale)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                            {t('Notes / Accomplishments Description')}
                                        </label>
                                        <textarea
                                            rows={4}
                                            placeholder={t(
                                                'Write specific notes regarding student articulation, tajweed rules completed, etc...',
                                            )}
                                            value={issueForm.data.notes}
                                            onChange={(e) => issueForm.setData('notes', e.target.value)}
                                            className="w-full rounded-xl border border-arabic-cream bg-arabic-sand p-3 text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex shrink-0 justify-end gap-2 border-t border-arabic-cream bg-arabic-cream/30 px-6 py-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setIsIssuing(false);
                                            issueForm.reset();
                                        }}
                                        className="h-9 cursor-pointer rounded-full border-arabic-bronze/25 text-xs font-bold text-arabic-bronze hover:bg-arabic-cream"
                                    >
                                        {t('Cancel')}
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={issueForm.processing}
                                        className="h-9 cursor-pointer rounded-full bg-arabic-bronze px-6 text-xs font-bold text-arabic-sand shadow-sm hover:bg-arabic-bronze/90"
                                    >
                                        {issueForm.processing ? t('Issuing...') : t('Issue Certificate')}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Notes Modal */}
                {editingCertificate && (
                    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-arabic-bronze/45 p-4 backdrop-blur-sm duration-200 fade-in">
                        <div className="flex max-h-[90vh] w-full max-w-md animate-in flex-col overflow-hidden rounded-[2rem] border-2 border-arabic-cream bg-arabic-sand shadow-2xl duration-200 zoom-in-95">
                            <div className="flex shrink-0 items-center justify-between border-b border-arabic-cream bg-arabic-cream/60 px-6 py-4">
                                <div>
                                    <span className="block text-[9px] font-bold tracking-widest text-arabic-gold uppercase">
                                        {t('Meta Editor')}
                                    </span>
                                    <h4 className="font-serif text-base font-black text-arabic-bronze">
                                        {t('Edit Certificate Notes')}
                                    </h4>
                                </div>
                                <button
                                    onClick={() => {
                                        setEditingCertificate(null);
                                        editForm.reset();
                                    }}
                                    className="cursor-pointer rounded-full p-2 text-arabic-bronze/60 transition hover:bg-arabic-cream hover:text-arabic-bronze"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleEditSubmit} className="flex flex-1 flex-col overflow-hidden">
                                <div className="flex-1 space-y-4 overflow-y-auto p-6 text-xs">
                                    <div className="space-y-1.5">
                                        <div className="rounded-lg bg-arabic-cream/20 p-3 text-[11px] text-arabic-bronze/80 space-y-1">
                                            <p><strong>{t('Student')}:</strong> {editingCertificate.student.name}</p>
                                            <p><strong>{t('Program')}:</strong> {getTranslation(editingCertificate.program.name, locale)}</p>
                                            <p><strong>{t('Signature')}:</strong> <span className="font-mono text-[10px]">{editingCertificate.verification_hash}</span></p>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-arabic-bronze/60 uppercase">
                                            {t('Notes / Accomplishments Description')}
                                        </label>
                                        <textarea
                                            rows={5}
                                            placeholder={t('Write constructive notes...')}
                                            value={editForm.data.notes}
                                            onChange={(e) => editForm.setData('notes', e.target.value)}
                                            className="w-full rounded-xl border border-arabic-cream bg-arabic-sand p-3 text-xs font-semibold shadow-sm placeholder:text-arabic-bronze/40 focus:border-arabic-gold focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex shrink-0 justify-end gap-2 border-t border-arabic-cream bg-arabic-cream/30 px-6 py-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setEditingCertificate(null);
                                            editForm.reset();
                                        }}
                                        className="h-9 cursor-pointer rounded-full border-arabic-bronze/25 text-xs font-bold text-arabic-bronze hover:bg-arabic-cream"
                                    >
                                        {t('Cancel')}
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={editForm.processing}
                                        className="h-9 cursor-pointer rounded-full bg-arabic-bronze px-6 text-xs font-bold text-arabic-sand shadow-sm hover:bg-arabic-bronze/90"
                                    >
                                        {editForm.processing ? t('Saving...') : t('Save Changes')}
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
