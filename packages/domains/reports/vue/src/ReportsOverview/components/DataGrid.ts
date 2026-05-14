// TODO: Move this component to the shared internal components library once the
// project is migrated to the nx workspace structure.
import { defineComponent, h, type PropType } from 'vue';
import { BentoDataGrid, BentoButton, BentoLink } from '@adyen/bento-vue3';
import type { BentoColumn, BentoDatagridDataItem, BentoDataGridRowActionsProp } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import { useCustomDataCells } from '@integration-components/composables-vue';

export const DataGrid = defineComponent({
    name: 'DataGrid',

    props: {
        columns: { type: Array as PropType<BentoColumn[]>, required: true },
        data: { type: Array as PropType<BentoDatagridDataItem[]>, required: true },
        loading: { type: Boolean, default: false },
        pagination: { type: Object as PropType<Record<string, any> | undefined>, default: undefined },
        emptyState: { type: Object as PropType<{ title: string; description: string } | undefined>, default: undefined },
        rowActions: { type: [Function, Array] as PropType<BentoDataGridRowActionsProp | undefined>, default: undefined },
        customFieldKeys: { type: Array as PropType<string[]>, default: () => [] },
    },

    emits: ['navigate', 'items-page'],

    setup(props, { emit }) {
        const { i18n } = useCoreContext();
        const { isCustomDataObject, isIconType, isButtonType, isLinkType } = useCustomDataCells();

        function formatDate(dateStr: string): string {
            return i18n.date(dateStr, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                timeZone: 'UTC',
            });
        }

        function renderCustomCell(cellValue: unknown) {
            const data = cellValue;
            const { value, type } = isCustomDataObject(data) ? data : { value: data, type: 'text' as const };

            if (isIconType(data) && data.config?.src) {
                const alt = data.config.alt != null ? data.config.alt : data.value;
                return h('div', { class: ['adyen-pe-data-grid__icon-cell', data.config.className] }, [
                    h('img', { src: data.config.src, alt }),
                    String(value).trim() ? h('span', {}, String(value)) : null,
                ]);
            }
            if (type === 'text') {
                return h('span', { class: isCustomDataObject(data) ? (data as any).config?.className : undefined }, String(value ?? ''));
            }
            if (isButtonType(data) && data.config) {
                return h(
                    BentoButton,
                    {
                        variant: 'secondary',
                        class: data.config.className,
                        onClick: (e: Event) => {
                            e.stopPropagation();
                            data.config.action();
                        },
                    },
                    () => String(value)
                );
            }
            if (isLinkType(data) && data.config) {
                return h(BentoLink, { to: data.config.href, external: true, class: data.config.className }, () => String(value));
            }
            return h('span', {}, String(value ?? ''));
        }

        return () => {
            const customSlots: Record<string, (slotProps: { item: BentoDatagridDataItem }) => any> = {};
            for (const key of props.customFieldKeys) {
                const fieldKey = key;
                customSlots[`item-${fieldKey}`] = ({ item }) => renderCustomCell(item[fieldKey]);
            }

            return h(
                BentoDataGrid as any,
                {
                    outline: true,
                    columns: props.columns,
                    data: props.data,
                    loading: props.loading,
                    pagination: props.pagination,
                    emptyState: props.emptyState,
                    rowActions: props.rowActions,
                    hasResizableColumns: false,
                    allowColumnDragAndDrop: false,
                    onNavigate: (page: number) => emit('navigate', page),
                    'onItems-page': (size: number) => emit('items-page', size),
                },
                {
                    'item-createdAt': ({ item }: { item: BentoDatagridDataItem }) =>
                        h('time', { datetime: item.createdAt }, formatDate(item.createdAt as string)),
                    'item-reportType': ({ item }: { item: BentoDatagridDataItem }) => item.reportType as string,
                    ...customSlots,
                }
            );
        };
    },
});
