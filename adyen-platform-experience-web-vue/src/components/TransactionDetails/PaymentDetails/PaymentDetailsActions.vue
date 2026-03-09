<script setup lang="ts">
import { computed } from 'vue';
import { BentoButton } from '@adyen/bento-vue3';
import { useCoreContext } from '../../../core/Context';
import { TX_DATA_ACTION_BAR, TX_DATA_CONTAINER } from '../constants';
import { ActiveView, type TransactionDetails } from '../types';

const props = defineProps<{
    extraFields: Record<string, any> | undefined;
    refundAvailable: boolean;
    refundDisabled: boolean;
    setActiveView: (activeView: ActiveView) => void;
    transaction: TransactionDetails;
    transactionNavigator: any;
}>();

const { i18n } = useCoreContext();

const transactionNavigation = computed<'backToRefund' | 'goToPayment' | undefined>(() => {
    const nav = props.transactionNavigator;
    if (nav.currentTransaction !== props.transaction.id) return;
    if (nav.canNavigateBackward) return 'backToRefund';
    if (nav.canNavigateForward) return 'goToPayment';
});

const actionButtons = computed(() => ({
    backToRefund: { title: i18n.get('transactions.details.actions.backToRefund') },
    goToPayment: { title: i18n.get('transactions.details.actions.goToPayment') },
    refund: { title: i18n.get('transactions.details.actions.refund') },
}));

const hasActions = computed(() => {
    return props.refundAvailable || !!transactionNavigation.value || customActions.value.length > 0;
});

const customActions = computed(() =>
    Object.values(props.extraFields || {})
        .filter(field => field?.type === 'button')
        .map(action => ({
            title: action.value,
            action: action.config?.action,
            className: action.config?.className,
        }))
);

function handleRefund() {
    if (!props.refundDisabled) {
        props.setActiveView(ActiveView.REFUND);
    }
}

function handleNavigation() {
    const nav = props.transactionNavigator;
    if (transactionNavigation.value === 'backToRefund') {
        nav.backward();
    } else if (transactionNavigation.value === 'goToPayment') {
        nav.forward();
    }
}
</script>

<template>
    <div v-if="hasActions" :class="[TX_DATA_CONTAINER, TX_DATA_ACTION_BAR]">
        <!-- Primary: Refund button -->
        <bento-button v-if="props.refundAvailable" variant="primary" :disabled="props.refundDisabled" @click="handleRefund">
            {{ actionButtons.refund.title }}
        </bento-button>

        <!-- Secondary: Navigation button -->
        <bento-button v-if="transactionNavigation" variant="secondary" @click="handleNavigation">
            <span v-if="transactionNavigation === 'backToRefund'" style="display: inline-flex; align-items: center; gap: 4px">
                <span style="transform: scaleX(-1)">&#x276F;</span>
                <span>{{ actionButtons.backToRefund.title }}</span>
            </span>
            <span v-else style="display: inline-flex; align-items: center; gap: 4px">
                <span>&#x276F;</span>
                <span>{{ actionButtons.goToPayment.title }}</span>
            </span>
        </bento-button>

        <!-- Custom actions from extraFields -->
        <bento-button v-for="(action, index) in customActions" :key="index" variant="secondary" :class="action.className" @click="action.action?.()">
            {{ action.title }}
        </bento-button>
    </div>
</template>
