import React from 'react';
import { useTranslation } from '@/hooks/use-translation';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    const { locale, direction } = useTranslation();

    React.useEffect(() => {
        document.documentElement.dir = direction;
        document.documentElement.lang = locale;
    }, [locale, direction]);

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            <div dir={direction} className="w-full">
                {children}
            </div>
        </AppLayoutTemplate>
    );
}
