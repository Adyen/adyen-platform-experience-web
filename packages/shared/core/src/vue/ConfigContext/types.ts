import type { AuthSession } from '../../session/AuthSession';
import type { SetupContextObject } from '../../ConfigContext.types';

export interface ConfigContextValue {
    readonly endpoints: SetupContextObject['endpoints'];
    readonly extraConfig: SetupContextObject['extraConfig'];
    readonly hasError: boolean;
    readonly refreshing: boolean;
    refresh: () => Promise<void>;
}

export interface ConfigProviderProps {
    session: AuthSession;
}
