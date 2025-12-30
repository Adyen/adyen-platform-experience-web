import useCoreContext from '../../../../../core/Context/useCoreContext';
import { useCallback, useMemo } from 'preact/hooks';
import { ButtonVariant } from '../../../../internal/Button/types';
import { ErrorMessageDisplay } from '../../../../internal/ErrorMessageDisplay/ErrorMessageDisplay';
import AdyenPlatformExperienceError from '../../../../../core/Errors/AdyenPlatformExperienceError';
import Button from '../../../../internal/Button/Button';
import { getPaymentLinkErrorMessage } from './getPaymentLinkErrorMessage';

type PaymentLinkErrorProps = {
    error?: AdyenPlatformExperienceError;
    onContactSupport?: () => void;
    onDismiss?: () => void;
};

export const PaymentLinkError = ({ error, onContactSupport, onDismiss }: PaymentLinkErrorProps) => {
    const { i18n } = useCoreContext();

    const renderBackButton = useCallback(() => {
        return (
            <Button variant={ButtonVariant.SECONDARY} onClick={onDismiss}>
                {i18n.get('paymentLinks.details.actions.goBack')}
            </Button>
        );
    }, [i18n, onDismiss]);

    const errorProps = useMemo(
        () => getPaymentLinkErrorMessage(error as AdyenPlatformExperienceError, 'paymentLinks.details.errors.unavailable', onContactSupport),
        [error, onContactSupport]
    );

    return (
        <ErrorMessageDisplay
            renderSecondaryButton={onDismiss ? renderBackButton : undefined}
            withImage
            outlined={false}
            absolutePosition={false}
            withBackground={false}
            {...errorProps}
        />
    );
};
