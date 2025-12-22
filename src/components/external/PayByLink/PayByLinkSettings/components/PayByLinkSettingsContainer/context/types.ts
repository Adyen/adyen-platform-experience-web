import type { Dispatch } from 'preact/compat';
import { StateUpdater } from 'preact/hooks';
import { StoreSelectorItemParams } from '../../../../../../internal/StoreSelector/types';
import { IPayByLinkTermsAndConditions, IPayByLinkTheme } from '../../../../../../../types';

export type PayByLinkSettingsPayload = FormData | IPayByLinkTermsAndConditions | undefined;
export type PayByLinkSettingsData = IPayByLinkTermsAndConditions | IPayByLinkTheme | undefined;

export interface IPayByLinkSettingsContext {
    payload: PayByLinkSettingsPayload;
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
    setSavedData: (data: PayByLinkSettingsData) => void;
    savedData: PayByLinkSettingsData;
}
