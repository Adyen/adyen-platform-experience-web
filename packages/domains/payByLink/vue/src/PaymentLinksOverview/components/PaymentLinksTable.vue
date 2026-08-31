<script setup lang="ts">
import { computed } from 'vue';
import { BentoDataGrid, BentoTag, BentoTypography, BentoTooltipDirective as vBentoTooltip } from '@adyen/bento-vue3';
import type { BentoColumn, BentoDatagridDataItem, BentoTagVariant } from '@adyen/bento-vue3';
import { containerQueries, DataOverviewError, useDataOverviewError, useResponsiveContainer } from '@integration-components/composables-vue';
import CopyIcon from '@adyen/ui-assets-icons-16/vue/copy';
import RefreshIcon from '@adyen/ui-assets-icons-16/vue/refresh';
import { isActionNeededUrgently, BACKEND_REDACTED_DATA_MARKER, FRONTEND_REDACTED_DATA_MARKER } from '../../../../domain/src';
import {
    DATE_FORMAT_PAYMENT_LINKS_OVERVIEW,
    DATE_FORMAT_PAYMENT_LINKS_OVERVIEW_EXPIRATION_DATE,
    DATE_FORMAT_RESPONSE_DEADLINE,
} from '@integration-components/utils';
import { usePaymentLinkLabels } from '../composables/usePaymentLinkLabels';
import type { IPaymentLinkItem, IPaymentLinkStatus } from '@integration-components/types';
import { getPaymentLinksErrorMessage } from '../utils/getPaymentLinksErrorMessage';
import styles from './PaymentLinksTable.module.scss';
import { usePayByLinkContext } from '../../integration/context';
import { PAY_BY_LINK_DATA_OVERVIEW_ACTION_KEYS } from '../../integration/translationKeys';

const DAY_MS = 24 * 60 * 60 * 1000;

const props = defineProps<{
    error?: Error;
    loading: boolean;
    onContactSupport?: () => void;
    onRefresh?: () => void;
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

const { i18n, runtime } = usePayByLinkContext();
const dateFormat: typeof i18n.date = (date, options) => i18n.date(date, options);
const { getStatusLabel, getLinkTypeLabel } = usePaymentLinkLabels();

const isMobile = useResponsiveContainer(containerQueries.down.xs);
const errorInfo = computed(
    () =>
        getPaymentLinksErrorMessage(props.error, 'payByLink.overview.errors.couldNotLoadLinks', props.onContactSupport) ?? {
            messages: [],
        }
);
const { presentation: errorPresentation } = useDataOverviewError({
    actionKeys: PAY_BY_LINK_DATA_OVERVIEW_ACTION_KEYS,
    copyIcon: CopyIcon,
    errorInfo,
    onRefresh: () => props.onRefresh?.() ?? runtime.refresh(),
    refreshIcon: RefreshIcon,
    translate: (key, options) => i18n.get(key, options),
});

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
        hideFirstLastPageButtons: true,
    };
});

const emptyStateProps = computed(() => ({
    title: i18n.get('payByLink.overview.errors.listEmpty'),
    description: i18n.get('payByLink.overview.errors.listEmpty.message'),
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
    <div>
        <DataOverviewError
            v-if="props.error"
            v-bind="errorPresentation"
            :image="errorInfo?.imageName ?? 'wrong-environment'"
            :variant="isMobile ? 'condensed' : 'embedded'"
        />

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
                <div v-if="isMobile" :class="styles.mobileCell">
                    <BentoTypography variant="body" stronger>
                        {{ item.paymentLinkId }}
                    </BentoTypography>
                    <time :datetime="item.expirationDate">
                        <BentoTypography variant="caption" :class="styles.mobileExpireDateCell">
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
                <div v-if="isMobile" :class="[styles.mobileCell, styles.mobileAmountCell]">
                    <BentoTypography variant="body" stronger>
                        {{ formatAmount(item.amount) }}
                    </BentoTypography>
                    <BentoTag v-if="item.status" :label="getStatusLabel(item.status)" :variant="getTagVariantForStatus(item.status)" />
                </div>
                <BentoTypography v-else variant="body">
                    {{ formatAmount(item.amount) }}
                </BentoTypography>
            </template>

            <template #item-status="{ item }">
                <BentoTag v-if="item.status" :label="getStatusLabel(item.status)" :variant="getTagVariantForStatus(item.status)" />
            </template>

            <template #item-linkType="{ item }">
                <BentoTypography v-if="item.linkType" variant="body">
                    {{ getLinkTypeLabel(item.linkType) }}
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
                    v-bento-tooltip="isActionNeededUrgently(item.expirationDate) ? getTimeToDeadline(item.expirationDate) : ''"
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
