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
    onBack,
    error,
    onContactSupport,
    emptyGrantOffer,
}: {
    onBack: () => void;
    error: Error | AdyenErrorResponse | null;
    onContactSupport?: () => void;
    emptyGrantOffer?: boolean;
}) => {
    const { i18n } = useCoreContext();

    const onBackButton = useCallback(
        () => (
            <Button variant={ButtonVariant.SECONDARY} onClick={onBack}>
                {i18n.get('back')}
            </Button>
        ),
        [i18n, onBack]
    );

    const capitalError = useMemo(() => {
        if (emptyGrantOffer) {
            return new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'EmptyConfig', 'Empty Configuration', 'EMPTY_CONFIG');
        }
        return error;
    }, [emptyGrantOffer, error]);
    return (
        <ErrorMessageDisplay
            absolutePosition={false}
            withImage
            renderSecondaryButton={onBackButton}
            outlined={false}
            {...getCapitalErrorMessage(capitalError as AdyenPlatformExperienceError, onContactSupport)}
        />
    );
};
