import type { ExternalComponentType } from '@integration-components/types';
import type { SetupContextObject } from '../../ConfigContext.types';
import type { AuthSession } from '../../session/AuthSession';
import type { V2TranslationDomain } from '../Context/types';

export interface ConfigContextValue {
    readonly endpoints: SetupContextObject['endpoints'];
    readonly extraConfig: SetupContextObject['extraConfig'];
    readonly hasError: boolean;
    readonly refreshing: boolean;
    refresh: AuthSession['refresh'];
}

export interface ConfigProviderProps {
    session: AuthSession;
    type?: ExternalComponentType;
    translationDomain: V2TranslationDomain;
}
