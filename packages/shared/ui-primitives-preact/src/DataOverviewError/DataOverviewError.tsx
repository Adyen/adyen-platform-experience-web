import { ErrorMessageDisplay } from '../ErrorMessageDisplay/ErrorMessageDisplay';
import { getErrorMessage } from '../../../../../src/components/utils/getErrorMessage';
import AdyenPlatformExperienceError from '../../../../../src/core/Errors/AdyenPlatformExperienceError';
import { TranslationKey } from '../../../../../src/translations';

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
