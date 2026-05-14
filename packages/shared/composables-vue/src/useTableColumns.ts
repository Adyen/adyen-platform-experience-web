import { computed } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import type { CustomColumn } from '@integration-components/types';
import type { StringWithAutocompleteOptions } from '@integration-components/utils/types';

/**
 * Minimal column descriptor compatible with BentoDataGrid's BentoColumn shape.
 * Kept local to avoid a hard dependency on `@adyen/bento-vue3` in this shared package.
 */
export interface TableColumn {
    field: string;
    label: string;
    autoWidth: boolean;
}

export interface UseTableColumnsOptions<T extends string> {
    /**
     * All known standard field names for this table.
     * Fields present here but absent from `fieldsKeys` are treated as "reserved"
     * (blocked from custom-column reuse) but not rendered.
     */
    fields: Readonly<T[]>;
    /** Reactive getter for consumer-provided custom columns. */
    customColumns: () => CustomColumn<StringWithAutocompleteOptions<T>>[] | undefined;
    /**
     * Maps each standard field key to its i18n translation key.
     * Only fields with an entry here are rendered as columns.
     */
    fieldsKeys: { [k in T]?: string };
    /**
     * Optional resolver for the label of non-standard (consumer-added) custom columns.
     * Receives the raw field key; defaults to returning the key itself when omitted.
     */
    resolveCustomColumnLabel?: (key: string) => string;
}

/**
 * Builds a reactive `BentoColumn`-compatible column list from a fixed set of
 * standard fields and optional consumer-supplied custom columns, handling
 * hidden-column filtering and i18n label resolution.
 */
export function useTableColumns<T extends string>({ fields, customColumns, fieldsKeys, resolveCustomColumnLabel }: UseTableColumnsOptions<T>) {
    const { i18n } = useCoreContext();

    const standardFields = new Set<string>(fields);

    /** Non-standard, non-hidden custom field keys contributed by the consumer. */
    const customFieldKeys = computed<string[]>(() =>
        (customColumns() ?? [])
            .filter(c => !!c && c.visibility !== 'hidden')
            .map(c => (typeof c?.key === 'string' ? c.key.trim() : ''))
            .filter((k): k is string => !!k && !standardFields.has(k))
    );

    const hasCustomColumn = computed(() => customFieldKeys.value.length > 0);
    const columns = computed<TableColumn[]>(() => {
        const currentCustomColumns = customColumns() ?? [];

        const customMap = new Map(currentCustomColumns.flatMap(c => (c?.key ? [[c.key, c] as const] : [])));

        const cols: TableColumn[] = [];

        // Standard fields — render only those mapped in fieldsKeys, respecting hidden overrides.
        for (const field of fields) {
            const translationKey = fieldsKeys[field];
            if (!translationKey) continue;
            const override = customMap.get(field);
            if (override?.visibility === 'hidden') continue;
            cols.push({
                field,
                label: i18n.get(translationKey as any),
                autoWidth: true,
            });
        }

        // Non-standard custom columns — added after standard fields.
        for (const column of currentCustomColumns) {
            if (!column || typeof column.key !== 'string') continue;
            const key = column.key.trim();
            if (!key || standardFields.has(key)) continue;
            if (column.visibility === 'hidden') continue;
            cols.push({
                field: key,
                label: resolveCustomColumnLabel ? resolveCustomColumnLabel(key) : key,
                autoWidth: true,
            });
        }

        return cols;
    });

    return { columns, customFieldKeys, hasCustomColumn } as const;
}

export default useTableColumns;
