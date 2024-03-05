import { ErrorMessageDisplay } from '@src/components/internal/ErrorMessageDisplay/ErrorMessageDisplay';
import { getErrorMessage } from '@src/components/utils/transactionResourceErrorCodes';
import AdyenFPError from '@src/core/Errors/AdyenFPError';

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
