import { useDisputeFlow } from '../../hooks/useDisputeFlow';
import { DisputeDetailsCustomization } from '../../types';
import { AcceptDisputeFlow } from '../AcceptDisputeFlow/AcceptDisputeFlow';
import DisputeData from '../DisputesData/DisputeData';

export const DisputeDetailsContainer = ({
    disputeId,
    onAcceptDispute,
    dataCustomization,
    onContactSupport,
}: {
    disputeId: string;
    onAcceptDispute?: () => void;
    dataCustomization?: { details?: DisputeDetailsCustomization };
    onContactSupport?: () => void;
}) => {
    const { flowState, goBack } = useDisputeFlow();

    switch (flowState) {
        case 'details':
            return <DisputeData disputeId={disputeId} dataCustomization={dataCustomization} onContactSupport={onContactSupport} />;
        case 'accept':
            return <AcceptDisputeFlow disputeId={disputeId} onBack={goBack} onAcceptDispute={onAcceptDispute} />;
        default:
            return null;
    }
};
