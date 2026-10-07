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

    test('applies measured standard-column widths while preserving configured minimums and consumer flex overrides', () => {
        const measuredWidths = ref({ createdAt: 200, amount: 92 });
        const { columns } = useTableColumns({
            fields: FIELDS,
            customColumns: () => [{ key: 'createdAt', flex: 2 }],
            fieldsKeys: { createdAt: 'createdAt', amount: 'amount' },
            columnConfig: () => ({ createdAt: { flex: 1, minWidth: 120 }, amount: { flex: 1, minWidth: 120, numeric: true } }),
            customColumnWidths: () => measuredWidths.value,
        });

        expect(columns.value).toEqual([
            { field: 'createdAt', label: 'createdAt', flex: 2, minWidth: 200 },
            { field: 'amount', label: 'amount', flex: 1, minWidth: 120, numeric: true },
        ]);

        measuredWidths.value = { createdAt: 150, amount: 240 };
        expect(columns.value.map(column => column.minWidth)).toEqual([150, 240]);
    });

    test('fills available space for measured standard and custom columns without explicit sizing', () => {
        const { columns } = useTableColumns({
            fields: FIELDS,
            customColumns: () => [{ key: 'reference' }],
            fieldsKeys: { createdAt: 'createdAt' },
            customColumnWidths: () => ({ createdAt: 200, reference: 150 }),
        });

        expect(columns.value).toEqual([
            { field: 'createdAt', label: 'createdAt', minWidth: 200, flex: 1 },
            { field: 'reference', label: 'reference', minWidth: 150, flex: 1 },
        ]);
    });

    test('uses only measured minimum widths when no fixed minimum is configured', () => {
        const measuredWidths = ref<Record<string, number>>({});
        const { columns } = useTableColumns({
            fields: FIELDS,
            customColumns: () => [{ key: 'reference' }],
            fieldsKeys: { createdAt: 'createdAt', amount: 'amount' },
            columnConfig: () => ({ createdAt: { flex: 1 }, amount: { flex: 1, numeric: true } }),
            customColumnDefaults: () => ({ flex: 1 }),
            customColumnWidths: () => measuredWidths.value,
        });

        expect(columns.value.map(column => column.minWidth)).toEqual([undefined, undefined, undefined]);

        measuredWidths.value = { createdAt: 84, amount: 60, reference: 40 };
        expect(columns.value.map(column => column.minWidth)).toEqual([84, 60, 40]);
        expect(columns.value.every(column => column.flex === 1 && column.autoWidth === undefined)).toBe(true);

        measuredWidths.value = { createdAt: 72, amount: 48, reference: 32 };
        expect(columns.value.map(column => column.minWidth)).toEqual([72, 48, 32]);
    });

    test('widens custom columns to fit their measured content without shrinking below the default', () => {
        const { columns } = useTableColumns({
            fields: FIELDS,
            customColumns: () => [{ key: 'reference' }, { key: 'store' }],
            fieldsKeys: {},
            customColumnDefaults: () => ({ minWidth: 120 }),
            customColumnWidths: () => ({ reference: 200, store: 92 }),
        });

        expect(columns.value).toEqual([
            { field: 'reference', label: 'reference', minWidth: 200, flex: 1 },
            { field: 'store', label: 'store', minWidth: 120, flex: 1 },
        ]);
    });

    test('ignores inherited properties when resolving measured widths of prototype-named custom fields', () => {
        const { columns } = useTableColumns({
            fields: FIELDS,
            customColumns: () => [{ key: 'constructor' }, { key: 'toString' }],
            fieldsKeys: {},
            customColumnDefaults: () => ({ minWidth: 120 }),
            customColumnWidths: () => ({}),
        });

        expect(columns.value).toEqual([
            { field: 'constructor', label: 'constructor', minWidth: 120, flex: 1 },
            { field: 'toString', label: 'toString', minWidth: 120, flex: 1 },
        ]);
    });

    test('ignores zero measured widths so columns keep their configured or default minimum widths', () => {
        const { columns } = useTableColumns({
            fields: FIELDS,
            customColumns: () => [{ key: 'reference' }],
            fieldsKeys: { createdAt: 'createdAt', amount: 'amount' },
            columnConfig: () => ({ createdAt: { flex: 1, minWidth: 120 }, amount: { flex: 1 } }),
            customColumnWidths: () => ({ createdAt: 0, amount: 0, reference: 0 }),
        });

        expect(columns.value.map(column => column.minWidth)).toEqual([120, undefined, undefined]);
    });
});
