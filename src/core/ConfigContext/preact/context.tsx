import { createContext, toChildArray } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';
import { ErrorMessageDisplay } from '../../../components/internal/ErrorMessageDisplay/ErrorMessageDisplay';
import { AuthSession } from '../session/AuthSession';
import { componentAvailabilityErrors } from '../session/utils/sessionAwareComponentAvailability';
import { createConfigContextValue, checkComponentPermission, subscribeToSession } from '../setupConfig';
import { asyncNoop, EMPTY_OBJECT, isUndefined, noop } from '../../../utils';
import type { ConfigProviderProps } from '../types';

const ConfigContext = createContext<AuthSession['context'] & Pick<AuthSession, 'http' | 'refresh'>>({
    endpoints: EMPTY_OBJECT,
    extraConfig: EMPTY_OBJECT,
    hasError: false,
    http: asyncNoop,
    isExpired: undefined,
    isFrozen: false,
    refresh: noop,
    refreshing: false,
});

export const ConfigProvider = ({ children, session, type }: ConfigProviderProps) => {
    const [, setContextCounter] = useState(0);
    const [unsubscribeCounter, setUnsubscribeCounter] = useState(0);
    const [hasPermission, setHasPermission] = useState<undefined | boolean>();

    useEffect(() => {
        checkComponentPermission(type, session).then(setHasPermission);
    }, [session, type]);

    useEffect(() => {
        return subscribeToSession(session, {
            onContextChange: () => setContextCounter(count => count + 1),
            onUnsubscribe: () => setUnsubscribeCounter(count => count + 1),
        });
    }, [session, unsubscribeCounter]);

    return (
        <ConfigContext.Provider value={createConfigContextValue(session)}>
            {!isUndefined(hasPermission) &&
                (hasPermission ? (
                    toChildArray(children)
                ) : (
                    <ErrorMessageDisplay
                        withImage
                        centered
                        title={'common.errors.somethingWentWrong'}
                        message={[componentAvailabilityErrors(type), 'common.errors.contactSupport']}
                    />
                ))}
        </ConfigContext.Provider>
    );
};

export const useConfigContext = () => useContext(ConfigContext);
export default useConfigContext;
