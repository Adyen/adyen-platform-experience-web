import useCoreContext from '../../../core/Context/useCoreContext';
import useTimezoneAwareDateFormatting from '../../../hooks/useTimezoneAwareDateFormatting';
import { useMemo } from 'preact/hooks';
import { DATE_FORMAT_MISSING_ACTION } from '../../../constants';

export const useActionsAlertTitles = (expirationDate?: string) => {
    const { i18n } = useCoreContext();
    const { dateFormat } = useTimezoneAwareDateFormatting();

    const formattedExpirationDate = useMemo(
        () => (expirationDate ? dateFormat(expirationDate, DATE_FORMAT_MISSING_ACTION) : undefined),
        [dateFormat, expirationDate]
    );
    return {
        single: formattedExpirationDate
            ? i18n.get('capital.overview.grants.item.alerts.actionNeededBy', {
                  values: { date: formattedExpirationDate },
              })
            : i18n.get('capital.overview.grants.item.alerts.actionNeeded'),
        multiple: formattedExpirationDate
            ? i18n.get('capital.overview.grants.item.alerts.actionNeededByMany', {
                  values: { date: formattedExpirationDate },
              })
            : i18n.get('capital.overview.grants.item.alerts.actionNeededMany'),
    };
};
