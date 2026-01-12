import { getCapitalErrorMessage } from '../../../../../utils/capital/getCapitalErrorMessage';
import AdyenPlatformExperienceError from '../../../../../../core/Errors/AdyenPlatformExperienceError';
import { ErrorMessageDisplay } from '../../../../../internal/ErrorMessageDisplay/ErrorMessageDisplay';
import { useCallback, useMemo } from 'preact/hooks';
import Button from '../../../../../internal/Button/Button';
import { ButtonVariant } from '../../../../../internal/Button/types';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import { AdyenErrorResponse } from '../../../../../../core/Http/types';
import { ErrorTypes } from '../../../../../../core/Http/utils';

export const CapitalErrorMessageDisplay = ({
    emptyGrantOffer,
    error,
    onContactSupport,
    onBack,
    unsupportedRegion,
}: {
    emptyGrantOffer?: boolean;
    error?: Error | AdyenErrorResponse;
    onBack?: () => void;
    onContactSupport?: () => void;
    unsupportedRegion?: boolean;
}) => {
    const { i18n } = useCoreContext();

    const renderSecondaryButton = useCallback(
        () => (
            <>
                {onBack && (
                    <Button variant={ButtonVariant.SECONDARY} onClick={onBack}>
                        {i18n.get('capital.common.actions.goBack')}
                    </Button>
                )}
            </>
        ),
        [i18n, onBack]
    );

    const capitalError = useMemo(() => {
        if (unsupportedRegion) {
            return new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'UnsupportedRegion', 'Unsupported Region Configuration', 'UNSUPPORTED_REGION');
        }
        if (emptyGrantOffer) {
            return new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'EmptyConfig', 'Empty Configuration', 'EMPTY_CONFIG');
        }
        return error;
    }, [emptyGrantOffer, unsupportedRegion, error]);
    return (
        <ErrorMessageDisplay
            absolutePosition={false}
            withImage
            onContactSupport={onContactSupport}
            renderSecondaryButton={renderSecondaryButton}
            outlined={false}
            {...getCapitalErrorMessage(capitalError as AdyenPlatformExperienceError, onContactSupport)}
        />
    );
};
