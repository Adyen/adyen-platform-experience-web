import CopyText from '@src/components/internal/CopyText/CopyText';
import AdyenFPError from '@src/core/Errors/AdyenFPError';
import { TranslationKey } from '@src/core/Localization/types';
import { JSXInternal } from 'preact/src/jsx';

type ErrorMessage = {
    title: TranslationKey;
    message?: TranslationKey | TranslationKey[];
    refreshComponent?: boolean;
    onContactSupport?: () => void;
    translationValues?: { [k in TranslationKey]: JSXInternal.Element | null };
};

const UNDEFINED_ERROR = { title: 'thereWasAnUnexpectedError', message: ['pleaseReachOutToSupportForAssistance'] } satisfies ErrorMessage;
export const getErrorMessage = (error: AdyenFPError | undefined, onContactSupport?: () => void): ErrorMessage => {
    if (!error) return UNDEFINED_ERROR;
    switch (error.errorCode) {
        case undefined:
            return {
                title: 'somethingWentWrong',
                message: ['weCouldNotLoadYourTransactions', 'tryRefreshingThePageOrComeBackLater'],
                refreshComponent: true,
            };
        case '00_500':
            return {
                title: 'somethingWentWrong',
                message: onContactSupport
                    ? ['weCouldNotLoadYourTransactions', 'theErrorCodeIs']
                    : ['weCouldNotLoadYourTransactions', 'contactSupportForHelpAndShareErrorCode'],
                onContactSupport,
                translationValues: onContactSupport
                    ? ({ theErrorCodeIs: error.requestId ? <CopyText text={error.requestId} /> : null } as {
                          [k in TranslationKey]: JSXInternal.Element;
                      })
                    : ({ contactSupportForHelpAndShareErrorCode: error.requestId ? <CopyText text={error.requestId} /> : null } as {
                          [k in TranslationKey]: JSXInternal.Element;
                      }),
            };
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
        default:
            return UNDEFINED_ERROR;
    }
};
