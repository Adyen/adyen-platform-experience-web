import { describe, expect, test, vi } from 'vitest';
import { ref } from 'vue';
import type { CustomColumn } from '@integration-components/types';
import type { StringWithAutocompleteOptions } from '@integration-components/utils/types';
import { useTableColumns } from './useTableColumns';

vi.mock('@integration-components/core/vue', () => ({
    useCoreContext: () => ({
        i18n: {
            get: (key: string) => key,
        },
    }),
}));

const FIELDS = ['createdAt', 'amount'] as const;
type Field = (typeof FIELDS)[number];

describe('useTableColumns', () => {
    test('normalizes custom columns and applies their overrides to standard columns', () => {
        const customColumns = ref<CustomColumn<StringWithAutocompleteOptions<Field>>[]>([
            { key: ' amount ', visibility: 'hidden' },
            { key: ' summary ', flex: 2, align: 'right' },
            { key: 'summary', flex: 3, align: 'left' },
        ]);
        const { columns, customFieldKeys, hasCustomColumn } = useTableColumns({
            fields: FIELDS,
            customColumns: () => customColumns.value,
            fieldsKeys: {
                createdAt: 'createdAt',
                amount: 'amount',
            },
            columnConfig: () => ({
                createdAt: { flex: 1, visible: true },
                amount: { flex: 1, numeric: true, visible: true },
            }),
        });

        expect(hasCustomColumn.value).toBe(true);
        expect(customFieldKeys.value).toEqual(['summary']);
        expect(columns.value).toEqual([
            { field: 'createdAt', label: 'createdAt', flex: 1, visible: true },
            { field: 'amount', label: 'amount', flex: 1, numeric: true, visible: false },
            { field: 'summary', label: 'summary', flex: 3 },
        ]);
    });

    test('preserves auto-width defaults and uses the supplied label resolvers', () => {
        const { columns } = useTableColumns({
            fields: FIELDS,
            customColumns: () => [{ key: 'merchantReference' }],
            fieldsKeys: {
                createdAt: 'createdAt',
            },
            resolveStandardColumnLabel: (_field, label) => `standard:${label}`,
            resolveCustomColumnLabel: key => `custom:${key}`,
        });

        expect(columns.value).toEqual([
            { field: 'createdAt', label: 'standard:createdAt', autoWidth: true },
            { field: 'merchantReference', label: 'custom:merchantReference', autoWidth: true },
        ]);
    });

    test('retains inferred consumer-specific metadata and custom column defaults', () => {
        const { columns } = useTableColumns({
            fields: FIELDS,
            customColumns: () => [{ key: 'merchantReference' }],
            fieldsKeys: {
                createdAt: 'createdAt',
            },
            columnConfig: () => ({
                createdAt: { overflow: 'wrap' as const },
            }),
            customColumnDefaults: () => ({ flex: 1, minWidth: 120 }),
        });

        expect(columns.value).toEqual([
            { field: 'createdAt', label: 'createdAt', overflow: 'wrap', autoWidth: true },
            { field: 'merchantReference', label: 'merchantReference', flex: 1, minWidth: 120 },
        ]);
    });
});
