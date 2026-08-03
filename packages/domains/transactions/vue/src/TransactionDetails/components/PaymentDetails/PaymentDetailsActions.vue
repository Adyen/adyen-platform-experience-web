<script setup lang="ts">
import { computed } from 'vue';
import { useCoreContext, useEventDispatcherContext } from '@integration-components/core/vue';
import { BentoButtonActions } from '@adyen/bento-vue3';
import { sharedTransactionDetailsEventProperties, ActiveView } from '../../../../../domain/src';
import type { TransactionDetails } from '../../../../../domain/src';
import type { useTransaction } from '../../composables/useTransaction';
import styles from './PaymentDetails.module.scss';

type TransactionNavigatorState = ReturnType<typeof useTransaction>['transactionNavigator']['value'];

const props = defineProps<{
    extraFields: Record<string, any> | undefined;
    refundAvailable: boolean;
    refundDisabled: boolean;
    setActiveView: (view: ActiveView) => void;
    transaction: TransactionDetails;
    transactionNavigator: TransactionNavigatorState;
}>();

const { i18n } = useCoreContext();
const userEvents = useEventDispatcherContext();

const navigatorState = computed(() => props.transactionNavigator);

const transactionNavigation = computed<'backToRefund' | 'goToPayment' | undefined>(() => {
    const { currentTransaction, canNavigateBackward, canNavigateForward } = navigatorState.value;
    if (currentTransaction !== props.transaction.id) return undefined;
    if (canNavigateBackward) return 'backToRefund';
    if (canNavigateForward) return 'goToPayment';
    return undefined;
});

const primaryAction = computed(() => {
    if (!props.refundAvailable) return undefined;
    return {
        disabled: props.refundDisabled,
        event: () => {
            if (!props.refundDisabled) props.setActiveView(ActiveView.REFUND);
        },
        title: i18n.get('transactions.details.actions.refund'),
        variant: 'primary' as const,
    };
});

const secondaryAction = computed(() => {
    const nav = transactionNavigation.value;
    if (!nav) return undefined;
    const isBack = nav === 'backToRefund';
    const title = i18n.get(isBack ? 'transactions.details.actions.backToRefund' : 'transactions.details.actions.goToPayment');
    const navAction = isBack ? navigatorState.value.backward : navigatorState.value.forward;
    const eventLabel = isBack ? 'Return to refund' : 'Go to payment';
    return {
        disabled: false,
        event: () => {
            navAction();
            userEvents.addEvent?.('Clicked button', { ...sharedTransactionDetailsEventProperties, label: eventLabel });
        },
        title,
        variant: 'secondary' as const,
    };
});

const customActions = computed(() =>
    Object.values(props.extraFields ?? {})
        .filter(f => (f as any)?.type === 'button')
        .map((action: any) => ({
            title: action.value,
            variant: 'secondary' as const,
            event: action.config?.action,
        }))
);

const actions = computed(() => [primaryAction.value, secondaryAction.value, ...customActions.value].filter(Boolean) as any[]);
</script>

<template>
    <div v-if="actions.length > 0" :class="[styles.container, styles.actionBar]">
        <BentoButtonActions :actions="actions" />
    </div>
</template>
