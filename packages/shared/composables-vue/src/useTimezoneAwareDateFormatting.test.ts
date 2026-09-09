import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ref } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import Localization from '@integration-components/core/Localization';
import useTimezoneAwareDateFormatting from './useTimezoneAwareDateFormatting';

vi.mock('@integration-components/core/vue', () => ({
    useCoreContext: vi.fn(),
}));

describe('useTimezoneAwareDateFormatting', () => {
    beforeEach(() => {
        const localization = new Localization('en-US');
        localization.timezone = 'UTC';
        vi.mocked(useCoreContext).mockReturnValue({
            i18n: localization.i18n,
        } as ReturnType<typeof useCoreContext>);
    });

    test('updates formatting when the provided timezone changes', () => {
        const timezone = ref('UTC');
        const { dateFormat } = useTimezoneAwareDateFormatting(() => timezone.value);
        const options = { hour: '2-digit', minute: '2-digit', hour12: false } satisfies Intl.DateTimeFormatOptions;

        expect(dateFormat('2022-08-29T12:47:03.216Z', options)).toBe('08/29/2022, 12:47');

        timezone.value = 'America/Sao_Paulo';
        expect(dateFormat('2022-08-29T12:47:03.216Z', options)).toBe('08/29/2022, 09:47');
    });

    test.each([
        ['America/New_York', '07/08/2023', 'Jul 08, 2023, 12:10:45', '12/25/2023', 'Dec 25, 2023, 11:10:45'],
        ['Europe/London', '07/08/2023', 'Jul 08, 2023, 17:10:45', '12/25/2023', 'Dec 25, 2023, 16:10:45'],
        ['Asia/Tokyo', '07/09/2023', 'Jul 09, 2023, 01:10:45', '12/26/2023', 'Dec 26, 2023, 01:10:45'],
        ['America/Los_Angeles', '07/08/2023', 'Jul 08, 2023, 09:10:45', '12/25/2023', 'Dec 25, 2023, 08:10:45'],
    ])('formats DST and non-DST dates in %s', (timezone, summerDate, summerFullDate, winterDate, winterFullDate) => {
        const { dateFormat, fullDateFormat } = useTimezoneAwareDateFormatting(timezone);
        const summerTimestamp = 1688832645123;
        const winterTimestamp = 1703520645123;

        expect(dateFormat(summerTimestamp)).toBe(summerDate);
        expect(fullDateFormat(summerTimestamp)).toBe(summerFullDate);
        expect(dateFormat(winterTimestamp)).toBe(winterDate);
        expect(fullDateFormat(winterTimestamp)).toBe(winterFullDate);
    });

    test('falls back to the configured timezone for missing or invalid timezones', () => {
        const timestamp = 1703520645123;

        expect(useTimezoneAwareDateFormatting().fullDateFormat(timestamp)).toBe('Dec 25, 2023, 16:10:45');
        expect(useTimezoneAwareDateFormatting('Invalid/Timezone').fullDateFormat(timestamp)).toBe('Dec 25, 2023, 16:10:45');
    });

    test('handles valid and invalid date input forms', () => {
        const { dateFormat, fullDateFormat } = useTimezoneAwareDateFormatting('Asia/Tokyo');
        const timestamp = 1703520645123;

        expect(dateFormat(timestamp)).toBe('12/26/2023');
        expect(dateFormat(new Date(timestamp))).toBe('12/26/2023');
        expect(dateFormat(new Date(timestamp).toISOString())).toBe('12/26/2023');
        expect(dateFormat(new Date('unknown'))).toBe('Invalid Date');
        expect(fullDateFormat(Number.NaN)).toBe('Invalid Date');
    });
});
