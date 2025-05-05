import { useDisputeFlow } from '../../context/dispute/context';
import { DisputeDetailsCustomization } from '../../types';
import { AcceptDisputeFlow } from '../AcceptDisputeFlow/AcceptDisputeFlow';
import { DefendDisputeFlow } from '../DefendDisputeFlow/DefendDisputeFlow';
import DisputeData from '../DisputesData/DisputeData';

export const DisputeDetailsContainer = ({
    disputeId,
    onDefendDispute,
    onAcceptDispute,
    dataCustomization,
}: {
    disputeId: string;
    onAcceptDispute?: () => void;
    onDefendDispute?: () => void;
    dataCustomization?: { details?: DisputeDetailsCustomization };
}) => {
    const { flowState, goBack } = useDisputeFlow();

    switch (flowState) {
        case 'details':
            return <DisputeData disputeId={disputeId} dataCustomization={dataCustomization} />;
        case 'accept':
            return <AcceptDisputeFlow disputeId={disputeId} onBack={goBack} onAcceptDispute={onAcceptDispute} />;
        case 'defendReasonSelectionView':
        case 'uploadDefenseFilesView':
        case 'defenseSubmitResponseView':
            return <DefendDisputeFlow onDefendDispute={onDefendDispute} />;
        default:
            return null;
    }
};
