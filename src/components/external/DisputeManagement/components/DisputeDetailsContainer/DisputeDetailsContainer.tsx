import { useDisputeFlow } from '../../hooks/useDisputeFlow';
import { DisputeDetailsCustomization } from '../../types';
import { AcceptDisputeFlow } from '../AcceptDisputeFlow/AcceptDisputeFlow';
import DisputeData from '../DisputesData/DisputeData';

export const DisputeDetailsContainer = ({
    disputeId,
    onAcceptDispute,
}: {
    disputeId: string;
    onAcceptDispute?: () => void;
    dataCustomization?: { details?: DisputeDetailsCustomization };
}) => {
    const { flowState, goBack } = useDisputeFlow();

    switch (flowState) {
        case 'details':
            return <DisputeData disputeId={disputeId} />;
        case 'accept':
            return <AcceptDisputeFlow disputeId={disputeId} onBack={goBack} onAcceptDispute={onAcceptDispute} />;
        default:
            return null;
    }
};
