import type { CoreProviderProps } from './types';
import Localization from '../Localization';

export interface CoreContextValue {
    i18n: NonNullable<CoreProviderProps['i18n']>;
    commonProps: NonNullable<CoreProviderProps['commonProps']>;
    loadingContext: string;
    updateCore: CoreProviderProps['updateCore'];
    externalErrorHandler: CoreProviderProps['externalErrorHandler'];
    componentRef: CoreProviderProps['componentRef'];
    getImageAsset: CoreProviderProps['getImageAsset'];
    getDatasetAsset: CoreProviderProps['getDatasetAsset'];
    getCdnConfig: CoreProviderProps['getCdnConfig'];
    getCdnDataset: CoreProviderProps['getCdnDataset'];
}

/**
 * Waits for the i18n module to be ready.
 * Framework-agnostic — both Preact and Vue adapters await this before rendering.
 */
export async function waitForI18n(i18n?: Localization['i18n']): Promise<void> {
    await i18n?.ready;
}

/**
 * Assembles the core context value from provider props.
 * Framework-agnostic — used by both Preact and Vue adapters to build the provider value.
 */
export function createCoreContextValue(props: CoreProviderProps): CoreContextValue {
    return {
        i18n: props.i18n ?? new Localization().i18n,
        commonProps: props.commonProps || {},
        loadingContext: props.loadingContext ?? '',
        updateCore: props.updateCore,
        externalErrorHandler: props.externalErrorHandler,
        componentRef: props.componentRef,
        getImageAsset: props.getImageAsset,
        getDatasetAsset: props.getDatasetAsset,
        getCdnConfig: props.getCdnConfig,
        getCdnDataset: props.getCdnDataset,
    };
}
