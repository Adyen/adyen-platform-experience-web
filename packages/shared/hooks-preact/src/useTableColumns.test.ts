/**
 * @vitest-environment jsdom
 */
import { renderHook } from '@testing-library/preact';
import { describe, expect, test, vi } from 'vitest';
import { useTableColumns } from './useTableColumns';

vi.mock('@integration-components/core/preact', () => ({
    useCoreContext: () => ({
        componentRef: () => null,
        i18n: { get: (key: string) => key },
    }),
}));

describe('useTableColumns', () => {
    test('preserves a responsive visibility configuration when a consumer customizes the same standard column', () => {
        const { result } = renderHook(() =>
            useTableColumns({
                fields: ['createdAt', 'reportType'] as const,
                customColumns: [{ key: 'createdAt' }],
                fieldsKeys: {
                    createdAt: 'reports.overview.list.fields.createdAt',
                    reportType: 'reports.overview.list.fields.reportType',
                },
                columnConfig: {
                    createdAt: { visible: false },
                    reportType: { visible: true },
                },
            })
        );

        expect(result.current).toEqual([
            { key: 'createdAt', label: 'reports.overview.list.fields.createdAt', visible: false, position: undefined },
            { key: 'reportType', label: 'reports.overview.list.fields.reportType', visible: true, position: undefined },
        ]);
    });
});
