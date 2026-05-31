import AdminLteLayout from '@/layouts/admin-lte-layout';
import { Head, useForm } from '@inertiajs/react';
import { Award, Users, BookOpen, Calendar, ShieldAlert, BarChart3, Clock, Check, Plus, Minus, AlertCircle, X, ArrowRight, RefreshCw } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
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
    programs: any[];
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

    // Collapsible widget states (AdminLTE Card controls)
    const [isTeachersCollapsed, setIsTeachersCollapsed] = useState(false);
    const [isStudentsCollapsed, setIsStudentsCollapsed] = useState(false);
    const [isCertificatesCollapsed, setIsCertificatesCollapsed] = useState(false);

    // Visible widget states (AdminLTE Card close controls)
    const [isTeachersVisible, setIsTeachersVisible] = useState(true);
    const [isStudentsVisible, setIsStudentsVisible] = useState(true);
    const [isCertificatesVisible, setIsCertificatesVisible] = useState(true);

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
                toast.success('Alhamdulillah! Official learning certificate has been successfully issued!');
            },
            onError: (err: any) => {
                toast.error(err.error || 'Failed to issue certificate.');
            },
        });
    };

    const breadcrumbs = [
        { title: 'Admin Portal', href: adminDashboard() },
    ];

    const triggerRefresh = (sectionName: string) => {
        toast.info(`Refreshing ${sectionName} registry data...`);
    };

    return (
        <AdminLteLayout breadcrumbs={breadcrumbs} metrics={metrics}>
            <Head title="Admin Dashboard" />

            <div className="space-y-6">
                
                {/* Header Welcome Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#dee2e6] rounded-xl p-5 shadow-sm select-none">
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold text-[#343a40] flex items-center gap-1.5">
                            Welcome Back, Administrator ✦
                        </h3>
                        <p className="text-xs text-[#6c757d] font-semibold">
                            Review platform analytics metrics, manage teachers and students registry, and award credentials.
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsIssuing(true)}
                        className="rounded-lg bg-[#d4af37] text-[#343a40] font-bold text-xs hover:bg-[#d4af37]/90 transition shadow-sm gap-1.5 h-9 shrink-0"
                    >
                        <Award className="h-4 w-4" /> Issue Official Certificate
                    </Button>
                </div>

                {/* Info Boxes / Small Boxes (Classic AdminLTE 4 Colored Widgets) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                    
                    {/* Box 1: Info (Teal/Cyan) */}
                    <div className="bg-[#17a2b8] text-white rounded-xl shadow-md overflow-hidden relative group h-28 flex flex-col justify-between select-none">
                        <div className="p-4 flex justify-between items-start">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-extrabold leading-none">{metrics.totalBookings}</h3>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">Total Bookings</p>
                            </div>
                            <BookOpen className="h-12 w-12 text-white/15 absolute right-3 top-3 group-hover:scale-110 transition duration-300" />
                        </div>
                        <a href="#teachers-registry" className="bg-black/15 py-1 text-center text-[9px] font-extrabold flex items-center justify-center gap-1 hover:bg-black/25 transition">
                            More info <ArrowRight className="h-3 w-3" />
                        </a>
                    </div>

                    {/* Box 2: Success (Green) */}
                    <div className="bg-[#28a745] text-white rounded-xl shadow-md overflow-hidden relative group h-28 flex flex-col justify-between select-none">
                        <div className="p-4 flex justify-between items-start">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-extrabold leading-none">{metrics.completedBookings}</h3>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">Completed Sessions</p>
                            </div>
                            <Check className="h-12 w-12 text-white/15 absolute right-3 top-3 group-hover:scale-110 transition duration-300" />
                        </div>
                        <a href="#teachers-registry" className="bg-black/15 py-1 text-center text-[9px] font-extrabold flex items-center justify-center gap-1 hover:bg-black/25 transition">
                            More info <ArrowRight className="h-3 w-3" />
                        </a>
                    </div>

                    {/* Box 3: Warning (Yellow/Amber) */}
                    <div className="bg-[#ffc107] text-[#343a40] rounded-xl shadow-md overflow-hidden relative group h-28 flex flex-col justify-between select-none">
                        <div className="p-4 flex justify-between items-start">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-extrabold leading-none">{metrics.activeStudentsCount}</h3>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-[#343a40]/80">Active Students</p>
                            </div>
                            <Users className="h-12 w-12 text-[#343a40]/15 absolute right-3 top-3 group-hover:scale-110 transition duration-300" />
                        </div>
                        <a href="#students-registry" className="bg-black/10 py-1 text-center text-[9px] font-extrabold flex items-center justify-center gap-1 hover:bg-black/20 transition">
                            More info <ArrowRight className="h-3 w-3" />
                        </a>
                    </div>

                    {/* Box 4: Primary (Blue) */}
                    <div className="bg-[#007bff] text-white rounded-xl shadow-md overflow-hidden relative group h-28 flex flex-col justify-between select-none">
                        <div className="p-4 flex justify-between items-start">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-extrabold leading-none">{metrics.activeTeachersCount}</h3>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">Native Teachers</p>
                            </div>
                            <Users className="h-12 w-12 text-white/15 absolute right-3 top-3 group-hover:scale-110 transition duration-300" />
                        </div>
                        <a href="#teachers-registry" className="bg-black/15 py-1 text-center text-[9px] font-extrabold flex items-center justify-center gap-1 hover:bg-black/25 transition">
                            More info <ArrowRight className="h-3 w-3" />
                        </a>
                    </div>

                    {/* Box 5: Danger (Red/Bronze) */}
                    <div className="bg-[#dc3545] text-white rounded-xl shadow-md overflow-hidden relative group h-28 flex flex-col justify-between select-none">
                        <div className="p-4 flex justify-between items-start">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-extrabold leading-none">{metrics.totalCertificatesCount}</h3>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">Credentials Issued</p>
                            </div>
                            <Award className="h-12 w-12 text-white/15 absolute right-3 top-3 group-hover:scale-110 transition duration-300" />
                        </div>
                        <a href="#certificates-audits" className="bg-black/15 py-1 text-center text-[9px] font-extrabold flex items-center justify-center gap-1 hover:bg-black/25 transition">
                            More info <ArrowRight className="h-3 w-3" />
                        </a>
                    </div>

                </div>

                {/* Main Content Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Left Column: Management Tables */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* 1. Teachers registry grid */}
                        {isTeachersVisible && (
                            <div id="teachers-registry" className="bg-white border border-[#dee2e6] rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-300">
                                {/* Header block with collapsible controls */}
                                <div className="px-5 py-3 border-b border-[#dee2e6] bg-[#f8f9fa] flex items-center justify-between select-none">
                                    <h3 className="font-bold text-xs text-[#343a40] flex items-center gap-2 uppercase tracking-wide">
                                        <Users className="h-4.5 w-4.5 text-[#d4af37]" /> Moroccan Teachers Registry
                                    </h3>
                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={() => triggerRefresh('Teachers')}
                                            className="p-1 hover:bg-[#e9ecef] rounded text-[#6c757d] hover:text-[#343a40]"
                                            title="Refresh"
                                        >
                                            <RefreshCw className="h-3.5 w-3.5" />
                                        </button>
                                        <button 
                                            onClick={() => setIsTeachersCollapsed(!isTeachersCollapsed)}
                                            className="p-1 hover:bg-[#e9ecef] rounded text-[#6c757d] hover:text-[#343a40]"
                                            title="Collapse/Expand"
                                        >
                                            {isTeachersCollapsed ? <Plus className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                                        </button>
                                        <button 
                                            onClick={() => setIsTeachersVisible(false)}
                                            className="p-1 hover:bg-[#e9ecef] rounded text-[#6c757d] hover:text-red-500"
                                            title="Close"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Table content */}
                                {!isTeachersCollapsed && (
                                    <div className="overflow-x-auto animate-in slide-in-from-top-1 duration-200">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead>
                                                <tr className="bg-[#f8f9fa] border-b border-[#dee2e6] text-[#495057] font-bold text-[10px] uppercase tracking-wider">
                                                    <th className="p-4">Teacher Name</th>
                                                    <th className="p-4">Contact Detail</th>
                                                    <th className="p-4 text-center">Open Hours</th>
                                                    <th className="p-4 text-right">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#dee2e6] text-[#343a40] font-semibold">
                                                {teachers.map((teacher) => (
                                                    <tr key={teacher.id} className="hover:bg-[#f8f9fa] transition">
                                                        <td className="p-4 flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-full bg-[#f8f9fa] flex items-center justify-center text-xs shadow-inner">🇲🇦</div>
                                                            <span className="font-extrabold text-[#343a40]">{teacher.name}</span>
                                                        </td>
                                                        <td className="p-4 font-mono text-[10px] text-[#6c757d]">
                                                            {teacher.email} <br />
                                                            <span className="text-[10px] text-[#d4af37] font-bold">{teacher.teacher_profile?.whatsapp_number}</span>
                                                        </td>
                                                        <td className="p-4 text-center text-[#d4af37] font-extrabold">{teacher.slots_count} slots</td>
                                                        <td className="p-4 text-right">
                                                            <Badge className="bg-emerald-500 text-white text-[9px] font-bold rounded-full py-0.5 px-2">Active</Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 2. Students registry grid */}
                        {isStudentsVisible && (
                            <div id="students-registry" className="bg-white border border-[#dee2e6] rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-300">
                                <div className="px-5 py-3 border-b border-[#dee2e6] bg-[#f8f9fa] flex items-center justify-between select-none">
                                    <h3 className="font-bold text-xs text-[#343a40] flex items-center gap-2 uppercase tracking-wide">
                                        <Users className="h-4.5 w-4.5 text-[#d4af37]" /> Active Students Registry
                                    </h3>
                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={() => triggerRefresh('Students')}
                                            className="p-1 hover:bg-[#e9ecef] rounded text-[#6c757d] hover:text-[#343a40]"
                                            title="Refresh"
                                        >
                                            <RefreshCw className="h-3.5 w-3.5" />
                                        </button>
                                        <button 
                                            onClick={() => setIsStudentsCollapsed(!isStudentsCollapsed)}
                                            className="p-1 hover:bg-[#e9ecef] rounded text-[#6c757d] hover:text-[#343a40]"
                                            title="Collapse/Expand"
                                        >
                                            {isStudentsCollapsed ? <Plus className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                                        </button>
                                        <button 
                                            onClick={() => setIsStudentsVisible(false)}
                                            className="p-1 hover:bg-[#e9ecef] rounded text-[#6c757d] hover:text-red-500"
                                            title="Close"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {!isStudentsCollapsed && (
                                    <div className="overflow-x-auto animate-in slide-in-from-top-1 duration-200">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead>
                                                <tr className="bg-[#f8f9fa] border-b border-[#dee2e6] text-[#495057] font-bold text-[10px] uppercase tracking-wider">
                                                    <th className="p-4">Student Name & Account</th>
                                                    <th className="p-4">Total Bookings</th>
                                                    <th className="p-4 text-right">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#dee2e6] text-[#343a40] font-semibold">
                                                {students.map((student) => (
                                                    <tr key={student.id} className="hover:bg-[#f8f9fa] transition">
                                                        <td className="p-4">
                                                            <span className="font-extrabold block text-[#343a40]">{student.name}</span>
                                                            <span className="text-[10px] text-[#6c757d] font-mono mt-0.5 block">{student.email}</span>
                                                        </td>
                                                        <td className="p-4 text-[#6c757d] font-bold">{student.student_bookings_count} hours booked</td>
                                                        <td className="p-4 text-right">
                                                            <Badge className="bg-[#007bff] text-white text-[9px] font-bold rounded-full py-0.5 px-2">Enrolled</Badge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>

                    {/* Right Column: Certificates audit timeline */}
                    <div className="lg:col-span-4 space-y-6">
                        {isCertificatesVisible && (
                            <div id="certificates-audits" className="bg-white border border-[#dee2e6] rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-300">
                                <div className="px-5 py-3 border-b border-[#dee2e6] bg-[#f8f9fa] flex items-center justify-between select-none">
                                    <h3 className="font-bold text-xs text-[#343a40] flex items-center gap-2 uppercase tracking-wide">
                                        <Award className="h-4.5 w-4.5 text-[#d4af37]" /> Certificates Audits
                                    </h3>
                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={() => setIsCertificatesCollapsed(!isCertificatesCollapsed)}
                                            className="p-1 hover:bg-[#e9ecef] rounded text-[#6c757d] hover:text-[#343a40]"
                                            title="Collapse/Expand"
                                        >
                                            {isCertificatesCollapsed ? <Plus className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                                        </button>
                                        <button 
                                            onClick={() => setIsCertificatesVisible(false)}
                                            className="p-1 hover:bg-[#e9ecef] rounded text-[#6c757d] hover:text-red-500"
                                            title="Close"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {!isCertificatesCollapsed && (
                                    <div className="p-5 animate-in slide-in-from-top-1 duration-200 space-y-4">
                                        {certificates.length > 0 ? (
                                            <div className="relative border-l-2 border-[#dee2e6] pl-4 space-y-5 max-h-[480px] overflow-y-auto pr-1 select-none">
                                                {certificates.map((cert) => {
                                                    const issueDate = new Date(cert.issued_at).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                    });

                                                    return (
                                                        <div key={cert.id} className="relative text-xs">
                                                            {/* Custom timeline bullet point */}
                                                            <div className="absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#d4af37] border-2 border-white" />
                                                            
                                                            <div className="flex justify-between items-start gap-2">
                                                                <div>
                                                                    <span className="text-[9px] text-[#6c757d] font-bold block uppercase tracking-wider">Recipient</span>
                                                                    <span className="font-extrabold text-[#343a40] block">{cert.student.name}</span>
                                                                </div>
                                                                <span className="text-[10px] text-[#d4af37] font-bold shrink-0">{issueDate}</span>
                                                            </div>
                                                            <div className="mt-2 p-2.5 bg-[#f8f9fa] border border-[#dee2e6] rounded-lg">
                                                                <span className="font-extrabold text-[#343a40] block">{cert.program.name}</span>
                                                                {cert.notes && (
                                                                    <p className="text-[10px] text-[#6c757d] font-medium leading-relaxed mt-1">"{cert.notes}"</p>
                                                                )}
                                                                <span className="text-[9px] text-[#8c949c] font-mono mt-1.5 block leading-none">Hash: {cert.verification_hash.substring(0, 16)}...</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="p-8 bg-[#f8f9fa] border border-[#dee2e6] rounded-xl text-center text-xs font-bold text-[#6c757d]">
                                                No credentials issued on the platform yet.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                </div>

                {/* Explicit Certificate Issue Modal Drawer */}
                {isIssuing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4 animate-in fade-in duration-200 select-none">
                        <div className="bg-white border border-[#dee2e6] w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="bg-[#f8f9fa] px-6 py-4 flex items-center justify-between border-b border-[#dee2e6]">
                                <div>
                                    <span className="text-[9px] uppercase font-bold tracking-widest text-[#d4af37] block">Credential Manager</span>
                                    <h4 className="font-bold text-sm text-[#343a40]">Award Official Certificate</h4>
                                </div>
                                <button
                                    onClick={() => setIsIssuing(false)}
                                    className="p-2 hover:bg-[#e9ecef] rounded-full transition text-[#6c757d] hover:text-[#343a40]"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleIssueCertificateSubmit}>
                                <div className="p-6 space-y-4">
                                    
                                    {/* Select Student */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase font-black text-[#6c757d] block">Select Student Recipient</label>
                                        <select
                                            value={certForm.data.student_id}
                                            onChange={(e) => certForm.setData('student_id', e.target.value)}
                                            className="w-full p-3 text-xs rounded-lg border border-[#dee2e6] bg-white text-[#343a40] font-bold focus:border-[#d4af37] outline-none shadow-sm"
                                        >
                                            <option value="">-- Choose student recipient --</option>
                                            {students.map((student) => (
                                                <option key={student.id} value={student.id}>
                                                    {student.name} ({student.email})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Select Program */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase font-black text-[#6c757d] block">Select Quranic Program</label>
                                        <select
                                            value={certForm.data.program_id}
                                            onChange={(e) => certForm.setData('program_id', e.target.value)}
                                            className="w-full p-3 text-xs rounded-lg border border-[#dee2e6] bg-white text-[#343a40] font-bold focus:border-[#d4af37] outline-none shadow-sm"
                                        >
                                            <option value="">-- Choose Quranic program --</option>
                                            {programs.map((prog) => (
                                                <option key={prog.id} value={prog.id}>
                                                    {prog.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Custom Notes */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase font-black text-[#6c757d] block">Audit/Issuance Notes</label>
                                        <Textarea
                                            placeholder="Write special citation (e.g. Completed Tajweed recitation with excellent marks under teacher evaluation)..."
                                            value={certForm.data.notes}
                                            onChange={(e) => certForm.setData('notes', e.target.value)}
                                            className="text-xs min-h-[90px] rounded-lg border-[#dee2e6] bg-white placeholder:text-[#8c949c] focus:border-[#d4af37] shadow-sm font-semibold"
                                        />
                                    </div>
                                </div>

                                <div className="bg-[#f8f9fa] px-6 py-4 flex justify-end gap-2 border-t border-[#dee2e6]">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsIssuing(false)}
                                        className="rounded-lg border-[#dee2e6] hover:bg-[#e9ecef] text-[#495057] text-xs font-bold h-9"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={certForm.processing}
                                        className="rounded-lg bg-[#343a40] text-white hover:bg-[#343a40]/90 text-xs font-bold px-6 shadow-sm h-9"
                                    >
                                        {certForm.processing ? 'Issuing...' : 'Issue Certificate'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </AdminLteLayout>
    );
}
