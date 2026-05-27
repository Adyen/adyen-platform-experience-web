import { ErrorMessageDisplay } from '../ErrorMessageDisplay/ErrorMessageDisplay';
import { getErrorMessage } from '../utils/getErrorMessage';
import AdyenPlatformExperienceError from '@integration-components/core/AdyenPlatformExperienceError';
import { TranslationKey } from '@integration-components/core';

const DataOverviewError = ({
    error,
    errorMessage,
    onContactSupport,
}: {
    error: AdyenPlatformExperienceError | undefined;
    errorMessage: TranslationKey;
    onContactSupport?: () => void;
}) => {
    const {
        title,
        message,
        refreshComponent,
        translationValues,
        onContactSupport: ContactSupport,
    } = getErrorMessage(error, errorMessage, onContactSupport);
    return (
        <ErrorMessageDisplay
            withHeaderOffset
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

export default DataOverviewError;
