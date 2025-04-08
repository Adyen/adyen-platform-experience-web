import Typography from '../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import ButtonActions from '../../../../internal/Button/ButtonActions/ButtonActions';
import { ButtonVariant } from '../../../../internal/Button/types';
import { useCallback, useRef, useState } from 'preact/hooks';
import { useDisputeFlow } from '../../hooks/useDisputeFlow';
import { useConfigContext } from '../../../../../core/ConfigContext';
import useMutation from '../../../../../hooks/useMutation/useMutation';
import { EMPTY_OBJECT, uniqueId } from '../../../../../utils';
import Button from '../../../../internal/Button';
import Icon from '../../../../internal/Icon';
import './AcceptDisputeFlow.scss';

export const AcceptDisputeFlow = ({
    disputeId,
    onBack,
    onAcceptDispute,
}: {
    disputeId: string;
    onBack: () => void;
    onAcceptDispute?: () => void;
}) => {
    const { i18n } = useCoreContext();
    const { acceptDispute } = useConfigContext().endpoints;
    const { setFlowState } = useDisputeFlow();

    const [disputeAccepted, setDisputeAccepted] = useState(false);
    const [termsAgreed, setTermsAgreed] = useState(false);

    const goBackToDetails = useCallback(() => setFlowState('details'), [setFlowState]);
    const toggleTermsAgreement = useCallback(() => setTermsAgreed(prev => !prev), []);
    const termsAgreementInputId = useRef(uniqueId()).current;

    const acceptDisputeMutation = useMutation({
        queryFn: acceptDispute,
        options: {
            onSuccess: useCallback(() => {
                onAcceptDispute?.();
                setDisputeAccepted(true);
            }, [onAcceptDispute]),
        },
    });

    const acceptDisputeCallback = useCallback(() => {
        void acceptDisputeMutation.mutate(EMPTY_OBJECT, { path: { disputePspReference: disputeId } });
    }, [disputeId, acceptDisputeMutation]);

    return (
        <div className="adyen-pe-accept-dispute__container">
            {disputeAccepted ? (
                <div className="adyen-pe-accept-dispute__success">
                    <Icon name="checkmark-circle-fill" className="adyen-pe-accept-dispute__success-icon" />
                    <Typography variant={TypographyVariant.TITLE}>{i18n.get('disputes.theDisputeHasBeenAccepted')}</Typography>
                    <Button variant={ButtonVariant.SECONDARY} onClick={goBackToDetails}>
                        {i18n.get('disputes.showDisputeDetails')}
                    </Button>
                </div>
            ) : (
                <>
                    <Typography variant={TypographyVariant.TITLE} medium>
                        {i18n.get('disputes.acceptDispute')}
                    </Typography>
                    <Typography variant={TypographyVariant.BODY} medium>
                        {i18n.get('disputes.acceptDisputeDisclaimer')}
                    </Typography>
                    <div className="adyen-pe-accept-dispute__input">
                        <input type="checkbox" id={termsAgreementInputId} onInput={toggleTermsAgreement} />
                        <label htmlFor={termsAgreementInputId}>
                            <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                                {i18n.get('disputes.iAgree')}
                            </Typography>
                        </label>
                    </div>

                    <div className="adyen-pe-accept-dispute__actions">
                        <ButtonActions
                            actions={[
                                {
                                    title: i18n.get('disputes.acceptDispute'),
                                    event: acceptDisputeCallback,
                                    variant: ButtonVariant.PRIMARY,
                                    state: acceptDisputeMutation.isLoading ? 'loading' : 'default',
                                    disabled: !termsAgreed,
                                },
                                {
                                    title: i18n.get('disputes.goBack'),
                                    event: onBack,
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
