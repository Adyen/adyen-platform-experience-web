import { createContext } from 'preact';
import { useContext } from 'preact/hooks';

export type DisputeFlowState = 'details' | 'accept' | 'defend';

interface DisputeFlowContextValue {
    flowState: DisputeFlowState;
    setFlowState: (state: DisputeFlowState) => void;
    goBack: () => void;
}

export const DisputeFlowContext = createContext<DisputeFlowContextValue | undefined>(undefined);

export const useDisputeFlow = () => {
    const context = useContext(DisputeFlowContext);
    if (!context) throw new Error('useDisputeFlow must be used within DisputeFlowProvider');
    return context;
};
