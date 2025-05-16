import useCoreContext from '../../../../../core/Context/useCoreContext';
import { TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import type { ExternalUIComponentProps } from '../../../../types';
import { useDisputeFlow } from '../../context/dispute/context';
import { DisputeManagementProps } from '../../types';
import { AcceptDisputeFlow } from '../AcceptDisputeFlow/AcceptDisputeFlow';
import { DefendDisputeFlow } from '../DefendDisputeFlow/DefendDisputeFlow';
import DisputeData from '../DisputesData/DisputeData';

export const DisputeDetails = ({
    id,
    hideTitle,
    onDefendDispute,
    onAcceptDispute,
    dataCustomization,
    onContactSupport,
}: ExternalUIComponentProps<DisputeManagementProps>) => {
    const { flowState } = useDisputeFlow();
    const { i18n } = useCoreContext();

    switch (flowState) {
        case 'details':
            return (
                <>
                    {!hideTitle && (
                        <Typography variant={TypographyVariant.TITLE} medium>
                            {i18n.get('dispute.management')}
                        </Typography>
                    )}
                    <DisputeData disputeId={id} dataCustomization={dataCustomization} onContactSupport={onContactSupport} />
                </>
            );
        case 'accept':
            return <AcceptDisputeFlow onAcceptDispute={onAcceptDispute} />;
        case 'defendReasonSelectionView':
        case 'defenseSubmitResponseView':
        case 'uploadDefenseFilesView':
            return <DefendDisputeFlow onDefendDispute={onDefendDispute} />;
        default:
            return null;
    }
};
