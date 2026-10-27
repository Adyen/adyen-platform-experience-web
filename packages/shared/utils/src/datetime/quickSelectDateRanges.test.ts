import { describe, expect, test } from 'vitest';
import { createQuickSelectRanges, quickSelectDateRanges } from './quickSelectDateRanges';

describe('createQuickSelectRanges', () => {
    test('uses the supplied domain translation key prefix', () => {
        const getLabel = (key: string) => key;

        const ranges = createQuickSelectRanges(
            { last7Days: quickSelectDateRanges.last7Days },
            'payByLink.filters.types.date.rangeSelect.options.',
            getLabel
        );

        expect(ranges[0]?.label).toBe('payByLink.filters.types.date.rangeSelect.options.last7Days');
    });
});
