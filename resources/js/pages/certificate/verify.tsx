import { Head, Link } from '@inertiajs/react';
import { Award, ShieldCheck, Calendar, FileText, ArrowLeft, ArrowUpRight, HelpCircle } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';

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

interface CertificateVerifyProps {
    certificate: Certificate | null;
    searchedHash: string;
}

export default function CertificateVerify({ certificate, searchedHash }: CertificateVerifyProps) {
    const formattedDate = certificate
        ? new Date(certificate.issued_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
          })
        : '';

    return (
        <>
            <Head>
                <title>Verify Certificate - Al-Quran Arabic Academy</title>
                <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Outfit:wght@100..900&display=swap" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-arabic-sand text-arabic-bronze font-sans p-6 flex flex-col justify-between items-center selection:bg-arabic-gold/30 antialiased">
                <div className="w-full max-w-7xl flex justify-between items-center py-4">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-arabic-bronze flex items-center justify-center text-arabic-gold">
                            🕌
                        </div>
                        <span className="font-serif text-sm font-black tracking-wide text-arabic-bronze">AL-QURAN ACADEMY</span>
                    </Link>
                    <Link href="/">
                        <Button variant="ghost" className="text-xs font-bold gap-1 rounded-xl hover:bg-arabic-cream/65 text-arabic-bronze">
                            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
                        </Button>
                    </Link>
                </div>

                <main className="w-full max-w-2xl py-8 flex flex-col justify-center items-center grow">
                    {certificate ? (
                        /* State A: Valid Certificate Found */
                        <div className="w-full relative space-y-6 animate-in fade-in zoom-in-95 duration-550">
                            
                            {/* Validation Badge Indicator */}
                            <div className="flex justify-center">
                                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-arabic-emerald/10 border border-arabic-emerald/30 text-emerald-600 dark:text-emerald-500 shadow-sm">
                                    <ShieldCheck className="h-4 w-4 animate-pulse" />
                                    Cryptographically Verified Credential
                                </div>
                            </div>

                            {/* Digital Parchment Certificate container */}
                            <div className="relative bg-[#FCF9F2] border-4 border-double border-arabic-gold rounded-[2.5rem] p-8 md:p-14 text-center space-y-8 shadow-2xl overflow-hidden">
                                
                                {/* Arch ornament backgrounds */}
                                <div className="absolute inset-4 border border-arabic-gold/20 rounded-[2rem] pointer-events-none" />
                                <div className="absolute top-0 right-1/2 translate-x-1/2 w-48 h-12 bg-arabic-gold/10 rounded-b-full blur-xl pointer-events-none" />

                                {/* Seal Heading */}
                                <div className="space-y-2">
                                    <Award className="h-14 w-14 text-arabic-gold mx-auto" />
                                    <h2 className="font-serif text-xs font-black tracking-widest text-arabic-gold uppercase">Platform Certificate of Completion</h2>
                                    <div className="h-px w-24 bg-arabic-gold/45 mx-auto" />
                                </div>

                                {/* Citation Details */}
                                <div className="space-y-4">
                                    <span className="text-xs font-serif italic text-arabic-bronze/70">This is to officially certify that</span>
                                    <h1 className="text-3xl md:text-4xl font-serif font-black tracking-tight text-arabic-bronze">{certificate.student.name}</h1>
                                    <span className="text-xs font-serif italic text-arabic-bronze/70 block">has successfully completed all requirements for</span>
                                    <h3 className="text-xl font-serif italic font-black text-arabic-gold">{certificate.program.name}</h3>
                                </div>

                                {/* Verification details */}
                                <div className="p-4 bg-arabic-cream/25 border border-arabic-cream rounded-2xl max-w-md mx-auto text-xs text-arabic-bronze/80 font-medium leading-relaxed">
                                    "{certificate.notes || 'Awarded for exceptional recitation, pronunciation fluency, and dedicated study under native Moroccan Ustaz instruction.'}"
                                </div>

                                {/* Signatures and Date */}
                                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto pt-4 text-[10px] uppercase font-bold text-arabic-bronze/60">
                                    <div className="text-center space-y-1">
                                        <span className="block border-b border-arabic-cream pb-1 font-serif text-arabic-bronze/80 italic font-black capitalize text-xs">Ustaz from Morocco</span>
                                        <span className="block tracking-wider">Direct Instruction</span>
                                    </div>
                                    <div className="text-center space-y-1">
                                        <span className="block border-b border-arabic-cream pb-1 text-arabic-bronze font-black text-xs font-serif">{formattedDate}</span>
                                        <span className="block tracking-wider">Date of Issuance</span>
                                    </div>
                                </div>

                                {/* Cryptographic Metadata hash block */}
                                <div className="pt-6 border-t border-arabic-cream/65 text-[9px] font-mono text-arabic-bronze/50 space-y-1 select-all">
                                    <span className="block font-bold">VERIFICATION HASH:</span>
                                    <span className="block break-all">{certificate.verification_hash}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* State B: Invalid Hash Error Card */
                        <div className="w-full max-w-md bg-arabic-sand border-2 border-arabic-cream rounded-[2rem] p-8 text-center space-y-6 shadow-xl animate-in fade-in duration-300">
                            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mx-auto">
                                <ShieldCheck className="h-8 w-8" />
                            </div>
                            
                            <div className="space-y-2">
                                <h3 className="font-serif text-xl font-black text-arabic-bronze">Credential Not Found</h3>
                                <p className="text-xs text-arabic-bronze/70 leading-relaxed font-medium">
                                    The cryptographic signature or certificate hash provided could not be verified. It may be invalid, modified, or has been revoked.
                                </p>
                            </div>

                            <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl text-[10px] font-mono text-rose-600 select-all break-all">
                                Searched Hash: {searchedHash}
                            </div>

                            <Link href="/">
                                <Button className="w-full rounded-xl bg-arabic-bronze hover:bg-arabic-bronze/90 text-arabic-sand font-bold text-xs h-10 shadow-sm mt-2">
                                    Return to Homepage
                                </Button>
                            </Link>
                        </div>
                    )}
                </main>

                <footer className="text-[10px] text-arabic-bronze/50 font-bold uppercase tracking-wider py-4">
                    © 2026 Al-Quran Arabic Academy. Secure Verification Registry.
                </footer>
            </div>
        </>
    );
}
