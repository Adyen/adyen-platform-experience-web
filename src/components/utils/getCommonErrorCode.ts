import AdyenPlatformExperienceError from '../../core/Errors/AdyenPlatformExperienceError';
import { TranslationKey } from '../../translations';
import { JSXInternal } from 'preact/src/jsx';

export type ErrorMessage = {
    title: TranslationKey;
    message?: TranslationKey | TranslationKey[];
    refreshComponent?: boolean;
    onContactSupport?: () => void;
    translationValues?: { [k in TranslationKey]?: JSXInternal.Element | null };
    images?: {
        desktop: any;
        mobile?: any;
    };
};

export const UNDEFINED_ERROR = {
    title: 'common.errors.unexpected',
    message: ['common.errors.contactSupport'],
} satisfies ErrorMessage;

export const getCommonErrorMessage = (error: AdyenPlatformExperienceError | undefined, onContactSupport?: () => void): ErrorMessage | null => {
    if (!error) return null;

    switch (error.errorCode) {
        case '29_001':
            return {
                title: 'common.errors.requestInvalid',
                message: ['common.errors.contactSupport'],
                onContactSupport,
            };
        case '30_112':
            return {
                title: 'common.errors.notFound',
                message: ['transactions.details.errors.notFound'],
                onContactSupport,
            };
        case '00_403':
            return UNDEFINED_ERROR;
        default:
            return null;
    }
};
