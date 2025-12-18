import type { Dispatch, PropsWithChildren } from 'preact/compat';
import { StateUpdater } from 'preact/hooks';
import { StoreSelectorItemParams } from '../../../../../../internal/StoreSelector/types';

export const enum SettingErrors {
    MISSING_BRAND_NAME,
    MISSING_URL,
    REQUIREMENTS_NOT_ACCEPTED,
    INVALID_URL,
}

export type SettingErrorType = SettingErrors | null;

export interface IPayByLinkSettingsContext {
    payload: any;
    activeMenuItem: string;
    setPayload: (payload: any) => void;
    saveActionCalled: boolean | undefined;
    setActiveMenuItem: Dispatch<StateUpdater<string>>;
    selectedStore: string | undefined;
    setIsValid: (validity: boolean) => void;
    getIsValid: () => boolean;
    setSaveActionCalled: Dispatch<StateUpdater<boolean | undefined>>;
    stores: StoreSelectorItemParams[] | undefined;
    setSelectedStore: Dispatch<StateUpdater<string | undefined>>;
}
