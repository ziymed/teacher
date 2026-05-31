import { Link, usePage, router } from '@inertiajs/react';
import { 
    Menu, Search, Bell, Mail, Maximize2, Minimize, ChevronRight, 
    ChevronDown, Settings, LogOut, Award, Users, BookOpen, 
    Calendar, Sliders, Globe, Activity, FileText, LayoutGrid, X, User
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';

interface BreadcrumbItem {
    title: string;
    href?: string;
}

interface AdminLteLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    metrics?: {
        totalBookings: number;
        completedBookings: number;
        activeStudentsCount: number;
        activeTeachersCount: number;
        totalCertificatesCount: number;
    };
}

export default function AdminLteLayout({ children, breadcrumbs = [], metrics }: AdminLteLayoutProps) {
    const { auth } = usePage<any>().props;
    const user = auth?.user;

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Dropdowns topbar state
    const [isMessagesOpen, setIsMessagesOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    // Handle Fullscreen Toggle
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                setIsFullscreen(true);
            }).catch((err) => {
                console.error("Error enabling fullscreen:", err);
            });
        } else {
            document.exitFullscreen().then(() => {
                setIsFullscreen(false);
            });
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const handleLogout = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(logout().url, {}, {
            onSuccess: () => {
                router.flushAll();
            }
        });
    };

    return (
        <div className="min-h-screen bg-[#f4f6f9] text-[#343a40] font-sans antialiased flex relative overflow-x-hidden">
            
            {/* 1. Left Dark Sidebar (Classic AdminLTE Sidebar styled) */}
            <aside className={`bg-[#343a40] text-[#c2c7d0] transition-all duration-300 ease-in-out z-40 flex flex-col border-r border-[#4b545c]
                ${isSidebarCollapsed ? 'w-0 lg:w-[70px]' : 'w-[250px]'}
                ${isMobileSidebarOpen ? 'translate-x-0 w-[250px]' : '-translate-x-full lg:translate-x-0'}
                fixed lg:sticky top-0 h-screen`}
            >
                {/* Brand Header */}
                <div className="h-[57px] flex items-center px-4.5 border-b border-[#4b545c] bg-[#343a40] shrink-0 overflow-hidden select-none">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#d4af37] flex items-center justify-center text-white shadow-md">
                            <BookOpen className="h-4.5 w-4.5 text-[#343a40] font-black" />
                        </div>
                        {!isSidebarCollapsed && (
                            <span className="font-serif font-black text-white text-base tracking-wide whitespace-nowrap block animate-in fade-in duration-300">
                                Al-Quran <span className="text-[#d4af37]">LTE</span>
                            </span>
                        )}
                    </div>
                </div>

                {/* User Status panel inside Sidebar */}
                {!isSidebarCollapsed && user && (
                    <div className="p-4 border-b border-[#4b545c] flex items-center gap-3.5 select-none shrink-0 animate-in fade-in duration-300">
                        <div className="w-9 h-9 rounded-full bg-[#4b545c] flex items-center justify-center font-bold text-[#c2c7d0] border border-[#6c757d] uppercase shadow-sm">
                            {user.name.substring(0, 2)}
                        </div>
                        <div className="overflow-hidden">
                            <span className="text-sm font-bold text-white block truncate leading-none mb-1">{user.name}</span>
                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse block" /> Online (Admin)
                            </span>
                        </div>
                    </div>
                )}

                {/* Sidebar Search */}
                {!isSidebarCollapsed && (
                    <div className="p-3 shrink-0 select-none animate-in fade-in duration-300">
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                className="w-full bg-[#3f474e] border border-[#56606a] rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#8c949c] focus:outline-none focus:border-[#d4af37] font-semibold"
                            />
                            <Search className="absolute right-2.5 top-2 h-3.5 w-3.5 text-[#8c949c]" />
                        </div>
                    </div>
                )}

                {/* Navigation Menu */}
                <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1.5 scrollbar-thin scrollbar-thumb-[#4b545c]">
                    
                    <div className="text-[10px] font-bold text-[#6c757d] uppercase px-3.5 py-1.5 select-none tracking-widest leading-none">
                        {isSidebarCollapsed ? '✦' : 'Core Applications'}
                    </div>

                    <Link 
                        href="/dashboard"
                        className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-xs font-bold transition duration-150 hover:bg-[#495057] hover:text-white
                            ${usePage().url === '/dashboard' ? 'bg-[#d4af37] text-[#343a40] hover:bg-[#d4af37] hover:text-[#343a40]' : 'text-[#c2c7d0]'}`}
                    >
                        <LayoutGrid className="h-4.5 w-4.5 shrink-0" />
                        {!isSidebarCollapsed && <span>User Home</span>}
                    </Link>

                    <Link 
                        href="/admin/dashboard"
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-bold transition duration-150 hover:bg-[#495057] hover:text-white
                            ${usePage().url.startsWith('/admin') ? 'bg-[#495057] text-white border-l-4 border-[#d4af37]' : 'text-[#c2c7d0]'}`}
                    >
                        <div className="flex items-center gap-3.5">
                            <Sliders className="h-4.5 w-4.5 shrink-0" />
                            {!isSidebarCollapsed && <span>Admin Dashboard</span>}
                        </div>
                        {!isSidebarCollapsed && metrics && (
                            <span className="bg-[#d4af37] text-[#343a40] text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                                {metrics.totalBookings}
                            </span>
                        )}
                    </Link>

                    <a 
                        href="#teachers-registry"
                        className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-bold text-[#c2c7d0] hover:bg-[#495057] hover:text-white transition duration-150"
                    >
                        <div className="flex items-center gap-3.5">
                            <Users className="h-4.5 w-4.5 shrink-0" />
                            {!isSidebarCollapsed && <span>Moroccan Teachers</span>}
                        </div>
                        {!isSidebarCollapsed && metrics && (
                            <span className="bg-emerald-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                                {metrics.activeTeachersCount}
                            </span>
                        )}
                    </a>

                    <a 
                        href="#students-registry"
                        className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-bold text-[#c2c7d0] hover:bg-[#495057] hover:text-white transition duration-150"
                    >
                        <div className="flex items-center gap-3.5">
                            <Users className="h-4.5 w-4.5 shrink-0" />
                            {!isSidebarCollapsed && <span>Active Students</span>}
                        </div>
                        {!isSidebarCollapsed && metrics && (
                            <span className="bg-[#007bff] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                                {metrics.activeStudentsCount}
                            </span>
                        )}
                    </a>

                    <a 
                        href="#certificates-audits"
                        className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-bold text-[#c2c7d0] hover:bg-[#495057] hover:text-white transition duration-150"
                    >
                        <div className="flex items-center gap-3.5">
                            <Award className="h-4.5 w-4.5 shrink-0" />
                            {!isSidebarCollapsed && <span>Awarded Certificates</span>}
                        </div>
                        {!isSidebarCollapsed && metrics && (
                            <span className="bg-[#e0a800] text-[#343a40] text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                                {metrics.totalCertificatesCount}
                            </span>
                        )}
                    </a>

                    <div className="text-[10px] font-bold text-[#6c757d] uppercase px-3.5 py-1.5 pt-4 select-none tracking-widest leading-none">
                        {isSidebarCollapsed ? '✦' : 'Preferences'}
                    </div>

                    <Link 
                        href={edit()}
                        className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-xs font-bold text-[#c2c7d0] hover:bg-[#495057] hover:text-white transition duration-150"
                    >
                        <Settings className="h-4.5 w-4.5 shrink-0" />
                        {!isSidebarCollapsed && <span>Portal Settings</span>}
                    </Link>

                    <form onSubmit={handleLogout}>
                        <button 
                            type="submit" 
                            className="w-full text-left flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-xs font-bold text-[#e74c3c] hover:bg-[#e74c3c]/15 transition duration-150"
                        >
                            <LogOut className="h-4.5 w-4.5 shrink-0" />
                            {!isSidebarCollapsed && <span>Log Out Account</span>}
                        </button>
                    </form>

                </nav>
            </aside>

            {/* Mobile Sidebar Overlay backdrop */}
            {isMobileSidebarOpen && (
                <div 
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                />
            )}

            {/* 2. Right Main Layout Area */}
            <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden relative">
                
                {/* Navbar/Header (Classic AdminLTE Top Nav) */}
                <header className="h-[57px] bg-white border-b border-[#dee2e6] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20 shadow-sm shrink-0 select-none">
                    
                    {/* Left Navbar Tools */}
                    <div className="flex items-center gap-4">
                        {/* Sidebar Toggle Burger Button */}
                        <button 
                            onClick={() => {
                                setIsSidebarCollapsed(!isSidebarCollapsed);
                                setIsMobileSidebarOpen(!isMobileSidebarOpen);
                            }}
                            className="p-2 hover:bg-[#e9ecef] rounded-lg transition text-[#495057]"
                            title="Toggle Sidebar"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        
                        {/* Quick links hidden on mobile */}
                        <div className="hidden sm:flex items-center gap-4 text-xs font-bold text-[#6c757d]">
                            <Link href="/" className="hover:text-[#343a40] transition">Home</Link>
                            <span className="text-[#dee2e6]">|</span>
                            <span className="text-[#343a40] flex items-center gap-1"><Activity className="h-3.5 w-3.5 text-emerald-500" /> AdminLTE 4 Framework</span>
                        </div>
                    </div>

                    {/* Right Navbar Tools */}
                    <div className="flex items-center gap-1.5 lg:gap-3 text-[#495057]">
                        
                        {/* Mock Search Dropdown */}
                        <button className="p-2 hover:bg-[#e9ecef] rounded-lg text-[#495057] transition hidden md:block">
                            <Search className="h-4.5 w-4.5" />
                        </button>

                        {/* Messages Menu Dropdown */}
                        <div className="relative">
                            <button 
                                onClick={() => {
                                    setIsMessagesOpen(!isMessagesOpen);
                                    setIsNotificationsOpen(false);
                                    setIsUserMenuOpen(false);
                                }}
                                className="p-2 hover:bg-[#e9ecef] rounded-lg transition relative"
                            >
                                <Mail className="h-4.5 w-4.5" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-white" />
                            </button>

                            {isMessagesOpen && (
                                <>
                                    <div className="fixed inset-0 z-20" onClick={() => setIsMessagesOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-72 bg-white border border-[#dee2e6] rounded-xl shadow-lg z-30 py-2 text-left animate-in fade-in slide-in-from-top-1 duration-200">
                                        <div className="px-4 py-2 border-b border-[#dee2e6] text-[10px] font-extrabold uppercase tracking-wider text-[#6c757d]">
                                            Incoming Platform Alerts
                                        </div>
                                        <div className="divide-y divide-[#dee2e6] max-h-[220px] overflow-y-auto">
                                            <div className="p-3 hover:bg-[#f8f9fa] transition flex gap-3 text-xs">
                                                <div className="w-8 h-8 rounded-full bg-[#d4af37] text-white flex items-center justify-center font-bold">UM</div>
                                                <div>
                                                    <span className="font-bold text-[#343a40] block">Ustaz Marouane</span>
                                                    <p className="text-[10px] text-[#6c757d] truncate">Created new booking slot on June 1...</p>
                                                    <span className="text-[8px] text-[#8c949c] block mt-1 font-bold">10 mins ago</span>
                                                </div>
                                            </div>
                                            <div className="p-3 hover:bg-[#f8f9fa] transition flex gap-3 text-xs">
                                                <div className="w-8 h-8 rounded-full bg-[#007bff] text-white flex items-center justify-center font-bold">AS</div>
                                                <div>
                                                    <span className="font-bold text-[#343a40] block">Ahmad Syarif</span>
                                                    <p className="text-[10px] text-[#6c757d] truncate">Booked a private Tajweed session...</p>
                                                    <span className="text-[8px] text-[#8c949c] block mt-1 font-bold">1 hour ago</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="px-4 py-2 border-t border-[#dee2e6] text-center">
                                            <a href="#bookings" className="text-[10px] font-bold text-[#d4af37] hover:underline">View all classroom sessions</a>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Notifications Menu Dropdown */}
                        <div className="relative">
                            <button 
                                onClick={() => {
                                    setIsNotificationsOpen(!isNotificationsOpen);
                                    setIsMessagesOpen(false);
                                    setIsUserMenuOpen(false);
                                }}
                                className="p-2 hover:bg-[#e9ecef] rounded-lg transition relative"
                            >
                                <Bell className="h-4.5 w-4.5" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 border border-white" />
                            </button>

                            {isNotificationsOpen && (
                                <>
                                    <div className="fixed inset-0 z-20" onClick={() => setIsNotificationsOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-64 bg-white border border-[#dee2e6] rounded-xl shadow-lg z-30 py-2 text-left animate-in fade-in slide-in-from-top-1 duration-200">
                                        <div className="px-4 py-2 border-b border-[#dee2e6] text-[10px] font-extrabold uppercase tracking-wider text-[#6c757d]">
                                            Platform Notifications
                                        </div>
                                        <div className="p-3 hover:bg-[#f8f9fa] transition flex items-center gap-2.5 text-xs text-[#343a40]">
                                            <Activity className="h-4 w-4 text-emerald-500" />
                                            <div>
                                                <span className="font-semibold block">System status healthy</span>
                                                <span className="text-[8px] text-[#8c949c] block font-bold">Uptime 99.9%</span>
                                            </div>
                                        </div>
                                        <div className="p-3 hover:bg-[#f8f9fa] transition flex items-center gap-2.5 text-xs text-[#343a40]">
                                            <FileText className="h-4 w-4 text-amber-500" />
                                            <div>
                                                <span className="font-semibold block">3 New Certificates Pending</span>
                                                <span className="text-[8px] text-[#8c949c] block font-bold">Awaiting teacher sign-off</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Fullscreen Toggle */}
                        <button 
                            onClick={toggleFullscreen}
                            className="p-2 hover:bg-[#e9ecef] rounded-lg transition"
                            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
                        >
                            <Maximize2 className="h-4.5 w-4.5" />
                        </button>

                        <span className="w-px h-6 bg-[#dee2e6] block my-auto" />

                        {/* Real User Action Dropdown */}
                        <div className="relative">
                            <button 
                                onClick={() => {
                                    setIsUserMenuOpen(!isUserMenuOpen);
                                    setIsMessagesOpen(false);
                                    setIsNotificationsOpen(false);
                                }}
                                className="flex items-center gap-2 p-1 pl-2.5 pr-1.5 hover:bg-[#e9ecef] rounded-lg transition"
                            >
                                <div className="w-7 h-7 rounded-full bg-[#495057] flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm">
                                    {user ? user.name.substring(0, 2) : 'AD'}
                                </div>
                                <ChevronDown className="h-3.5 w-3.5 text-[#6c757d]" />
                            </button>

                            {isUserMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-20" onClick={() => setIsUserMenuOpen(false)} />
                                    <div className="absolute right-0 mt-2 w-56 bg-white border border-[#dee2e6] rounded-xl shadow-lg z-30 py-2 text-left animate-in fade-in slide-in-from-top-1 duration-200">
                                        {user && (
                                            <div className="px-4 py-3 border-b border-[#dee2e6] bg-[#f8f9fa]">
                                                <span className="font-bold text-sm text-[#343a40] block">{user.name}</span>
                                                <span className="text-[10px] text-[#6c757d] font-mono block truncate mt-0.5">{user.email}</span>
                                            </div>
                                        )}
                                        <div className="py-1">
                                            <Link 
                                                href={edit()}
                                                className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-[#495057] hover:bg-[#f8f9fa] transition"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                <Settings className="h-4 w-4 text-[#8c949c]" /> Portal Settings
                                            </Link>
                                            <Link 
                                                href="/dashboard"
                                                className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-[#495057] hover:bg-[#f8f9fa] transition"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                <LayoutGrid className="h-4 w-4 text-[#8c949c]" /> User Panel
                                            </Link>
                                        </div>
                                        <DropdownMenuSeparator className="border-t border-[#dee2e6] my-1" />
                                        <div className="py-1">
                                            <form onSubmit={handleLogout}>
                                                <button 
                                                    type="submit" 
                                                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-[#e74c3c] hover:bg-rose-50 transition text-left"
                                                >
                                                    <LogOut className="h-4 w-4 shrink-0" /> Log Out
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                    </div>
                </header>

                {/* 3. Main Dashboard Wrapper */}
                <main className="flex-1 p-4 lg:p-6 space-y-6">
                    
                    {/* Content Header (Classic AdminLTE Content Header) */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#dee2e6] pb-4 select-none">
                        <div>
                            <h2 className="text-xl font-black text-[#343a40]">Admin Control Dashboard</h2>
                            <p className="text-[11px] text-[#6c757d] font-bold uppercase tracking-wider mt-0.5">AdminLTE 4 Template Layout</p>
                        </div>
                        {/* Breadcrumbs on the right */}
                        <div className="flex items-center gap-1.5 text-xs text-[#6c757d] font-bold">
                            <Link href="/dashboard" className="hover:text-[#d4af37] transition">Home</Link>
                            {breadcrumbs.map((crumb, idx) => (
                                <React.Fragment key={idx}>
                                    <ChevronRight className="h-3 w-3 text-[#dee2e6]" />
                                    {crumb.href ? (
                                        <Link href={crumb.href} className="hover:text-[#d4af37] transition">{crumb.title}</Link>
                                    ) : (
                                        <span className="text-[#343a40]">{crumb.title}</span>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* Dashboard Inner Children Content */}
                    <div className="animate-in fade-in duration-300">
                        {children}
                    </div>

                </main>

                {/* 4. Footer (Classic AdminLTE Footer) */}
                <footer className="h-[52px] bg-white border-t border-[#dee2e6] px-6 flex items-center justify-between text-[11px] text-[#6c757d] font-bold select-none shrink-0">
                    <div>
                        Copyright &copy; 2026 <a href="/" className="text-[#d4af37] hover:underline font-extrabold">Al-Quran Academy</a>. All rights reserved.
                    </div>
                    <div className="hidden sm:block">
                        <b>Version</b> 4.0.0-Laravel (Tailwind CSS)
                    </div>
                </footer>

            </div>
        </div>
    );
}
