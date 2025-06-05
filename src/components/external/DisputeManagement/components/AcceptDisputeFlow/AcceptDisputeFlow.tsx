import Typography from '../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import ButtonActions from '../../../../internal/Button/ButtonActions/ButtonActions';
import { ButtonVariant } from '../../../../internal/Button/types';
import { useCallback, useRef, useState } from 'preact/hooks';
import { useConfigContext } from '../../../../../core/ConfigContext';
import useMutation from '../../../../../hooks/useMutation/useMutation';
import { EMPTY_OBJECT, uniqueId } from '../../../../../utils';
import Button from '../../../../internal/Button';
import Icon from '../../../../internal/Icon';
import './AcceptDisputeFlow.scss';
import { useDisputeFlow } from '../../context/dispute/context';

export const AcceptDisputeFlow = ({ onAcceptDispute }: { onAcceptDispute?: () => void }) => {
    const { i18n } = useCoreContext();
    const { acceptDispute } = useConfigContext().endpoints;
    const { dispute, setFlowState, clearStates, goBack } = useDisputeFlow();

    const disputeId = dispute?.dispute.pspReference;

    const [disputeAccepted, setDisputeAccepted] = useState(false);
    const [termsAgreed, setTermsAgreed] = useState(false);

    const goBackToDetails = useCallback(() => setFlowState('details'), [setFlowState]);
    const toggleTermsAgreement = useCallback(() => setTermsAgreed(prev => !prev), []);
    const termsAgreementInputId = useRef(uniqueId()).current;

    const acceptDisputeMutation = useMutation({
        queryFn: acceptDispute,
        options: {
            onSuccess: useCallback(() => {
                clearStates();
                setDisputeAccepted(true);
                onAcceptDispute?.();
            }, [clearStates, onAcceptDispute]),
        },
    });

    const acceptDisputeCallback = useCallback(() => {
        void acceptDisputeMutation.mutate(EMPTY_OBJECT, { path: { disputePspReference: disputeId! } });
    }, [disputeId, acceptDisputeMutation]);

    return (
        <div className="adyen-pe-accept-dispute__container">
            {disputeAccepted ? (
                <div className="adyen-pe-accept-dispute__success">
                    <Icon name="checkmark-circle-fill" className="adyen-pe-accept-dispute__success-icon" />
                    <Typography variant={TypographyVariant.TITLE}>{i18n.get('disputes.accept.disputeAccepted')}</Typography>
                    <Button variant={ButtonVariant.SECONDARY} onClick={goBackToDetails}>
                        {i18n.get('disputes.showDisputeDetails')}
                    </Button>
                </div>
            ) : (
                <>
                    <Typography className="adyen-pe-accept-dispute__title" variant={TypographyVariant.TITLE} medium>
                        {dispute?.dispute.type === 'REQUEST_FOR_INFORMATION'
                            ? i18n.get('disputes.accept.requestForInformation')
                            : i18n.get('disputes.accept.chargeback')}
                    </Typography>
                    <Typography variant={TypographyVariant.BODY} medium>
                        {i18n.get('disputes.accept.disputeDisclaimer')}
                    </Typography>
                    <div className="adyen-pe-accept-dispute__input">
                        <input type="checkbox" className="adyen-pe-visually-hidden" id={termsAgreementInputId} onInput={toggleTermsAgreement} />

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
                                    title:
                                        dispute?.dispute.type === 'REQUEST_FOR_INFORMATION'
                                            ? i18n.get('disputes.accept')
                                            : i18n.get('disputes.accept.chargeback'),
                                    event: acceptDisputeCallback,
                                    variant: ButtonVariant.PRIMARY,
                                    state: acceptDisputeMutation.isLoading ? 'loading' : 'default',
                                    disabled: !termsAgreed,
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
