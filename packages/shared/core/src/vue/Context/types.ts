import type { Ref } from 'vue';
import type { I18n } from '../../Localization/types';
import type { DevEnvironment, OnErrorHandler } from '../../types';
import type { GlobalAppearance } from '@integration-components/types';
import type { TranslationDomain } from '../../translations';

export type { OnErrorHandler } from '../../types';
export type { DomainCustomTranslations, DomainTranslationKey, TranslationDomain } from '../../translations';
export { getDomainTranslationKey } from '../../translations';
export type { I18n };

export interface DomainTranslationBinding {
    i18n: I18n;
    translationDomain: TranslationDomain;
}

export interface CommonPropsTypes {
    isCollatingErrors?: boolean;
}

export interface AssetOptions {
    name: string;
    extension?: string;
    subFolder?: string;
}

export interface CoreProviderProps {
    commonProps?: CommonPropsTypes;
    /**
     * The resolved appearance of the mounted component. Typed as the base shape because each
     * component opts in to its own extensions (e.g. `dataGrid`); read those through type guards
     * such as `hasDataGridAppearance`.
     */
    appearance?: GlobalAppearance;
    i18n?: I18n;
    translationDomain: TranslationDomain;
    loadingContext?: string;
    refreshComponent?: () => void;
    externalErrorHandler?: OnErrorHandler | null;
    componentRef?: Ref<HTMLDivElement | null>;
    getImageAsset?: (props: AssetOptions) => string;
    getDatasetAsset?: (props: AssetOptions) => string;
    getCdnConfig?: <Fallback>(props: { name: string; extension?: string; subFolder?: string; fallback?: Fallback }) => Promise<Fallback>;
    getCdnDataset?: <Fallback>(props: { name: string; extension?: string; subFolder?: string; fallback?: Fallback }) => Promise<Fallback>;
    environment?: DevEnvironment;
}

export interface CoreContextValue extends CoreProviderProps {
    i18n: I18n;
}
