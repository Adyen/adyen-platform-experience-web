import { ErrorMessageDisplay } from '../ErrorMessageDisplay/ErrorMessageDisplay';
import { getErrorMessage } from '../../utils/getDataOverviewResourceErrorCode';
import AdyenPlatformExperienceError from '../../../core/Errors/AdyenPlatformExperienceError';
import { TranslationKey } from '../../../core/Localization/types';

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
