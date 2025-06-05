import Typography from '../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import ButtonActions from '../../../../internal/Button/ButtonActions/ButtonActions';
import { ButtonVariant } from '../../../../internal/Button/types';
import { useCallback, useRef, useState } from 'preact/hooks';
import { useConfigContext } from '../../../../../core/ConfigContext';
import { useDisputeFlow } from '../../context/dispute/context';
import useMutation from '../../../../../hooks/useMutation/useMutation';
import { DISPUTE_INTERNAL_SYMBOL } from '../../../../utils/disputes/constants';
import { EMPTY_OBJECT, isFunction, uniqueId } from '../../../../../utils';
import { DisputeManagementProps } from '../../types';
import Button from '../../../../internal/Button';
import Icon from '../../../../internal/Icon';
import './AcceptDisputeFlow.scss';

export const AcceptDisputeFlow = ({ onDisputeAccept }: Pick<DisputeManagementProps, 'onDisputeAccept'>) => {
    const { i18n } = useCoreContext();
    const { acceptDispute } = useConfigContext().endpoints;
    const { dispute, clearStates, goBack } = useDisputeFlow();

    const disputeId = dispute?.dispute.pspReference;

    const [termsAgreed, setTermsAgreed] = useState(false);
    const [disputeAccepted, setDisputeAccepted] = useState(false);
    const [showAcceptedConfirmation, setShowAcceptedConfirmation] = useState(false);

    const termsAgreementInputId = useRef(uniqueId()).current;

    const acceptDisputeMutation = useMutation({
        queryFn: acceptDispute,
        options: {
            onSuccess: useCallback(() => {
                clearStates();
                setDisputeAccepted(true);

                if (isFunction(onDisputeAccept)) {
                    const returnValue: unknown = onDisputeAccept({ id: disputeId! });
                    if (returnValue !== DISPUTE_INTERNAL_SYMBOL) return;
                }
                setShowAcceptedConfirmation(true);
            }, [clearStates, disputeId, onDisputeAccept]),
        },
    });

    const interactionsDisabled = acceptDisputeMutation.isLoading || disputeAccepted;

    const acceptDisputeCallback = useCallback(() => {
        if (interactionsDisabled) return;
        void acceptDisputeMutation.mutate(EMPTY_OBJECT, { path: { disputePspReference: disputeId! } });
    }, [interactionsDisabled, disputeId, acceptDisputeMutation]);

    const toggleTermsAgreement = useCallback(() => {
        if (interactionsDisabled) return;
        setTermsAgreed(prev => !prev);
    }, [interactionsDisabled]);

    return (
        <div className="adyen-pe-accept-dispute__container">
            {showAcceptedConfirmation ? (
                <div className="adyen-pe-accept-dispute__success">
                    <Icon name="checkmark-circle-fill" className="adyen-pe-accept-dispute__success-icon" />
                    <Typography variant={TypographyVariant.TITLE}>{i18n.get('disputes.accept.disputeAccepted')}</Typography>
                    <Button variant={ButtonVariant.SECONDARY} onClick={goBack}>
                        {i18n.get('disputes.showDisputeDetails')}
                    </Button>
                </div>
            ) : (
                <>
                    <Typography className="adyen-pe-accept-dispute__title" variant={TypographyVariant.TITLE} medium>
                        {i18n.get('disputes.accept.chargeback')}
                    </Typography>
                    <Typography variant={TypographyVariant.BODY} medium>
                        {i18n.get('disputes.accept.disputeDisclaimer')}
                    </Typography>
                    <div className="adyen-pe-accept-dispute__input">
                        <input
                            type="checkbox"
                            disabled={interactionsDisabled}
                            className="adyen-pe-visually-hidden"
                            id={termsAgreementInputId}
                            onInput={toggleTermsAgreement}
                        />

                        <label className="adyen-pe-accept-dispute__label" htmlFor={termsAgreementInputId}>
                            {termsAgreed ? <Icon name="checkmark-square-fill" /> : <Icon name="square" />}
                            <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                                {i18n.get('disputes.accept.iAgree')}
                            </Typography>
                        </label>
                    </div>

                    <div className="adyen-pe-accept-dispute__actions">
                        <ButtonActions
                            actions={[
                                {
                                    title: i18n.get('disputes.accept.chargeback'),
                                    event: acceptDisputeCallback,
                                    variant: ButtonVariant.PRIMARY,
                                    state: acceptDisputeMutation.isLoading ? 'loading' : 'default',
                                    disabled: interactionsDisabled || !termsAgreed,
                                },
                                {
                                    title: i18n.get('disputes.goBack'),
                                    event: goBack,
                                    variant: ButtonVariant.SECONDARY,
                                    disabled: acceptDisputeMutation.isLoading,
                                },
                            ]}
                        />
                    </div>
                </>
            )}
        </div>
    );
};
