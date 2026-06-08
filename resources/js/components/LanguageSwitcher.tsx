import React from 'react';
import { router, usePage } from '@inertiajs/react';
import { Globe } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const IndonesianFlag = () => (
    <svg viewBox="0 0 3 2" className="h-3 w-4.5 rounded-xs overflow-hidden shadow-xs border border-neutral-200/20 shrink-0">
        <rect width="3" height="1" fill="#FF0000" />
        <rect y="1" width="3" height="1" fill="#FFFFFF" />
    </svg>
);

const MoroccanFlag = () => (
    <svg viewBox="0 0 3 2" className="h-3 w-4.5 rounded-xs overflow-hidden shadow-xs border border-neutral-200/20 shrink-0">
        <rect width="3" height="2" fill="#C1272D" />
        <path
            d="M 1.5,0.55 L 1.764,1.364 L 1.072,0.861 L 1.928,0.861 L 1.236,1.364 Z"
            fill="none"
            stroke="#006233"
            strokeWidth="0.06"
            strokeLinejoin="round"
        />
    </svg>
);

const BritishFlag = () => (
    <svg viewBox="0 0 60 40" className="h-3 w-4.5 rounded-xs overflow-hidden shadow-xs border border-neutral-200/20 shrink-0">
        <rect width="60" height="40" fill="#012169" />
        <path d="M0,0 L60,40 M60,0 L0,40" stroke="#FFFFFF" strokeWidth="6" />
        <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="2.5" />
        <path d="M30,0 L30,40 M0,20 L60,20" stroke="#FFFFFF" strokeWidth="10" />
        <path d="M30,0 L30,40 M0,20 L60,20" stroke="#C8102E" strokeWidth="6" />
    </svg>
);

export function LanguageSwitcher() {
    const { locale } = usePage<any>().props;

    const languages = [
        { code: 'id', name: 'Bahasa Indonesia', flag: <IndonesianFlag /> },
        { code: 'ar', name: 'العربية', flag: <MoroccanFlag /> },
        { code: 'en', name: 'English', flag: <BritishFlag /> },
    ];

    const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0];

    const handleLanguageChange = (code: string) => {
        router.post('/locale', { locale: code });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="flex h-9 items-center gap-2 rounded-full border-arabic-cream bg-arabic-sand px-3 text-xs font-bold text-arabic-bronze transition hover:bg-arabic-cream/40 focus:ring-1 focus:ring-arabic-gold cursor-pointer"
                >
                    <Globe className="h-3.5 w-3.5 text-arabic-gold" />
                    <span className="flex items-center">{currentLanguage.flag}</span>
                    <span className="hidden md:inline">{currentLanguage.name}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 border-arabic-cream bg-arabic-sand text-arabic-bronze shadow-md rounded-2xl p-1">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl cursor-pointer hover:bg-arabic-cream/40 focus:bg-arabic-cream/40 ${
                            lang.code === locale ? 'bg-arabic-cream/60 text-arabic-bronze font-extrabold border-l-2 border-arabic-gold' : ''
                        }`}
                    >
                        <span className="flex items-center">{lang.flag}</span>
                        <span>{lang.name}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
