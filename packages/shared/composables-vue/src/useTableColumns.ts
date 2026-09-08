import { computed } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import type { CustomColumn } from '@integration-components/types';
import { hasCustomField } from '@integration-components/utils';
import type { StringWithAutocompleteOptions } from '@integration-components/utils/types';

/**
 * Minimal column descriptor compatible with BentoDataGrid's BentoColumn shape.
 * Kept local to avoid a hard dependency on `@adyen/bento-vue3` in this shared package.
 */
type BaseTableColumn = {
    field: string;
    label: string;
    autoWidth?: boolean;
    flex?: number;
    minWidth?: number;
    numeric?: boolean;
    visible?: boolean;
};

type BaseTableColumnOptions = Omit<BaseTableColumn, 'field' | 'label'>;

export type TableColumn<TExtra extends object = object> = BaseTableColumn & Partial<TExtra>;
export type TableColumnOptions<TExtra extends object = object> = BaseTableColumnOptions & TExtra;
type CustomTableColumnOptions<TExtra extends object> = BaseTableColumnOptions & Partial<TExtra>;

type NormalizedCustomColumn = {
    key: string;
    flex?: number;
    align?: 'center' | 'left' | 'right';
    visibility?: 'hidden' | 'visible';
};

function addAutoWidth<TExtra extends object>(column: TableColumn<TExtra>): TableColumn<TExtra> {
    if (column.flex === undefined && column.autoWidth === undefined) {
        column.autoWidth = true;
    }
    return column;
}

function createStandardColumns<T extends string, TExtra extends object>(
    fields: Readonly<T[]>,
    fieldsKeys: { [k in T]?: string },
    customColumns: ReadonlyMap<string, NormalizedCustomColumn>,
    configuredColumns: Partial<Record<T, TableColumnOptions<TExtra>>>,
    getLabel: (key: string) => string,
    resolveLabel?: (field: T, defaultLabel: string) => string
): TableColumn<TExtra>[] {
    const columns: TableColumn<TExtra>[] = [];

    for (const field of fields) {
        const translationKey = fieldsKeys[field];
        if (!translationKey) continue;

        const override = customColumns.get(field);
        const defaultLabel = getLabel(translationKey);

        columns.push(
            addAutoWidth({
                field,
                label: resolveLabel?.(field, defaultLabel) ?? defaultLabel,
                ...configuredColumns[field],
                ...(override?.visibility === 'hidden' ? { visible: false } : {}),
                ...(override?.flex !== undefined ? { flex: override.flex } : {}),
                ...(override?.align === 'right' ? { numeric: true } : {}),
            } as TableColumn<TExtra>)
        );
    }

    return columns;
}

function createCustomColumns<TExtra extends object>(
    customColumns: NormalizedCustomColumn[],
    standardFields: ReadonlySet<string>,
    defaults: CustomTableColumnOptions<TExtra> | undefined,
    resolveLabel?: (key: string) => string
): TableColumn<TExtra>[] {
    const columns: TableColumn<TExtra>[] = [];

    for (const column of customColumns) {
        if (standardFields.has(column.key) || column.visibility === 'hidden') continue;

        columns.push(
            addAutoWidth({
                field: column.key,
                label: resolveLabel ? resolveLabel(column.key) : column.key,
                ...defaults,
                ...(column.flex !== undefined ? { flex: column.flex } : {}),
                ...(column.align === 'right' ? { numeric: true } : {}),
            } as TableColumn<TExtra>)
        );
    }

    return columns;
}

export interface UseTableColumnsOptions<T extends string, TExtra extends object = object> {
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
    /** Optional defaults for standard fields, including responsive visibility. */
    columnConfig?: () => Partial<Record<T, TableColumnOptions<TExtra>>>;
    /** Optional defaults applied to non-standard custom columns. */
    customColumnDefaults?: () => CustomTableColumnOptions<TExtra>;
    /** Optional resolver for labels of standard fields. */
    resolveStandardColumnLabel?: (field: T, defaultLabel: string) => string;
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
export function useTableColumns<T extends string, TExtra extends object = object>({
    fields,
    customColumns,
    fieldsKeys,
    columnConfig,
    customColumnDefaults,
    resolveStandardColumnLabel,
    resolveCustomColumnLabel,
}: UseTableColumnsOptions<T, TExtra>) {
    const { i18n } = useCoreContext();
    const standardFields = new Set<string>(fields);

    const normalizedCustomColumns = computed(() => {
        const columnsByKey = new Map<string, NormalizedCustomColumn>();

        for (const column of customColumns() ?? []) {
            if (!column || typeof column.key !== 'string') continue;
            const key = column.key.trim();
            if (key) columnsByKey.set(key, { key, flex: column.flex, align: column.align, visibility: column.visibility });
        }

        return Array.from(columnsByKey.values());
    });

    /** Non-standard, non-hidden custom field keys contributed by the consumer. */
    const customFieldKeys = computed<string[]>(() =>
        normalizedCustomColumns.value.filter(column => column.visibility !== 'hidden' && !standardFields.has(column.key)).map(column => column.key)
    );

    const hasCustomColumn = computed(() => hasCustomField(customColumns(), fields, { ignoreHiddenFields: true }));

    const columns = computed<TableColumn<TExtra>[]>(() => {
        const customMap = new Map(normalizedCustomColumns.value.map(column => [column.key, column] as const));
        const configuredColumns: Partial<Record<T, TableColumnOptions<TExtra>>> = columnConfig?.() ?? {};
        const configuredCustomColumnDefaults = customColumnDefaults?.();

        return [
            ...createStandardColumns(
                fields,
                fieldsKeys,
                customMap,
                configuredColumns,
                translationKey => i18n.get(translationKey as Parameters<typeof i18n.get>[0]),
                resolveStandardColumnLabel
            ),
            ...createCustomColumns(normalizedCustomColumns.value, standardFields, configuredCustomColumnDefaults, resolveCustomColumnLabel),
        ];
    });

    return { columns, customFieldKeys, hasCustomColumn } as const;
}

export default useTableColumns;
