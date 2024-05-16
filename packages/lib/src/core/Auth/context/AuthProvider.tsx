import { toChildArray } from 'preact';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { EVT_SESSION_ACTIVE_STATE_CHANGE, EVT_SESSION_INIT_STATE_CHANGE } from '../../../primitives/session';
import { AuthSession, AuthSessionSetupContext, EVT_SETUP_INIT_STATE_CHANGE } from '../session';
import type { AuthContextProps, AuthProviderProps } from './types';
import { AuthContext } from './AuthContext';

const session = new AuthSession();
const setup = new AuthSessionSetupContext(session);

const _getAuthProviderContext = () => {
    const { endpoints, hasError: hasSetupError } = setup;
    const { hasError: hasSessionError, http, initializing, isExpired } = session;
    return { endpoints, http, initializing, isExpired, hasError: hasSessionError || hasSetupError } as const;
};

export const AuthProvider = ({ children, loadingContext, onSessionCreate }: AuthProviderProps) => {
    const [version, setVersion] = useState(0);
    const bumpVersion = useCallback(() => setVersion(version => version + 1), [setVersion]);
    const context = useMemo<AuthContextProps>(_getAuthProviderContext, [version]);

    useEffect(() => {
        setup.loadingContext = loadingContext;
        setup.onSessionCreate = onSessionCreate;
        session.refresh().then(bumpVersion, bumpVersion);
    }, [bumpVersion, loadingContext, onSessionCreate]);

    useEffect(() => {
        const offActive = session.on(EVT_SESSION_ACTIVE_STATE_CHANGE, bumpVersion);
        const offInit = session.on(EVT_SESSION_INIT_STATE_CHANGE, bumpVersion);
        const offSetupInit = setup.on(EVT_SETUP_INIT_STATE_CHANGE, bumpVersion);

        return () => {
            offActive();
            offInit();
            offSetupInit();
        };
    }, [bumpVersion]);

    return <AuthContext.Provider value={context}>{toChildArray(children)}</AuthContext.Provider>;
};

export default AuthProvider;
