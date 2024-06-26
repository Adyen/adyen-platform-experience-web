import AdyenPlatformExperienceError from '../../core/Errors/AdyenPlatformExperienceError';
import { TranslationKey } from '../../core/Localization/types';
import { JSXInternal } from 'preact/src/jsx';

export type ErrorMessage = {
    title: TranslationKey;
    message?: TranslationKey | TranslationKey[];
    refreshComponent?: boolean;
    onContactSupport?: () => void;
    translationValues?: { [k in TranslationKey]?: JSXInternal.Element | null };
};

export const UNDEFINED_ERROR = { title: 'thereWasAnUnexpectedError', message: ['pleaseReachOutToSupportForAssistance'] } satisfies ErrorMessage;

export const getCommonErrorMessage = (error: AdyenPlatformExperienceError | undefined, onContactSupport?: () => void): ErrorMessage | null => {
    if (!error) return null;
    switch (error.errorCode) {
        case '29_001':
            return {
                title: 'theRequestIsMissingRequiredFieldsOrContainsInvalidData',
                message: ['pleaseReachOutToSupportForAssistance'],
                onContactSupport,
            };
        case '30_112':
            return {
                title: 'entityWasNotFound',
                message: ['entityWasNotFoundDetail'],
                onContactSupport,
            };
        case '00_403':
            return UNDEFINED_ERROR;
        default:
            return null;
    }
};
