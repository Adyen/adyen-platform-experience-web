import { ErrorMessageDisplay } from '../../../../internal/ErrorMessageDisplay/ErrorMessageDisplay';
import { getErrorMessage } from '../../../../utils/transactionResourceErrorCodes';
import AdyenPlatformExperienceError from '../../../../../core/Errors/AdyenPlatformExperienceError';

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
