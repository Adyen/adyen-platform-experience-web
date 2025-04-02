import { useState } from 'preact/hooks';
import { DisputeFlowContext, DisputeFlowState } from '../../hooks/useDisputeFlow';
import { DisputeDetailsContainer } from '../DisputeDetailsContainer/DisputeDetailsContainer';
import type { ExternalUIComponentProps } from '../../../../types';
import { DisputeManagementProps } from '../../types';
import '../DisputeDetails/DisputeDetails.scss';

export const DisputeDetails = (props: ExternalUIComponentProps<DisputeManagementProps>) => {
    const [flowState, setFlowState] = useState<DisputeFlowState>('details');
    const goBack = () => setFlowState('details');

    return (
        <DisputeFlowContext.Provider value={{ flowState, setFlowState, goBack }}>
            <div className="adyen-pe-dispute-management__container">
                <DisputeDetailsContainer disputeId={props.id} />
            </div>
        </DisputeFlowContext.Provider>
    );
};
