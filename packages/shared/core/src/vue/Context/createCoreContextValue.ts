import { shallowReactive } from 'vue';
import Localization from '../../Localization';
import type { CoreContextValue, CoreProviderProps } from './types';

export const createCoreContextValue = (props: CoreProviderProps): CoreContextValue => {
    const fallbackI18n = new Localization().i18n;

    return shallowReactive({
        get i18n() {
            return props.i18n ?? fallbackI18n;
        },
        get commonProps() {
            return props.commonProps || {};
        },
        get appearance() {
            return props.appearance;
        },
        get loadingContext() {
            return props.loadingContext ?? '';
        },
        get refreshComponent() {
            return props.refreshComponent;
        },
        get externalErrorHandler() {
            return props.externalErrorHandler;
        },
        get getImageAsset() {
            return props.getImageAsset;
        },
        get getDatasetAsset() {
            return props.getDatasetAsset;
        },
        get getCdnConfig() {
            return props.getCdnConfig;
        },
        get getCdnDataset() {
            return props.getCdnDataset;
        },
    });
};
