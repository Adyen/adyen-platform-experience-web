import { ErrorMessageDisplay } from '@src/components/internal/ErrorMessageDisplay/ErrorMessageDisplay';
import AdyenFPError from '@src/core/Errors/AdyenFPError';
import { TranslationKey } from '@src/core/Localization/types';

type ErrorMessage = {
    title: TranslationKey;
    message?: TranslationKey | TranslationKey[];
};

const UNDEFINED_ERROR = { title: 'thereWasAnUnexpectedError', message: ['pleaseReachOutToSupportForAssistance'] } satisfies ErrorMessage;
const getErrorMessage = (error: AdyenFPError | undefined): ErrorMessage => {
    if (!error) return UNDEFINED_ERROR;
    switch (error.errorCode) {
        case undefined:
            return {
                title: 'somethingWentWrong',
                message: ['seemsLikeThereIsANetworkError', 'tryToRefreshThePageOrComeBackLater'],
            };
        case '00_500':
            return {
                title: 'noResultsFoundSeekSupport',
                message: ['seemsLikeThereIsAndInternalError', 'pleaseReachOutToSupportForAssistance'],
            };
        case '29_001':
            return {
                title: 'theRequestIsMissingRequiredFieldsOrContainsInvalidData',
                message: ['pleaseReachOutToSupportForAssistance'],
            };
        default:
            return UNDEFINED_ERROR;
    }
};
const TransactionListError = ({ error }: { error: AdyenFPError | undefined }) => {
    const { title, message } = getErrorMessage(error);

    return <ErrorMessageDisplay title={title} message={message} withImage centered refreshComponent />;
};

export default TransactionListError;
