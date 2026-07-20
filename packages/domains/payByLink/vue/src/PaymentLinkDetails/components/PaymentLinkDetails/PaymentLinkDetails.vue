<script setup lang="ts">
import { ref, watch } from 'vue';
import { BentoLoadingIndicator, BentoTypography } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import { usePaymentLinkDetails } from '../../composables/usePaymentLinkDetails';
import PaymentLinkExpiration from '../PaymentLinkExpiration/PaymentLinkExpiration.vue';
import PaymentLinkDetailsContent from './PaymentLinkDetailsContent.vue';
import PaymentLinkDetailsError from './PaymentLinkDetailsError.vue';
import PaymentLinkExpirationSuccess from '../PaymentLinkExpiration/PaymentLinkExpirationSuccess.vue';
import './PaymentLinkDetails.scss';

const CLASSNAMES = {
    root: 'adyen-pe-payment-link-details',
    content: 'adyen-pe-payment-link-details__content',
};

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
    <div :class="CLASSNAMES.root">
        <div :class="{ 'adyen-pe-visually-hidden': activeScreen !== 'details' }">
            <BentoTypography v-if="!props.hideTitle" el="h1" variant="title" large stronger>
                {{ i18n.get('payByLink.details.title') }}
            </BentoTypography>
        </div>

        <div :class="CLASSNAMES.content">
            <div v-if="isFetching" class="adyen-pe-payment-link-details__loading">
                <BentoLoadingIndicator />
            </div>

            <PaymentLinkDetailsError
                v-else-if="!paymentLink || error"
                :error="error"
                :on-contact-support="props.onContactSupport"
                :on-dismiss="props.onDismiss"
                :on-refetch="refetch"
            />

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
