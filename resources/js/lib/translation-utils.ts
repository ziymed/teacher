/**
 * Resolves a dynamic translation field (object or legacy string) to the appropriate locale.
 */
export function getTranslation(
    field: string | Record<string, string> | null | undefined,
    locale: string = 'id',
): string {
    if (!field) {
        return '';
    }

    if (typeof field === 'string') {
        // Attempt to parse if it is double-serialized json
        if (field.startsWith('{')) {
            try {
                const parsed = JSON.parse(field);
                return parsed[locale] || parsed['id'] || parsed['en'] || Object.values(parsed)[0] || '';
            } catch (e) {
                // Return original string if parse fails
            }
        }
        return field;
    }

    if (typeof field === 'object') {
        return field[locale] || field['id'] || field['en'] || Object.values(field)[0] || '';
    }

    return '';
}

/**
 * Resolves a dynamic translation list (array of strings or localized object containing arrays) to the appropriate locale.
 */
export function getTranslationList(
    field: string[] | Record<string, string[]> | null | undefined,
    locale: string = 'id',
): string[] {
    if (!field) {
        return [];
    }

    if (Array.isArray(field)) {
        return field;
    }

    if (typeof field === 'object') {
        return field[locale] || field['id'] || field['en'] || Object.values(field)[0] || [];
    }

    return [];
}
