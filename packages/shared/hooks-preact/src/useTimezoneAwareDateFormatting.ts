import { useCallback, useMemo } from 'preact/hooks';
import useCoreContext from '../../../../src/core/Context/useCoreContext';

const useAtomicTimezoneOperation = <Args extends any[], ReturnValue>(operation: (...args: Args) => ReturnValue) => {
    const { i18n } = useCoreContext();

    return useCallback(
        (...args: Args) => {
            // capture timezone to restore
            const timezoneToRestore = i18n.timezone;
            try {
                // perform timezone operation
                return operation(...args);
            } finally {
                // restore timezone
                i18n.timezone = timezoneToRestore;
            }
        },
        [i18n, operation]
    );
};

const useActiveTimezone = (timezone?: string) => {
    const { i18n } = useCoreContext();

    const getActiveTimezone = useAtomicTimezoneOperation(
        useCallback(() => {
            // first reset to system timezone,
            // then attempt to set the specified timezone,
            // will fail silently if specified timezone is invalid
            // eslint-disable-next-line react-hooks/immutability
            i18n.timezone = undefined;
            i18n.timezone = timezone;
            return i18n.timezone!;
        }, [i18n, timezone])
    );

    return useMemo(getActiveTimezone, [getActiveTimezone]);
};

const useTimezoneAwareDateFormatting = (timezone?: string) => {
    const { i18n } = useCoreContext();
    const activeTimezone = useActiveTimezone(timezone);

    const dateFormat = useAtomicTimezoneOperation(
        useCallback<(typeof i18n)['date']>(
            (...args) => {
                // eslint-disable-next-line react-hooks/immutability
                i18n.timezone = activeTimezone;
                return i18n.date(...args);
            },
            [i18n, activeTimezone]
        )
    );

    const fullDateFormat = useAtomicTimezoneOperation(
        useCallback<(typeof i18n)['fullDate']>(
            (...args) => {
                // eslint-disable-next-line react-hooks/immutability
                i18n.timezone = activeTimezone;
                return i18n.fullDate(...args);
            },
            [i18n, activeTimezone]
        )
    );

    return { dateFormat, fullDateFormat } as const;
};

export default useTimezoneAwareDateFormatting;
