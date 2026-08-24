<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { BentoTypography } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import { ErrorMessageDisplay } from '@integration-components/composables-vue';
import { getPaymentLinkErrorMessageContent } from '@integration-components/payByLink/domain';
import { usePaymentLinkDetails } from '../../composables/usePaymentLinkDetails';
import PaymentLinkDetailsContent from './PaymentLinkDetailsContent.vue';
import PaymentLinkExpiration from '../PaymentLinkExpiration/PaymentLinkExpiration.vue';
import PaymentLinkExpirationSuccess from '../PaymentLinkExpiration/PaymentLinkExpirationSuccess.vue';
import PaymentLinkSkeleton from '../PaymentLinkSkeleton/PaymentLinkSkeleton.vue';
import '@adyen/bento-vue3/styles/bento-light';
import accessibilityStyles from '@integration-components/style/accessibility.module.scss';
import styles from './PaymentLinkDetails.module.scss';

const props = defineProps<{
    id: string;
    hideTitle?: boolean;
    onContactSupport?: () => void;
    onDismiss?: () => void;
    onUpdate?: () => void;
    isDismissButtonHidden?: boolean;
}>();

const { i18n } = useCoreContext();
const { paymentLink, error, isFetching, refetch } = usePaymentLinkDetails(() => ({ id: props.id }));

const errorInfo = computed(() => {
    const content = getPaymentLinkErrorMessageContent(error.value, 'payByLink.details.errors.unavailable', !!props.onContactSupport);
    return {
        title: content.title,
        messages: content.message,
        refreshComponent: content.refreshComponent,
        requestId: content.requestId,
        onContactSupport: error.value?.errorCode === '500' ? props.onContactSupport : undefined,
    };
});

type Screen = 'details' | 'expirationConfirmation' | 'expirationSuccess';
const activeScreen = ref<Screen>('details');

watch(
    () => props.id,
    () => {
        activeScreen.value = 'details';
    }
);

function handleExpireNow() {
    activeScreen.value = 'expirationConfirmation';
}

function handleExpirationSuccess() {
    activeScreen.value = 'expirationSuccess';
    props.onUpdate?.();
}

function handleNavigationToDetailsAfterExpiration() {
    activeScreen.value = 'details';
    refetch();
}
</script>

<template>
    <div :class="styles.root">
        <div :class="activeScreen !== 'details' ? accessibilityStyles.visuallyHidden : undefined">
            <BentoTypography v-if="!props.hideTitle" el="h1" variant="title" large stronger>
                {{ i18n.get('payByLink.details.title') }}
            </BentoTypography>
        </div>

        <div :class="styles.content">
            <PaymentLinkSkeleton v-if="isFetching" />

            <div v-else-if="!paymentLink || error" :class="styles.error">
                <ErrorMessageDisplay
                    :error-info="errorInfo"
                    :on-dismiss="props.onDismiss"
                    dismiss-label="payByLink.common.actions.goBack"
                    :on-refresh="refetch"
                    :outlined="false"
                    :absolute-position="false"
                    :with-background="false"
                    with-image
                />
            </div>

            <PaymentLinkExpiration
                v-else-if="activeScreen === 'expirationConfirmation' && paymentLink"
                :payment-link="paymentLink"
                :on-cancel="() => (activeScreen = 'details')"
                :on-expiration-success="handleExpirationSuccess"
            />

            <PaymentLinkExpirationSuccess
                v-else-if="activeScreen === 'expirationSuccess'"
                :on-dismiss="props.onDismiss"
                :on-show-details="handleNavigationToDetailsAfterExpiration"
            />

            <PaymentLinkDetailsContent
                v-else-if="paymentLink"
                :payment-link="paymentLink"
                :on-dismiss="props.onDismiss"
                :on-expire="handleExpireNow"
                :is-dismiss-button-hidden="props.isDismissButtonHidden"
            />
        </div>
    </div>
</template>
