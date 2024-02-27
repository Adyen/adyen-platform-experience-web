import { ErrorMessageDisplay } from '@src/components/internal/ErrorMessageDisplay/ErrorMessageDisplay';
import AdyenFPError from '@src/core/Errors/AdyenFPError';
import { TranslationKey } from '@src/core/Localization/types';

type ErrorMessage = {
    title: TranslationKey;
    message?: TranslationKey | TranslationKey[];
    refreshComponent?: boolean;
    onContactSupport?: () => void;
};

const UNDEFINED_ERROR = { title: 'thereWasAnUnexpectedError', message: ['pleaseReachOutToSupportForAssistance'] } satisfies ErrorMessage;
const getErrorMessage = (error: AdyenFPError | undefined, onContactSupport?: () => void): ErrorMessage => {
    if (!error) return UNDEFINED_ERROR;
    switch (error.errorCode) {
        case undefined:
            return {
                title: 'somethingWentWrong',
                message: ['seemsLikeThereIsANetworkError', 'tryToRefreshThePageOrComeBackLater'],
                refreshComponent: true,
            };
        case '00_500':
            return {
                title: 'noResultsFoundSeekSupport',
                message: ['seemsLikeThereIsAndInternalError', 'pleaseReachOutToSupportForAssistance'],
                onContactSupport,
            };
        case '29_001':
            return {
                title: 'theRequestIsMissingRequiredFieldsOrContainsInvalidData',
                message: ['pleaseReachOutToSupportForAssistance'],
                onContactSupport,
            };
        case '00_403':
        default:
            return UNDEFINED_ERROR;
    }
};
const TransactionListError = ({ error, onContactSupport }: { error: AdyenFPError | undefined; onContactSupport?: () => void }) => {
    const { title, message, refreshComponent } = getErrorMessage(error, onContactSupport);

    return (
        <ErrorMessageDisplay
            title={title}
            message={message}
            withImage
            centered
            refreshComponent={refreshComponent}
            onContactSupport={onContactSupport}
        />
    );
};

export default TransactionListError;
