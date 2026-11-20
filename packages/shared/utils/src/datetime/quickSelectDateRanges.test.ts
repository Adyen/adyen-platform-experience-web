import { describe, expect, test } from 'vitest';
import { createQuickSelectRanges, quickSelectDateRanges } from './quickSelectDateRanges';

describe('createQuickSelectRanges', () => {
    test('uses the supplied domain translation key prefix', () => {
        const getLabel = (key: string) => key;

        const ranges = createQuickSelectRanges({ last7Days: quickSelectDateRanges.last7Days }, 'payByLink.overview.filters.date.', getLabel);

        expect(ranges[0]?.label).toBe('payByLink.overview.filters.date.last7Days');
    });
});
