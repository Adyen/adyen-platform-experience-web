import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { IDisputeDetail } from '../../../../types/api/models/disputes';

export type DisputeFlowState = 'details' | 'accept' | 'defend';

interface DisputeFlowContextValue {
    flowState: DisputeFlowState;
    setFlowState: (state: DisputeFlowState) => void;
    goBack: () => void;
    dispute: IDisputeDetail | undefined;
    setDispute: (dispute: IDisputeDetail) => void;
}

export const DisputeFlowContext = createContext<DisputeFlowContextValue | undefined>(undefined);

export const useDisputeFlow = () => {
    const context = useContext(DisputeFlowContext);
    if (!context) throw new Error('useDisputeFlow must be used within DisputeFlowProvider');
    return context;
};
