import { useCallback, useState } from 'preact/hooks';
import { DisputeFlowContext, DisputeFlowState } from '../../hooks/useDisputeFlow';
import { DisputeDetailsContainer } from '../DisputeDetailsContainer/DisputeDetailsContainer';
import type { ExternalUIComponentProps } from '../../../../types';
import { DisputeManagementProps } from '../../types';
import '../DisputeDetails/DisputeDetails.scss';
import { IDisputeDetail } from '../../../../../types/api/models/disputes';

export const DisputeDetails = (props: ExternalUIComponentProps<DisputeManagementProps>) => {
    const [flowState, setFlowState] = useState<DisputeFlowState>('details');
    const goBack = () => setFlowState('details');
    const [dispute, setDispute] = useState<IDisputeDetail | undefined>();

    const setDisputeCallback = useCallback((dispute: IDisputeDetail) => {
        setDispute(dispute);
    }, []);
    return (
        <DisputeFlowContext.Provider value={{ flowState, setFlowState, goBack, dispute: dispute, setDispute: setDisputeCallback }}>
            <div className="adyen-pe-dispute-management__container">
                <DisputeDetailsContainer disputeId={props.id} />
            </div>
        </DisputeFlowContext.Provider>
    );
};
