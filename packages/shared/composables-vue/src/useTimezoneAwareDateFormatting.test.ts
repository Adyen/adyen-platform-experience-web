import { describe, expect, test, vi } from 'vitest';
import { ref } from 'vue';
import useTimezoneAwareDateFormatting from './useTimezoneAwareDateFormatting';

vi.mock('@integration-components/core/vue', () => ({
    useCoreContext: () => ({
        i18n: {
            timezone: 'UTC',
            date: (date: string | number | Date, options?: Intl.DateTimeFormatOptions) =>
                new Intl.DateTimeFormat('en-US', options).format(new Date(date)),
        },
    }),
}));

describe('useTimezoneAwareDateFormatting', () => {
    test('updates formatting when the provided timezone changes', () => {
        const timezone = ref('UTC');
        const { dateFormat } = useTimezoneAwareDateFormatting(() => timezone.value);
        const options = { hour: '2-digit', minute: '2-digit', hour12: false } satisfies Intl.DateTimeFormatOptions;

        expect(dateFormat('2022-08-29T12:47:03.216Z', options)).toBe('12:47');

        timezone.value = 'America/Sao_Paulo';
        expect(dateFormat('2022-08-29T12:47:03.216Z', options)).toBe('09:47');
    });
});
