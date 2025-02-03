import { getCapitalErrorMessage } from '../../../../utils/capital/getCapitalErrorMessage';
import AdyenPlatformExperienceError from '../../../../../core/Errors/AdyenPlatformExperienceError';
import { ErrorMessageDisplay } from '../../../../internal/ErrorMessageDisplay/ErrorMessageDisplay';
import { useCallback, useMemo } from 'preact/hooks';
import Button from '../../../../internal/Button/Button';
import { ButtonVariant } from '../../../../internal/Button/types';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { AdyenErrorResponse } from '../../../../../core/Http/types';
import { ErrorTypes } from '../../../../../core/Http/utils';

export const CapitalErrorMessageDisplay = ({
    emptyGrantOffer,
    error,
    onContactSupport,
    onBack,
    regionError,
}: {
    emptyGrantOffer?: boolean;
    error?: Error | AdyenErrorResponse;
    onBack?: () => void;
    onContactSupport?: () => void;
    regionError?: boolean;
}) => {
    const { i18n } = useCoreContext();

    const renderSecondaryButton = useCallback(
        () => (
            <>
                {onBack && (
                    <Button variant={ButtonVariant.SECONDARY} onClick={onBack}>
                        {i18n.get('back')}
                    </Button>
                )}
            </>
        ),
        [i18n, onBack]
    );

    const capitalError = useMemo(() => {
        if (regionError) {
            return new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'UnsupportedRegion', 'Unsupported Region Configuration', 'UNSUPPORTED_REGION');
        }
        if (emptyGrantOffer) {
            return new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'EmptyConfig', 'Empty Configuration', 'EMPTY_CONFIG');
        }
        return error;
    }, [emptyGrantOffer, regionError, error]);
    return (
        <ErrorMessageDisplay
            absolutePosition={false}
            withImage
            renderSecondaryButton={renderSecondaryButton}
            outlined={false}
            {...getCapitalErrorMessage(capitalError as AdyenPlatformExperienceError, onContactSupport)}
        />
    );
};
