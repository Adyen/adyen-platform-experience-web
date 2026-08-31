<script setup lang="ts">
import { computed } from 'vue';
import { BentoAlert } from '@adyen/bento-vue3';
import { useDisputesContext } from '../../integration/context';
import { DATE_FORMAT_RESPONSE_DEADLINE } from '@integration-components/utils';
import { BASE_LOCALE } from '@integration-components/utils/datetime/restamper/constants';
import type { IDisputeDetail } from '@integration-components/types/api/models/disputes';
import type { DisputeDataAlertMode } from '../types';

const props = defineProps<{
    alertMode: DisputeDataAlertMode;
    dispute: IDisputeDetail;
}>();

const { i18n } = useDisputesContext();
const activeTimezone = computed(() => {
    const timezone = props.dispute.payment.balanceAccount?.timeZone;
    if (!timezone) return i18n.timezone;
    try {
        return new Intl.DateTimeFormat(BASE_LOCALE, { timeZone: timezone }).resolvedOptions().timeZone;
    } catch {
        return i18n.timezone;
    }
});

const dateFormat: typeof i18n.date = (date, options) => i18n.date(date, { timeZone: activeTimezone.value, ...options });

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
    <BentoAlert v-if="alertText" :type="alertType" variant="tip">
        <template #description>
            {{ alertText }}
        </template>
    </BentoAlert>
</template>
