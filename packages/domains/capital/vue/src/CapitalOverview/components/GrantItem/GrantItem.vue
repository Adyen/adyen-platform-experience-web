<script setup lang="ts">
import { computed, ref } from 'vue';
import {
    BentoAlert,
    BentoButton,
    BentoCard,
    BentoProgressBar,
    BentoTag,
    BentoTooltipDirective as vBentoTooltip,
    BentoTypography,
    type BentoTagVariant,
} from '@adyen/bento-vue3';
import ChevronDownIcon from '@adyen/ui-assets-icons-16/vue/chevron-down';
import ChevronUpIcon from '@adyen/ui-assets-icons-16/vue/chevron-up';
import { getGrantConfig, type GrantStatusVariant } from '@integration-components/capital/domain';
import { CopyText, useTimezoneAwareDateFormatting } from '@integration-components/composables-vue';
import { useCoreContext, useEventDispatcherContext } from '@integration-components/core/vue';
import { DATE_FORMAT_CAPITAL_OVERVIEW } from '@integration-components/utils';
import type { IAmount, IGrant } from '@integration-components/types';
import { sharedCapitalOverviewAnalyticsEventProperties } from '../../../../../domain/src/CapitalOverview/constants';
import Actions from '../Actions.vue';
import GrantDetails from '../GrantDetails/GrantDetails.vue';
import styles from './GrantItem.module.scss';
import RepaymentModal from '../RepaymentDetails/RepaymentModal.vue';

const props = defineProps<{
    grant: IGrant;
}>();

const { i18n } = useCoreContext();
const userEvents = useEventDispatcherContext();
const { dateFormat } = useTimezoneAwareDateFormatting();

const areActionsLocallyCompleted = ref(false);
const isGrantDetailsOpen = ref(false);
const grantConfig = computed(() => getGrantConfig(props.grant, areActionsLocallyCompleted.value));
const termEndLabel = computed(() =>
    i18n.get('capital.overview.grants.item.termEnds', {
        values: { date: dateFormat(grantConfig.value.repaymentPeriodEndDate, DATE_FORMAT_CAPITAL_OVERVIEW) },
    })
);
const statusTooltip = computed(() => (grantConfig.value.statusTooltipKey ? i18n.get(grantConfig.value.statusTooltipKey) : undefined));
const repaymentPercentage = computed(() => {
    const total = props.grant.totalAmount.value;
    return total > 0 ? (props.grant.repaidTotalAmount.value / props.grant.totalAmount.value) * 100 : 0;
});

const repaymentRatioParts = computed(() => {
    const repaidAmountPlaceholder = '__REPAID_AMOUNT_PLACEHOLDER__';
    return i18n
        .get('capital.overview.grants.item.progressBar.repaymentRatio', {
            values: { repaidAmount: repaidAmountPlaceholder, totalAmount: formatAmount(props.grant.totalAmount) },
        })
        .split(repaidAmountPlaceholder);
});

const formatAmount = (amount: IAmount) => {
    return i18n.amount(amount.value, amount.currency);
};

const getStatusTagVariant = (statusVariant: GrantStatusVariant): BentoTagVariant => {
    switch (statusVariant) {
        case 'Error':
            return 'red';
        case 'Light':
            return 'white';
        case 'Warning':
            return 'orange';
        case 'Default':
        default:
            return 'grey';
    }
};

const handleActionsComplete = () => {
    areActionsLocallyCompleted.value = true;
};

const toggleGrantDetails = () => {
    if (grantConfig.value.areDetailsVisible) {
        isGrantDetailsOpen.value = !isGrantDetailsOpen.value;
    }
};

const isRepaymentModalOpen = ref(false);

const openRepaymentDetails = () => {
    isRepaymentModalOpen.value = true;
    userEvents.addEvent?.('Clicked button', {
        ...sharedCapitalOverviewAnalyticsEventProperties,
        subCategory: 'Grant active',
        label: 'Send repayment',
    });
};

const closeRepaymentModal = () => {
    isRepaymentModalOpen.value = false;
};
</script>

<template>
    <div :class="styles.root">
        <BentoCard
            :aria-label="i18n.get('capital.overview.grants.item.details.a11y.label')"
            :background="grantConfig.isBackgroundFilled ? 'secondary' : 'primary'"
            :clickable="grantConfig.areDetailsVisible"
            :closed="!isGrantDetailsOpen"
            @click="toggleGrantDetails"
        >
            <template #content>
                <div :class="styles.content">
                    <div :class="styles.compactContent">
                        <div :class="styles.amountAndStatus">
                            <div :class="styles.amount">
                                <BentoTypography variant="caption" data-testid="grant-amount-label">
                                    {{ i18n.get(grantConfig.amountLabelKey) }}
                                </BentoTypography>
                                <BentoTypography variant="title" medium :class="grantConfig.isAmountColorSecondary && styles.secondaryText">
                                    {{ formatAmount(grantConfig.amount) }}
                                </BentoTypography>
                            </div>
                            <BentoTypography v-if="props.grant.status === 'Active'" variant="caption">
                                <time :datetime="grantConfig.repaymentPeriodEndDate.toISOString()">
                                    {{ termEndLabel }}
                                </time>
                            </BentoTypography>
                            <BentoTag
                                v-else-if="grantConfig.statusKey"
                                v-bento-tooltip="statusTooltip"
                                :label="i18n.get(grantConfig.statusKey)"
                                :variant="getStatusTagVariant(grantConfig.statusTagVariant)"
                            />
                        </div>
                        <div v-if="grantConfig.isProgressBarVisible">
                            <BentoProgressBar :value="repaymentPercentage" variant="static" :static-animation="false">
                                <template #value>
                                    <BentoTypography el="span">
                                        <template v-for="(part, index) in repaymentRatioParts" :key="index">
                                            {{ part }}
                                            <BentoTypography v-if="index === 0" el="span" strongest>
                                                {{ formatAmount(props.grant.repaidTotalAmount) }}
                                            </BentoTypography>
                                        </template>
                                    </BentoTypography>
                                </template>
                            </BentoProgressBar>
                        </div>
                        <div v-if="grantConfig.isGrantIdVisible" :class="styles.grantID">
                            <CopyText
                                copy-button-aria-label-key="capital.overview.grants.item.actions.copyGrantID"
                                data-testid="grant-id-copy-text"
                                is-underline-visible
                                :text-to-copy="props.grant.id"
                                type="Text"
                                :visible-text="i18n.get('capital.common.fields.grantID')"
                                @click.stop
                            />
                        </div>
                    </div>
                    <BentoButton
                        v-if="grantConfig.areRepaymentDetailsVisible"
                        :class="styles.mainActionBtn"
                        variant="secondary"
                        @click.stop="openRepaymentDetails"
                    >
                        {{ i18n.get('capital.overview.grants.item.actions.sendRepayment') }}
                    </BentoButton>
                    <Actions
                        v-if="grantConfig.areActionsVisible && props.grant.missingActions"
                        :class-name="styles.alert"
                        :grant-id="props.grant.id"
                        :missing-actions="props.grant.missingActions"
                        :offer-expires-at="props.grant.offerExpiresAt"
                        @complete="handleActionsComplete"
                    />
                    <BentoAlert v-if="grantConfig.isPendingAlertVisible" :class="styles.alert" type="highlight">
                        {{ i18n.get('capital.overview.grants.item.alerts.processingRequest') }}
                    </BentoAlert>
                </div>
                <GrantDetails v-if="grantConfig.areDetailsVisible && isGrantDetailsOpen" :grant="props.grant" />
                <div v-if="grantConfig.areDetailsVisible" :class="styles.chevron">
                    <ChevronUpIcon v-if="isGrantDetailsOpen" />
                    <ChevronDownIcon v-else />
                </div>
            </template>
        </BentoCard>
    </div>
    <RepaymentModal :grant="grant" :is-open="isRepaymentModalOpen" :on-close="closeRepaymentModal" />
</template>
