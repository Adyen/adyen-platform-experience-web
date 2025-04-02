import Typography from '../../../../internal/Typography/Typography';
import { TypographyVariant } from '../../../../internal/Typography/types';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import ButtonActions from '../../../../internal/Button/ButtonActions/ButtonActions';
import { ButtonVariant } from '../../../../internal/Button/types';
import './AcceptDisputeFlow.scss';
import { useCallback, useState } from 'preact/hooks';
import useMutation from '../../../../../hooks/useMutation/useMutation';
import { useConfigContext } from '../../../../../core/ConfigContext';
import { EMPTY_OBJECT } from '../../../../../utils';
import Icon from '../../../../internal/Icon';
import Button from '../../../../internal/Button';
import { useDisputeFlow } from '../../hooks/useDisputeFlow';

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

    const requestFundsMutation = useMutation({
        queryFn: acceptDispute,
        options: {
            onSuccess: () => {
                onAcceptDispute?.();
                setDisputeAccepted(true);
            },
        },
    });

    const acceptDisputeCallback = useCallback(() => {
        void requestFundsMutation.mutate(EMPTY_OBJECT, { path: { disputePspReference: disputeId } });
    }, [disputeId, requestFundsMutation]);

    const [disputeAccepted, setDisputeAccepted] = useState(false);
    const [termsAgreed, setTermsAgreed] = useState(false);

    const goBackToDetails = useCallback(() => setFlowState('details'), [setFlowState]);

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
                        <span>
                            <input type="checkbox" id={'agreeTerms'} onInput={() => setTermsAgreed(prev => !prev)} />
                        </span>
                        <Typography variant={TypographyVariant.BODY}>
                            <label htmlFor="agreeTerms">{i18n.get('disputes.iAgree')}</label>
                        </Typography>
                    </div>

                    <div className="adyen-pe-accept-dispute__actions">
                        <ButtonActions
                            actions={[
                                {
                                    title: i18n.get('disputes.acceptDispute'),
                                    event: acceptDisputeCallback,
                                    variant: ButtonVariant.PRIMARY,
                                    state: requestFundsMutation.isLoading ? 'loading' : 'default',
                                    disabled: !termsAgreed,
                                },
                                {
                                    title: i18n.get('disputes.goBack'),
                                    event: onBack,
                                    variant: ButtonVariant.SECONDARY,
                                    disabled: requestFundsMutation.isLoading,
                                },
                            ]}
                        />
                    </div>
                </>
            )}
        </div>
    );
};
