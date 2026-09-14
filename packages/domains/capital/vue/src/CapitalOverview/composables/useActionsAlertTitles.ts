import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { useTimezoneAwareDateFormatting } from '@integration-components/composables-vue';
import { useCoreContext } from '@integration-components/core/vue';
import { DATE_FORMAT_MISSING_ACTION } from '@integration-components/utils';

export const useActionsAlertTitles = (expirationDate: MaybeRefOrGetter<string | undefined>) => {
    const { i18n } = useCoreContext();
    const { dateFormat } = useTimezoneAwareDateFormatting();

    return computed(() => {
        const date = toValue(expirationDate);
        const formattedExpirationDate = date ? dateFormat(date, DATE_FORMAT_MISSING_ACTION) : undefined;

        return {
            multiple: formattedExpirationDate
                ? i18n.get('capital.overview.grants.item.alerts.actionNeededByMany', { values: { date: formattedExpirationDate } })
                : i18n.get('capital.overview.grants.item.alerts.actionNeededMany'),
            single: formattedExpirationDate
                ? i18n.get('capital.overview.grants.item.alerts.actionNeededBy', { values: { date: formattedExpirationDate } })
                : i18n.get('capital.overview.grants.item.alerts.actionNeeded'),
        };
    });
};
