import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <div className="flex h-12 items-center">
            <AppLogoIcon className="block h-10 w-auto text-[#D4AF37] group-data-[collapsible=icon]:hidden" />
            <img
                src="/apple-touch-icon.png"
                alt="Tahseen Logo"
                className="hidden h-8 w-8 object-contain group-data-[collapsible=icon]:block"
            />
        </div>
    );
}
