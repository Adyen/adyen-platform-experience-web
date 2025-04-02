import { useDisputeFlow } from '../../hooks/useDisputeFlow';
import { AcceptDisputeFlow } from '../AcceptDisputeFlow/AcceptDisputeFlow';
import { useCallback } from 'preact/hooks';
import DisputeData from '../DisputesData/DisputeData';

export const DisputeDetailsContainer = ({ disputeId }: { disputeId: string }) => {
    const { flowState, setFlowState, goBack } = useDisputeFlow();

    const onCompleteAcceptDisputeFlow = useCallback(() => setFlowState('details'), [setFlowState]);

    switch (flowState) {
        case 'details':
            return <DisputeData disputeId={disputeId} />;
        case 'accept':
            return <AcceptDisputeFlow disputeId={disputeId} onBack={goBack} onAcceptDispute={onCompleteAcceptDisputeFlow} />;
        default:
            return null;
    }
};
