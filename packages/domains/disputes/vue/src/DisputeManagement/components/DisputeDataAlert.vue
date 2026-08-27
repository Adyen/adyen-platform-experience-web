<script setup lang="ts">
import { computed } from 'vue';
import { BentoAlert } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import useTimezoneAwareDateFormatting from '@integration-components/composables-vue/useTimezoneAwareDateFormatting';
import { DATE_FORMAT_RESPONSE_DEADLINE } from '@integration-components/utils';
import type { IDisputeDetail } from '@integration-components/types/api/models/disputes';
import type { DisputeDataAlertMode } from '../types';

const props = defineProps<{
    alertMode: DisputeDataAlertMode;
    dispute: IDisputeDetail;
}>();

const { i18n } = useCoreContext();
const { dateFormat } = useTimezoneAwareDateFormatting(() => props.dispute.payment.balanceAccount?.timeZone);

const alertText = computed(() => {
    const currentDispute = props.dispute.dispute;

    switch (props.alertMode) {
        case 'contactSupport': {
            const translationKey =
                currentDispute.type === 'REQUEST_FOR_INFORMATION'
                    ? 'disputes.management.details.alerts.contactSupport.requestForInformation'
                    : currentDispute.type === 'NOTIFICATION_OF_FRAUD'
                      ? 'disputes.management.details.alerts.contactSupport.notificationOfFraud'
                      : 'disputes.management.details.alerts.contactSupport.chargeback';
            const message = i18n.get(translationKey);
            if (currentDispute.type === 'NOTIFICATION_OF_FRAUD' || !currentDispute.dueDate) return message;
            return `${message} ${i18n.get('disputes.management.details.alerts.responseDeadline', {
                values: { date: dateFormat(currentDispute.dueDate, DATE_FORMAT_RESPONSE_DEADLINE) },
            })}`;
        }
        case 'autoDefended':
            return i18n.get('disputes.management.details.alerts.autoDefended');
        case 'notDefended':
            return i18n.get(
                currentDispute.status === 'EXPIRED'
                    ? 'disputes.management.details.alerts.notDefendedExpired'
                    : 'disputes.management.details.alerts.notDefendedLost'
            );
        case 'notDefendable':
            return i18n.get('disputes.management.details.alerts.notDefendable');
    }
    return undefined;
});

const alertType = computed(() => (props.alertMode === 'contactSupport' ? 'warning' : 'highlight'));
</script>

<template>
    <BentoAlert v-if="alertText" :type="alertType" role="alert" variant="tip">
        <template #description>
            {{ alertText }}
        </template>
    </BentoAlert>
</template>
