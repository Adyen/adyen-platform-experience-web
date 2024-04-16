import { ErrorMessageDisplay } from '@src/components/internal/ErrorMessageDisplay/ErrorMessageDisplay';
import { getErrorMessage } from '@src/components/shared/utils/transactionResourceErrorCodes';
import AdyenPlatformExperienceError from '@src/core/Errors/AdyenPlatformExperienceError';

const TransactionListError = ({ error, onContactSupport }: { error: AdyenPlatformExperienceError | undefined; onContactSupport?: () => void }) => {
    const { title, message, refreshComponent, translationValues, onContactSupport: ContactSupport } = getErrorMessage(error, onContactSupport);

    return (
        <ErrorMessageDisplay
            title={title}
            message={message}
            translationValues={translationValues}
            withImage
            centered
            refreshComponent={refreshComponent}
            onContactSupport={ContactSupport}
        />
    );
};

export default TransactionListError;
