<script setup lang="ts">
import { computed, ref } from 'vue';
import {
    BentoAlert,
    BentoButton,
    BentoCard,
    BentoTag,
    BentoToggleButton,
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
import type { IGrant } from '@integration-components/types';
import { sharedCapitalOverviewAnalyticsEventProperties } from '../../../../../domain/src/CapitalOverview/constants';
import GrantActions from '../GrantActions/GrantActions.vue';
import GrantDetails from '../GrantDetails/GrantDetails.vue';
import styles from './GrantItem.module.scss';

type GrantAdjustmentDetail = 'revocation' | 'unscheduledRepayment';

const props = defineProps<{
    grant: IGrant;
    showDetails?: (detail?: GrantAdjustmentDetail) => void;
}>();

const { i18n } = useCoreContext();
const userEvents = useEventDispatcherContext();
const { dateFormat } = useTimezoneAwareDateFormatting();

const areActionsLocallyCompleted = ref(false);
const isGrantDetailsOpen = ref(false);
const grantConfig = computed(() => getGrantConfig(props.grant, areActionsLocallyCompleted.value));
const formattedAmount = computed(() => i18n.amount(grantConfig.value.amount.value, grantConfig.value.amount.currency));
const termEndLabel = computed(() =>
    i18n.get('capital.overview.grants.item.termEnds', {
        values: { date: dateFormat(grantConfig.value.repaymentPeriodEndDate, DATE_FORMAT_CAPITAL_OVERVIEW) },
    })
);
const statusTooltip = computed(() => (grantConfig.value.statusTooltipKey ? i18n.get(grantConfig.value.statusTooltipKey) : undefined));
const repaymentProgressLabels = computed(() => ({
    current: i18n.get('capital.overview.grants.item.amounts.repaid'),
    max: i18n.get('capital.overview.grants.item.amounts.remaining'),
}));
const shouldDisplayLegend = computed(() => !!(repaymentProgressLabels.value.current || repaymentProgressLabels.value.max));
const repaymentProgressLabel = computed(
    () =>
        `${i18n.amount(props.grant.repaidTotalAmount.value, props.grant.repaidTotalAmount.currency)} ${i18n
            .get('capital.overview.grants.item.amounts.repaid')
            .toLowerCase()}, ${i18n.amount(props.grant.remainingTotalAmount.value, props.grant.remainingTotalAmount.currency)} ${i18n
            .get('capital.overview.grants.item.amounts.remaining')
            .toLowerCase()}`
);

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
            return 'blue';
    }
};

const sendRepayment = () => {
    try {
        props.showDetails?.('unscheduledRepayment');
    } finally {
        userEvents.addEvent?.('Clicked button', {
            ...sharedCapitalOverviewAnalyticsEventProperties,
            subCategory: 'Grant active',
            label: 'Send repayment',
        });
    }
};

const handleActionsComplete = () => {
    areActionsLocallyCompleted.value = true;
};

const toggleGrantDetails = () => {
    if (grantConfig.value.hasDetails) {
        isGrantDetailsOpen.value = !isGrantDetailsOpen.value;
    }
};
</script>

<template>
    <div :class="styles.root">
        <BentoCard
            :aria-label="i18n.get('capital.overview.grants.item.details.a11y.label')"
            :background="grantConfig.isBackgroundFilled ? 'secondary' : 'primary'"
            :clickable="grantConfig.hasDetails"
            :closed="!isGrantDetailsOpen"
            @click="toggleGrantDetails"
        >
            <template #content>
                <div :class="styles.cardContent">
                    <div :class="styles.statusContainer">
                        <BentoTypography
                            variant="caption"
                            :class="{ [styles.textSecondary]: grantConfig.isLabelColorSecondary }"
                            data-testid="grant-amount-label"
                        >
                            {{ i18n.get(grantConfig.amountLabelKey) }}
                        </BentoTypography>

                        <BentoTypography v-if="props.grant.status === 'Active'" variant="caption">
                            <time :datetime="grantConfig.repaymentPeriodEndDate.toISOString()">
                                {{ termEndLabel }}
                            </time>
                        </BentoTypography>

                        <div v-else-if="grantConfig.statusKey" v-bento-tooltip="statusTooltip">
                            <BentoTag :label="i18n.get(grantConfig.statusKey)" :variant="getStatusTagVariant(grantConfig.statusTagVariant)" />
                        </div>
                    </div>

                    <BentoTypography variant="title" medium :class="{ [styles.textSecondary]: grantConfig.isAmountColorSecondary }">
                        {{ formattedAmount }}
                    </BentoTypography>

                    <div v-if="grantConfig.isProgressBarVisible">
                        <progress
                            v-bento-tooltip="repaymentProgressLabel"
                            :class="styles.progressBar"
                            :aria-label="i18n.get('capital.overview.grants.item.progressBar.a11y.label')"
                            :value="props.grant.repaidTotalAmount.value"
                            :max="props.grant.totalAmount.value"
                        />
                        <div v-if="shouldDisplayLegend" :class="styles.progressBarLegend" aria-hidden="true">
                            <BentoTypography
                                v-if="repaymentProgressLabels.current"
                                el="span"
                                variant="caption"
                                :class="styles.progressBarLegendLabel"
                            >
                                {{ repaymentProgressLabels.current }}
                            </BentoTypography>
                            <BentoTypography v-if="repaymentProgressLabels.max" el="span" variant="caption" :class="styles.progressBarLegendLabel">
                                {{ repaymentProgressLabels.max }}
                            </BentoTypography>
                        </div>
                    </div>

                    <div v-if="grantConfig.isGrantIdVisible" :class="styles.grantID">
                        <CopyText
                            copy-button-aria-label-key="capital.overview.grants.item.actions.copyGrantID"
                            data-testid="grant-id-copy-text"
                            is-underline-visible
                            :text-to-copy="props.grant.id"
                            type="Text"
                            :visible-text="i18n.get('capital.common.fields.grantID')"
                        />
                    </div>

                    <div v-if="grantConfig.hasUnscheduledRepaymentDetails" :class="styles.actionsBar">
                        <BentoButton :class="styles.mainActionBtn" variant="secondary" @click.stop="sendRepayment">
                            {{ i18n.get('capital.overview.grants.item.actions.sendRepayment') }}
                        </BentoButton>
                    </div>
                </div>
                <GrantDetails v-if="grantConfig.hasDetails && isGrantDetailsOpen" :grant="props.grant" />
                <BentoToggleButton
                    v-if="grantConfig.hasDetails"
                    :aria-label="i18n.get('capital.overview.grants.item.details.a11y.label')"
                    :class="styles.detailsToggle"
                    :toggled="isGrantDetailsOpen"
                    variant="tertiary"
                    @click="toggleGrantDetails"
                >
                    <ChevronUpIcon v-if="isGrantDetailsOpen" />
                    <ChevronDownIcon v-else />
                </BentoToggleButton>
            </template>
        </BentoCard>

        <template v-if="grantConfig.hasAlerts">
            <GrantActions
                v-if="props.grant.missingActions?.length"
                :class-name="styles.alert"
                :grant-id="props.grant.id"
                :missing-actions="props.grant.missingActions"
                :offer-expires-at="props.grant.offerExpiresAt"
                @complete="handleActionsComplete"
            />
            <BentoAlert v-else :class="styles.alert" type="highlight">
                {{ i18n.get('capital.overview.grants.item.alerts.processingRequest') }}
            </BentoAlert>
        </template>
    </div>
</template>
