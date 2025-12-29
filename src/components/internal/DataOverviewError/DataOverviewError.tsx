import { ErrorMessageDisplay } from '../ErrorMessageDisplay/ErrorMessageDisplay';
import { getErrorMessage } from '../../utils/getErrorMessage';
import AdyenPlatformExperienceError from '../../../core/Errors/AdyenPlatformExperienceError';
import { TranslationKey } from '../../../translations';

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
