import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Calendar,
    Award,
    LayoutGrid,
    Users,
    Settings,
    GraduationCap,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useTranslation } from '@/hooks/use-translation';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { t, direction } = useTranslation();
    const { auth } = usePage<any>().props;
    const user = auth?.user;

    // Define main nav items dynamically based on the role
    const getNavItems = (): NavItem[] => {
        const baseItems: NavItem[] = [
            {
                title: t('Dashboard'),
                href: dashboard(),
                icon: LayoutGrid,
            },
        ];

        if (!user) {
            return baseItems;
        }

        if (user.role === 'admin') {
            return [
                ...baseItems,
                {
                    title: t('Programs'),
                    href: '/admin/programs',
                    icon: BookOpen,
                },
                {
                    title: t('Teachers'),
                    href: '/admin/teachers',
                    icon: Users,
                },
                {
                    title: t('Students'),
                    href: '/admin/students',
                    icon: GraduationCap,
                },
            ];
        }

        if (user.role === 'teacher') {
            return [
                ...baseItems,
                {
                    title: t('Schedule & Slots'),
                    href: '/',
                    icon: Calendar,
                },
            ];
        }

        // Student Nav Items
        return [
            ...baseItems,
            {
                title: t('Book a Session'),
                href: '/student/dashboard#book-session',
                icon: Calendar,
            },
        ];
    };

    const footerNavItems: NavItem[] = [
        {
            title: t('Learning Portal'),
            href: '/',
            icon: BookOpen,
        },
    ];

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            side={direction === 'rtl' ? 'right' : 'left'}
        >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={getNavItems()} />
            </SidebarContent>

            <SidebarFooter>
                <div className="flex justify-center px-2 py-1 group-data-[collapsible=icon]:hidden">
                    <LanguageSwitcher />
                </div>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
