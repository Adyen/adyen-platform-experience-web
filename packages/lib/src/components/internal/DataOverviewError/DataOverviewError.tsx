import { ErrorMessageDisplay } from '@src/components/internal/ErrorMessageDisplay/ErrorMessageDisplay';
import { getErrorMessage } from '@src/components/utils/dataOverviewResourceErrorCodes';
import AdyenPlatformExperienceError from '@src/core/Errors/AdyenPlatformExperienceError';
import { TranslationKey } from '@src/core/Localization/types';

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
