// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { computed, createApp, nextTick, type App } from 'vue';
import { useConfigContext, useCoreContext } from '@integration-components/core/vue';
import { containerQueries, useResponsiveContainer } from '@integration-components/composables-vue';
import type { IDisputeListItem, IDisputeStatusGroup } from '@integration-components/types/api/models/disputes';
import { FIELD_KEYS } from '../constants';
import DisputesTable from './DisputesTable.vue';

const PAGINATION_LABEL = 'Pagination';
const PAGE_SIZE_LABEL = 'Results per page';
const LIMIT_OPTIONS = [10, 20, 50] as const;
const DUE_DATE = '2024-01-15T00:00:00.000Z';

vi.mock('@adyen/bento-vue3', async () => {
    const { defineComponent, h } = await import('vue');
    return {
        BentoPaymentMethod: () => null,
        BentoTag: () => null,
        BentoTooltipDirective: {},
        BentoTypography: () => null,
        BentoDataGrid: defineComponent({
            props: {
                columns: { type: Array, default: () => [] },
                data: { type: Array, default: () => [] },
                pagination: { type: Object, default: undefined },
            },
            emits: ['items-page'],
            setup:
                (props, { emit, slots }) =>
                () => {
                    const columns = (props.columns as { field: string; label: string; visible?: boolean }[]).filter(
                        column => column.visible !== false
                    );
                    const pagination = props.pagination as { hidePageSize?: boolean; pageSizeItems?: number[] } | undefined;

                    return h('div', { role: 'grid' }, [
                        h(
                            'div',
                            { role: 'row' },
                            columns.map(column => h('div', { role: 'columnheader' }, column.label))
                        ),
                        ...(props.data as Record<string, unknown>[]).map(item =>
                            h(
                                'div',
                                { role: 'row' },
                                columns.map(column => h('div', { role: 'gridcell' }, slots[`item-${column.field}`]?.({ item })))
                            )
                        ),
                        pagination &&
                            h('nav', { 'aria-label': PAGINATION_LABEL }, [
                                !pagination.hidePageSize &&
                                    h(
                                        'select',
                                        {
                                            'aria-label': PAGE_SIZE_LABEL,
                                            onChange: (event: Event) => emit('items-page', Number((event.target as HTMLSelectElement).value)),
                                        },
                                        pagination.pageSizeItems?.map(size => h('option', { value: size }, String(size)))
                                    ),
                            ]),
                    ]);
                },
        }),
    };
});

vi.mock('@integration-components/core/vue', async () => {
    const { computed } = await import('vue');
    return {
        useCoreContext: vi.fn(),
        useConfigContext: vi.fn(),
        useShouldHideIllustrations: () => computed(() => false),
        useShouldHideTitles: () => computed(() => false),
        useCondensedDataGrid: () => computed(() => false),
    };
});

vi.mock('@integration-components/composables-vue', async importOriginal => {
    const original = await importOriginal<typeof import('@integration-components/composables-vue')>();
    return { ...original, useResponsiveContainer: vi.fn() };
});

const dispute = {
    disputePspReference: 'DISPUTE_PSP_REFERENCE',
    createdAt: '2024-01-01T00:00:00.000Z',
    amount: { value: 1000, currency: 'EUR' },
} as IDisputeListItem;

describe('DisputesTable on mobile', () => {
    let app: App | undefined;
    let target: HTMLDivElement;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useCoreContext).mockReturnValue({
            i18n: { get: (key: string) => key, has: () => false, amount: vi.fn(), date: (date: string) => date, timezone: 'UTC' },
        } as unknown as ReturnType<typeof useCoreContext>);
        vi.mocked(useConfigContext).mockReturnValue({ refreshing: false } as unknown as ReturnType<typeof useConfigContext>);
        vi.mocked(useResponsiveContainer).mockImplementation(query => computed(() => query === containerQueries.down.xs));
    });

    afterEach(() => {
        app?.unmount();
        target?.remove();
    });

    const mountMobileTable = (props: Partial<InstanceType<typeof DisputesTable>['$props']> = {}) => {
        const rootProps = {
            statusGroup: 'CHARGEBACKS',
            loading: false,
            data: [dispute],
            showPagination: true,
            currentPage: 1,
            limit: 10,
            limitOptions: LIMIT_OPTIONS,
            hasNext: true,
            hasPrevious: false,
            ...props,
        };
        app = createApp(DisputesTable, rootProps);
        target = document.body.appendChild(document.createElement('div'));
        app.mount(target);
    };

    const getColumnHeaders = () => Array.from(target.querySelectorAll('[role="columnheader"]'), header => header.textContent);
    const getCellDates = () => Array.from(target.querySelectorAll('[role="gridcell"] time'), time => time.getAttribute('datetime'));
    const getPageSizeSelector = () => target.querySelector<HTMLSelectElement>(`select[aria-label="${PAGE_SIZE_LABEL}"]`);
    const getPagination = () => target.querySelector(`nav[aria-label="${PAGINATION_LABEL}"]`);

    describe('Columns', () => {
        test.each<[IDisputeStatusGroup, string, string]>([
            ['CHARGEBACKS', FIELD_KEYS.respondBy, FIELD_KEYS.disputedAmount],
            ['ONGOING_AND_CLOSED', FIELD_KEYS.createdAt, FIELD_KEYS.disputedAmount],
            ['FRAUD_ALERTS', FIELD_KEYS.createdAt, FIELD_KEYS.totalPaymentAmount],
        ])('should show the date and payment method next to the amount for %s', (statusGroup, dateLabel, amountLabel) => {
            mountMobileTable({ statusGroup });

            expect(getColumnHeaders()).toEqual([dateLabel, amountLabel]);
        });
    });

    describe('Date', () => {
        test('should show the respond by date for chargebacks', () => {
            mountMobileTable({ statusGroup: 'CHARGEBACKS', data: [{ ...dispute, dueDate: DUE_DATE }] });

            expect(getCellDates()).toEqual([DUE_DATE]);
        });

        test('should not show a date for chargebacks without a respond by date', () => {
            mountMobileTable({ statusGroup: 'CHARGEBACKS', data: [dispute] });

            expect(getCellDates()).toEqual([]);
        });

        test.each<IDisputeStatusGroup>(['ONGOING_AND_CLOSED', 'FRAUD_ALERTS'])('should show the opening date for %s', statusGroup => {
            mountMobileTable({ statusGroup, data: [{ ...dispute, dueDate: DUE_DATE }] });

            expect(getCellDates()).toEqual([dispute.createdAt]);
        });
    });

    describe('Pagination', () => {
        test('should show the page size selector with the available limit options', () => {
            mountMobileTable();

            const options = Array.from(getPageSizeSelector()?.options ?? [], option => Number(option.value));
            expect(options).toEqual(LIMIT_OPTIONS);
        });

        test('should keep the page size selector visible when all results fit on a single page', () => {
            mountMobileTable({ hasNext: false, hasPrevious: false });

            expect(getPageSizeSelector()).toBeInTheDocument();
        });

        test('should update the limit when a page size is selected', async () => {
            const updateLimit = vi.fn();
            mountMobileTable({ updateLimit });

            const selector = getPageSizeSelector()!;
            selector.value = '20';
            selector.dispatchEvent(new Event('change'));
            await nextTick();

            expect(updateLimit).toHaveBeenCalledWith(20);
        });

        test('should hide the page size selector when limit selection is disabled', () => {
            mountMobileTable({ limitOptions: undefined });

            expect(getPagination()).toBeInTheDocument();
            expect(getPageSizeSelector()).not.toBeInTheDocument();
        });
    });
});
