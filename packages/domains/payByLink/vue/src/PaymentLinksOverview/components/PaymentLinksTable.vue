<script setup lang="ts">
import { computed } from 'vue';
import { BentoDataGrid, BentoTag, BentoTypography, BentoButton } from '@adyen/bento-vue3';
import type { BentoColumn, BentoDatagridDataItem, BentoTagVariant } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import { useResponsiveContainer, containerQueries, useTimezoneAwareDateFormatting } from '@integration-components/composables-vue';
import { isActionNeededUrgently, BACKEND_REDACTED_DATA_MARKER, FRONTEND_REDACTED_DATA_MARKER } from '../../../../domain/src';
import {
    DATE_FORMAT_PAYMENT_LINKS_OVERVIEW,
    DATE_FORMAT_PAYMENT_LINKS_OVERVIEW_EXPIRATION_DATE,
    DATE_FORMAT_RESPONSE_DEADLINE,
} from '@integration-components/utils';
import { PAYMENT_LINK_STATUSES, PAYMENT_LINK_TYPES, TABLE_CLASS } from '../constants';
import type { IPaymentLinkItem, IPaymentLinkStatus } from '@integration-components/types';
import type { AdyenPlatformExperienceError } from '@integration-components/core';

const DAY_MS = 24 * 60 * 60 * 1000;

const props = defineProps<{
    error?: AdyenPlatformExperienceError;
    loading: boolean;
    onContactSupport?: () => void;
    onRowClick?: (paymentLink: IPaymentLinkItem) => void;
    showPagination: boolean;
    paymentLinks: IPaymentLinkItem[] | undefined;
    hasMultipleStores?: boolean;
    hasNext?: boolean;
    hasPrevious?: boolean;
    goToNextPage?: () => void;
    goToPreviousPage?: () => void;
    limit?: number;
    limitOptions?: number[];
    updateLimit?: (limit: number) => void;
    currentPage?: number;
}>();

const { i18n } = useCoreContext();
const { dateFormat } = useTimezoneAwareDateFormatting();

const isMobile = useResponsiveContainer(containerQueries.down.xs);

// Backend returns a validation error (rather than an empty list) when the paymentLinkId filter
// doesn't match any link. Treat it as an empty result, mirroring the Preact behavior.
const isInvalidPaymentLinkIdError = computed(
    () => props.error?.errorCode === '29_001' && props.error.invalidFields?.some(field => field.name === 'paymentLinkId')
);
const displayError = computed(() => (isInvalidPaymentLinkIdError.value ? undefined : props.error));

function getTagVariantForStatus(status: IPaymentLinkStatus): BentoTagVariant {
    switch (status) {
        case 'completed':
            return 'green';
        case 'expired':
            return 'grey';
        case 'paymentPending':
            return 'orange';
        case 'active':
            return 'blue';
        default:
            return 'grey';
    }
}

function getTimeToDeadline(dueDate: string): string {
    if (!dueDate) return '';
    const deadline = new Date(dueDate).getTime();
    const diffInDays = Math.ceil((deadline - Date.now()) / DAY_MS);
    const formattedDate = dateFormat(dueDate, { ...DATE_FORMAT_RESPONSE_DEADLINE, weekday: undefined });

    return diffInDays <= 1
        ? i18n.get('payByLink.overview.common.actionNeeded.expiresToday', { values: { date: formattedDate } })
        : i18n.get('payByLink.overview.common.actionNeeded.expiresDays', { values: { days: diffInDays, date: formattedDate } });
}

const columns = computed<BentoColumn[]>(() => {
    if (isMobile.value) {
        return [
            { field: 'paymentLinkId', label: i18n.get('payByLink.overview.list.fields.id'), flex: 2 },
            { field: 'amount', label: i18n.get('payByLink.overview.list.fields.amount'), flex: 1, numeric: true },
        ];
    }

    const cols: BentoColumn[] = [
        { field: 'paymentLinkId', label: i18n.get('payByLink.overview.list.fields.id'), autoWidth: true },
        { field: 'merchantReference', label: i18n.get('payByLink.overview.list.fields.merchantReference'), flex: 1 },
    ];

    if (props.hasMultipleStores) {
        cols.push({ field: 'storeCode', label: i18n.get('payByLink.overview.list.fields.store'), autoWidth: true });
    }

    cols.push(
        { field: 'currency', label: i18n.get('payByLink.overview.list.fields.currency'), autoWidth: true },
        { field: 'amount', label: i18n.get('payByLink.overview.list.fields.amount'), autoWidth: true, numeric: true },
        { field: 'status', label: i18n.get('payByLink.overview.list.fields.status'), autoWidth: true },
        { field: 'expirationDate', label: i18n.get('payByLink.overview.list.fields.expirationDate'), autoWidth: true },
        { field: 'creationDate', label: i18n.get('payByLink.overview.list.fields.createdAt'), autoWidth: true },
        { field: 'linkType', label: i18n.get('payByLink.overview.list.fields.linkType'), autoWidth: true },
        { field: 'shopperEmail', label: i18n.get('payByLink.overview.list.fields.shopperEmail'), flex: 1 }
    );

    return cols;
});

const gridData = computed<BentoDatagridDataItem[]>(() => {
    const source = props.paymentLinks ?? [];
    return source.map((link, idx) => ({
        id: `${link.paymentLinkId}-${idx}`,
        _raw: link,
        ...link,
    }));
});

const paginationProps = computed(() => {
    if (!props.showPagination) return undefined;
    return {
        page: props.currentPage ?? 1,
        size: props.limit ?? 10,
        hasNext: props.hasNext ?? false,
        hasPrevious: props.hasPrevious ?? false,
        hidePageSize: !props.limitOptions || props.limitOptions.length <= 1,
    };
});

const emptyStateProps = computed(() => ({
    title: i18n.get('payByLink.overview.errors.listEmpty'),
    description: i18n.get('common.errors.updateFilters'),
}));

function handleNavigate(page: number) {
    if (props.loading) return;
    if (page > (props.currentPage ?? 1)) {
        props.goToNextPage?.();
    } else {
        props.goToPreviousPage?.();
    }
}

function handleItemsPage(size: number) {
    props.updateLimit?.(size);
}

function handleRowClick(item: BentoDatagridDataItem) {
    props.onRowClick?.(item._raw as IPaymentLinkItem);
}

function formatAmount(value: { value: number; currency: string } | null | undefined): string {
    if (!value) return '';
    return i18n.amount(value.value, value.currency, { hideCurrency: true });
}

function shopperEmailDisplay(email: string | undefined): string | undefined {
    return email === BACKEND_REDACTED_DATA_MARKER ? FRONTEND_REDACTED_DATA_MARKER : email;
}
</script>

<template>
    <div :class="TABLE_CLASS">
        <div v-if="displayError" class="adyen-pe-data-overview-error">
            <p>{{ i18n.get('payByLink.overview.errors.couldNotLoadLinks') }}</p>
            <BentoButton v-if="props.onContactSupport" variant="tertiary" @click="props.onContactSupport">
                {{ i18n.get('common.actions.contactSupport.labels.default') }}
            </BentoButton>
        </div>

        <BentoDataGrid
            v-else
            outline
            :columns="columns"
            :data="gridData"
            :loading="props.loading"
            :pagination="paginationProps"
            :empty-state="emptyStateProps"
            :has-resizable-columns="false"
            :allow-column-drag-and-drop="false"
            :allow-row-clicks="true"
            @row-click="handleRowClick"
            @navigate="handleNavigate"
            @items-page="handleItemsPage"
        >
            <template #item-paymentLinkId="{ item }">
                <div v-if="isMobile" class="adyen-pe-payment-link-table__mobile-cell">
                    <BentoTypography variant="body" stronger>
                        {{ item.paymentLinkId }}
                    </BentoTypography>
                    <time :datetime="item.expirationDate">
                        <BentoTypography variant="caption" class="adyen-pe-payment-link-table__mobile-expire-date-cell">
                            {{
                                i18n.get('payByLink.overview.common.actionNeeded.expiresAt', {
                                    values: { date: dateFormat(item.expirationDate, DATE_FORMAT_PAYMENT_LINKS_OVERVIEW_EXPIRATION_DATE) },
                                })
                            }}
                        </BentoTypography>
                    </time>
                </div>
                <BentoTypography v-else variant="body">
                    {{ item.paymentLinkId }}
                </BentoTypography>
            </template>

            <template #item-currency="{ item }">
                <BentoTag v-if="item.amount?.currency" variant="grey" :label="item.amount.currency" />
            </template>

            <template #item-amount="{ item }">
                <div v-if="isMobile" class="adyen-pe-payment-link-table__mobile-cell adyen-pe-payment-link-table__mobile-amount-cell">
                    <BentoTypography variant="body" stronger>
                        {{ formatAmount(item.amount) }}
                    </BentoTypography>
                    <BentoTag
                        v-if="item.status"
                        :label="i18n.get(PAYMENT_LINK_STATUSES[item.status as IPaymentLinkStatus])"
                        :variant="getTagVariantForStatus(item.status)"
                    />
                </div>
                <BentoTypography v-else variant="body">
                    {{ formatAmount(item.amount) }}
                </BentoTypography>
            </template>

            <template #item-status="{ item }">
                <BentoTag
                    v-if="item.status"
                    :label="i18n.get(PAYMENT_LINK_STATUSES[item.status as IPaymentLinkStatus])"
                    :variant="getTagVariantForStatus(item.status)"
                />
            </template>

            <template #item-linkType="{ item }">
                <BentoTypography v-if="item.linkType" variant="body">
                    {{ i18n.get(PAYMENT_LINK_TYPES[item.linkType as keyof typeof PAYMENT_LINK_TYPES]) }}
                </BentoTypography>
            </template>

            <template #item-creationDate="{ item }">
                <time v-if="item.creationDate" :datetime="item.creationDate">
                    <BentoTypography variant="body">{{ dateFormat(item.creationDate, DATE_FORMAT_PAYMENT_LINKS_OVERVIEW) }}</BentoTypography>
                </time>
            </template>

            <template #item-expirationDate="{ item }">
                <time
                    v-if="item.expirationDate"
                    v-bento-tooltip="isActionNeededUrgently(item.expirationDate) ? getTimeToDeadline(item.expirationDate) : undefined"
                    :datetime="item.expirationDate"
                >
                    <BentoTypography variant="body">
                        {{ dateFormat(item.expirationDate, DATE_FORMAT_PAYMENT_LINKS_OVERVIEW_EXPIRATION_DATE) }}
                    </BentoTypography>
                </time>
            </template>

            <template #item-shopperEmail="{ item }">
                <BentoTypography v-if="item.shopperEmail" variant="body">
                    {{ shopperEmailDisplay(item.shopperEmail) }}
                </BentoTypography>
            </template>
        </BentoDataGrid>
    </div>
</template>
