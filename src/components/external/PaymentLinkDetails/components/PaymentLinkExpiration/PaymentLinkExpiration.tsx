import { useCallback, useMemo } from 'preact/hooks';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import { IPaymentLinkDetails } from '../../../../../types';
import ButtonActions from '../../../../../components/internal/Button/ButtonActions/ButtonActions';
import useMutation from '../../../../../hooks/useMutation/useMutation';
import { useConfigContext } from '../../../../../core/ConfigContext';
import { ButtonVariant } from '../../../../internal/Button/types';
import { EMPTY_OBJECT } from '../../../../../utils';
import { useModalContext } from '../../../../internal/Modal/Modal';
import { ButtonActionsList } from '../../../../internal/Button/ButtonActions/types';
import './PaymentLinkExpiration.scss';

const CLASSNAMES = {
    root: 'adyen-pe-payment-link-expiration',
    title: 'adyen-pe-payment-link-expiration__title',
};

type PaymentLinkExpirationProps = {
    paymentLink: IPaymentLinkDetails;
    onCancel: () => void;
    onExpirationSuccess: () => void;
};

export const PaymentLinkExpiration = ({ paymentLink, onCancel, onExpirationSuccess }: PaymentLinkExpirationProps) => {
    const { i18n } = useCoreContext();
    const { withinModal } = useModalContext();
    const titleEl = withinModal ? TypographyElement.H2 : TypographyElement.DIV;

    const { expirePayByLinkPaymentLink } = useConfigContext().endpoints;
    const expirePaymentLinkMutation = useMutation({
        queryFn: expirePayByLinkPaymentLink,
        options: {
            onSuccess: onExpirationSuccess,
        },
    });

    const handleConfirmExpire = useCallback(
        () => expirePaymentLinkMutation.mutate(EMPTY_OBJECT, { path: { paymentLinkId: paymentLink.linkInformation.paymentLinkId } }),
        [expirePaymentLinkMutation, paymentLink.linkInformation.paymentLinkId]
    );

    const actionButtons: ButtonActionsList = useMemo(
        () => [
            {
                title: i18n.get('paymentLinks.details.expiration.actions.confirmExpiration'),
                event: handleConfirmExpire,
                variant: ButtonVariant.PRIMARY,
                disabled: expirePaymentLinkMutation.isLoading,
                state: expirePaymentLinkMutation.isLoading ? 'loading' : 'default',
            },
            {
                title: i18n.get('paymentLinks.details.expiration.actions.cancel'),
                event: onCancel,
                variant: ButtonVariant.SECONDARY,
                disabled: expirePaymentLinkMutation.isLoading,
            },
        ],
        [expirePaymentLinkMutation.isLoading, handleConfirmExpire, i18n, onCancel]
    );

    return (
        <div className={CLASSNAMES.root}>
            <Typography el={titleEl} variant={TypographyVariant.SUBTITLE} stronger>
                {i18n.get('paymentLinks.details.expiration.title')}
            </Typography>

            <Typography variant={TypographyVariant.BODY}>{i18n.get('paymentLinks.details.expiration.description' as any)}</Typography>

            {actionButtons.length > 0 && <ButtonActions actions={actionButtons} />}
        </div>
    );
};
