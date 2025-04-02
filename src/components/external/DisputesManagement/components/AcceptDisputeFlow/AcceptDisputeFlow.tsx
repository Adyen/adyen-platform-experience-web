import Typography from '../../../../internal/Typography/Typography';
import { TypographyVariant } from '../../../../internal/Typography/types';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { useDisputeFlow } from '../../hooks/useDisputeFlow';
import ButtonActions from '../../../../internal/Button/ButtonActions/ButtonActions';
import { ButtonVariant } from '../../../../internal/Button/types';
import './AcceptDisputeFlow.scss';

export const AcceptDisputeFlow = ({ disputeId, onBack, onAcceptDispute }: { disputeId: string; onBack: () => void; onAcceptDispute: () => void }) => {
    const { i18n } = useCoreContext();
    const { dispute } = useDisputeFlow();

    return (
        <div className="adyen-pe-accept-dispute__container">
            <div className="adyen-pe-accept-dispute__information">
                <Typography variant={TypographyVariant.TITLE} medium>
                    {i18n.get('disputes.areYouSureYouWantToAcceptDispute')}
                </Typography>
                {dispute && (
                    <Typography variant={TypographyVariant.BODY}>
                        {i18n.get('disputes.ifYouAcceptTheAmountWillNotBeBackInYourAccount', {
                            values: { amount: i18n.amount(dispute?.amount.value, dispute?.amount.currency) },
                        })}
                    </Typography>
                )}
            </div>
            <div className="adyen-pe-accept-dispute__actions">
                <ButtonActions
                    actions={[
                        {
                            title: i18n.get('disputes.acceptDispute'),
                            event: onAcceptDispute,
                            variant: ButtonVariant.PRIMARY,
                        },
                        {
                            title: i18n.get('disputes.goBack'),
                            event: onBack,
                            variant: ButtonVariant.SECONDARY,
                        },
                    ]}
                />
            </div>
        </div>
    );
};
