import { usePage } from '@inertiajs/react';

export function useTranslation() {
    const { props } = usePage<any>();
    const translations = props.translations || {};
    const locale = props.locale || 'id';
    const direction = props.locale_direction || 'ltr';

    const t = (key: string, replacements?: Record<string, string>): string => {
        let translation = translations[key] ?? key;
        if (replacements) {
            Object.entries(replacements).forEach(([k, v]) => {
                translation = translation.replace(`:${k}`, v);
            });
        }
        return translation;
    };

    return { t, locale, direction };
}
