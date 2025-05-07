import { useMemo } from 'preact/hooks';
import { useDisputeFlow } from '../../context/dispute/context';
import { DisputeDetailsCustomization } from '../../types';
import { AcceptDisputeFlow } from '../AcceptDisputeFlow/AcceptDisputeFlow';
import { DefendDisputeFlow } from '../DefendDisputeFlow/DefendDisputeFlow';
import DisputeData from '../DisputesData/DisputeData';

export const DisputeDetails = ({
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

    const isDefendFlow = useMemo(
        () => ['defendReasonSelectionView', 'uploadDefenseFilesView', 'defenseSubmitResponseView'].includes(flowState),
        [flowState]
    );

    if (isDefendFlow) {
        return <DefendDisputeFlow onDefendDispute={onDefendDispute} />;
    }

    switch (flowState) {
        case 'details':
            return <DisputeData disputeId={disputeId} dataCustomization={dataCustomization} />;
        case 'accept':
            return <AcceptDisputeFlow disputeId={disputeId} onBack={goBack} onAcceptDispute={onAcceptDispute} />;
        default:
            return null;
    }
};
