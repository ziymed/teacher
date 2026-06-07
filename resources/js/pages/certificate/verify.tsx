import { Head, Link } from '@inertiajs/react';
import {
    Award,
    ShieldCheck,
    Calendar,
    FileText,
    ArrowLeft,
    ArrowUpRight,
    HelpCircle,
} from 'lucide-react';
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

export default function CertificateVerify({
    certificate,
    searchedHash,
}: CertificateVerifyProps) {
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
                <link
                    href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Outfit:wght@100..900&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div className="flex min-h-screen flex-col items-center justify-between bg-arabic-sand p-6 font-sans text-arabic-bronze antialiased selection:bg-arabic-gold/30">
                <div className="flex w-full max-w-7xl items-center justify-between py-4">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-arabic-bronze text-arabic-gold">
                            🕌
                        </div>
                        <span className="font-serif text-sm font-black tracking-wide text-arabic-bronze">
                            AL-QURAN ACADEMY
                        </span>
                    </Link>
                    <Link href="/">
                        <Button
                            variant="ghost"
                            className="gap-1 rounded-xl text-xs font-bold text-arabic-bronze hover:bg-arabic-cream/65"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
                        </Button>
                    </Link>
                </div>

                <main className="flex w-full max-w-2xl grow flex-col items-center justify-center py-8">
                    {certificate ? (
                        /* State A: Valid Certificate Found */
                        <div className="relative w-full animate-in space-y-6 duration-550 zoom-in-95 fade-in">
                            {/* Validation Badge Indicator */}
                            <div className="flex justify-center">
                                <div className="inline-flex items-center gap-1.5 rounded-full border border-arabic-emerald/30 bg-arabic-emerald/10 px-4 py-1.5 text-xs font-bold text-emerald-600 shadow-sm dark:text-emerald-500">
                                    <ShieldCheck className="h-4 w-4 animate-pulse" />
                                    Cryptographically Verified Credential
                                </div>
                            </div>

                            {/* Digital Parchment Certificate container */}
                            <div className="relative space-y-8 overflow-hidden rounded-[2.5rem] border-4 border-double border-arabic-gold bg-[#FCF9F2] p-8 text-center shadow-2xl md:p-14">
                                {/* Arch ornament backgrounds */}
                                <div className="pointer-events-none absolute inset-4 rounded-[2rem] border border-arabic-gold/20" />
                                <div className="pointer-events-none absolute top-0 right-1/2 h-12 w-48 translate-x-1/2 rounded-b-full bg-arabic-gold/10 blur-xl" />

                                {/* Seal Heading */}
                                <div className="space-y-2">
                                    <Award className="mx-auto h-14 w-14 text-arabic-gold" />
                                    <h2 className="font-serif text-xs font-black tracking-widest text-arabic-gold uppercase">
                                        Platform Certificate of Completion
                                    </h2>
                                    <div className="mx-auto h-px w-24 bg-arabic-gold/45" />
                                </div>

                                {/* Citation Details */}
                                <div className="space-y-4">
                                    <span className="font-serif text-xs text-arabic-bronze/70 italic">
                                        This is to officially certify that
                                    </span>
                                    <h1 className="font-serif text-3xl font-black tracking-tight text-arabic-bronze md:text-4xl">
                                        {certificate.student.name}
                                    </h1>
                                    <span className="block font-serif text-xs text-arabic-bronze/70 italic">
                                        has successfully completed all
                                        requirements for
                                    </span>
                                    <h3 className="font-serif text-xl font-black text-arabic-gold italic">
                                        {certificate.program.name}
                                    </h3>
                                </div>

                                {/* Verification details */}
                                <div className="mx-auto max-w-md rounded-2xl border border-arabic-cream bg-arabic-cream/25 p-4 text-xs leading-relaxed font-medium text-arabic-bronze/80">
                                    "
                                    {certificate.notes ||
                                        'Awarded for exceptional recitation, pronunciation fluency, and dedicated study under native Moroccan Ustaz instruction.'}
                                    "
                                </div>

                                {/* Signatures and Date */}
                                <div className="mx-auto grid max-w-md grid-cols-2 gap-4 pt-4 text-[10px] font-bold text-arabic-bronze/60 uppercase">
                                    <div className="space-y-1 text-center">
                                        <span className="block border-b border-arabic-cream pb-1 font-serif text-xs font-black text-arabic-bronze/80 capitalize italic">
                                            Ustaz from Morocco
                                        </span>
                                        <span className="block tracking-wider">
                                            Direct Instruction
                                        </span>
                                    </div>
                                    <div className="space-y-1 text-center">
                                        <span className="block border-b border-arabic-cream pb-1 font-serif text-xs font-black text-arabic-bronze">
                                            {formattedDate}
                                        </span>
                                        <span className="block tracking-wider">
                                            Date of Issuance
                                        </span>
                                    </div>
                                </div>

                                {/* Cryptographic Metadata hash block */}
                                <div className="space-y-1 border-t border-arabic-cream/65 pt-6 font-mono text-[9px] text-arabic-bronze/50 select-all">
                                    <span className="block font-bold">
                                        VERIFICATION HASH:
                                    </span>
                                    <span className="block break-all">
                                        {certificate.verification_hash}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* State B: Invalid Hash Error Card */
                        <div className="w-full max-w-md animate-in space-y-6 rounded-[2rem] border-2 border-arabic-cream bg-arabic-sand p-8 text-center shadow-xl duration-300 fade-in">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-500">
                                <ShieldCheck className="h-8 w-8" />
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-serif text-xl font-black text-arabic-bronze">
                                    Credential Not Found
                                </h3>
                                <p className="text-xs leading-relaxed font-medium text-arabic-bronze/70">
                                    The cryptographic signature or certificate
                                    hash provided could not be verified. It may
                                    be invalid, modified, or has been revoked.
                                </p>
                            </div>

                            <div className="rounded-xl border border-rose-500/10 bg-rose-500/5 p-3 font-mono text-[10px] break-all text-rose-600 select-all">
                                Searched Hash: {searchedHash}
                            </div>

                            <Link href="/">
                                <Button className="mt-2 h-10 w-full rounded-xl bg-arabic-bronze text-xs font-bold text-arabic-sand shadow-sm hover:bg-arabic-bronze/90">
                                    Return to Homepage
                                </Button>
                            </Link>
                        </div>
                    )}
                </main>

                <footer className="py-4 text-[10px] font-bold tracking-wider text-arabic-bronze/50 uppercase">
                    © 2026 Al-Quran Arabic Academy. Secure Verification
                    Registry.
                </footer>
            </div>
        </>
    );
}
