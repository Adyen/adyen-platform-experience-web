import type { ExternalUIComponentProps } from '../../../../types';
import { useDisputeFlow } from '../../context/dispute/context';
import { Header } from '../../../../internal/Header';
import { DisputeManagementProps } from '../../types';
import { AcceptDisputeFlow } from '../AcceptDisputeFlow/AcceptDisputeFlow';
import { DefendDisputeFlow } from '../DefendDisputeFlow/DefendDisputeFlow';
import DisputeData from '../DisputesData/DisputeData';

export const DisputeDetails = ({
    id,
    hideTitle,
    dataCustomization,
    onContactSupport,
    onDisputeAccept,
    onDisputeDefend,
    onDismiss,
}: ExternalUIComponentProps<DisputeManagementProps>) => {
    const { flowState } = useDisputeFlow();

    switch (flowState) {
        case 'details':
            return (
                <>
                    <Header hideTitle={hideTitle} titleKey="disputes.disputeManagementTitle" />
                    <DisputeData disputeId={id} dataCustomization={dataCustomization} onContactSupport={onContactSupport} onDismiss={onDismiss} />
                </>
            );
        case 'accept':
            return <AcceptDisputeFlow onDisputeAccept={onDisputeAccept} />;
        case 'defendReasonSelectionView':
        case 'defenseSubmitResponseView':
        case 'uploadDefenseFilesView':
            return <DefendDisputeFlow onDisputeDefend={onDisputeDefend} />;
        default:
            return null;
    }
};
