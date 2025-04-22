import { createContext } from 'preact';
import { memo, PropsWithChildren } from 'preact/compat';
import { useCallback, useContext, useState } from 'preact/hooks';
import { IApplicableDefenseDocument, IDisputeDetail } from '../../../../../types/api/models/disputes';

export type DisputeFlowState = 'details' | 'accept' | 'defendReasonSelectionView' | 'uploadDefenseFilesView';

interface DisputeFlowContextValue {
    flowState: DisputeFlowState;
    setFlowState: (state: DisputeFlowState) => void;
    goBack: () => void;
    dispute: IDisputeDetail | undefined;
    setDispute: (dispute: IDisputeDetail | undefined) => void;
    selectedDefenseReason: string | null;
    setSelectedDefenseReason: (selectedDefenseReason: string) => void;
    applicableDocuments: IApplicableDefenseDocument[] | null;
    setApplicableDocuments: (documents: IApplicableDefenseDocument[]) => void;
    clearStates: () => void;
    uploadedFiles: any[] | null;
    setUploadedFiles: (files: any[]) => void;
}

interface DisputeProviderProps {
    dispute: IDisputeDetail | undefined;
    setDispute: (dispute: IDisputeDetail | undefined) => void;
}

export const DisputeFlowContext = createContext<DisputeFlowContextValue | undefined>(undefined);

export const DisputeContextProvider = memo(({ dispute, setDispute, children }: PropsWithChildren<DisputeProviderProps>) => {
    const [flowState, setFlowState] = useState<DisputeFlowState>('details');
    const [selectedDefenseReason, setSelectedDefenseReason] = useState<string | null>(null);
    const [applicableDocuments, setApplicableDocuments] = useState<IApplicableDefenseDocument[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<any | null>(null);

    const goBack = useCallback(() => {
        switch (flowState) {
            case 'defendReasonSelectionView':
                setFlowState('details');
                break;
            case 'accept':
                setFlowState('details');
                break;
            case 'uploadDefenseFilesView':
                setFlowState('defendReasonSelectionView');
                break;
            default:
                setFlowState('details');
                break;
        }
    }, [flowState]);

    const clearStates = useCallback(() => {
        setSelectedDefenseReason(null);
        setApplicableDocuments([]);
        setDispute(undefined);
        setUploadedFiles(null);
    }, [setApplicableDocuments, setDispute, setSelectedDefenseReason]);

    return (
        <DisputeFlowContext.Provider
            value={{
                applicableDocuments,
                clearStates,
                dispute,
                flowState,
                goBack,
                setApplicableDocuments,
                setFlowState,
                setDispute,
                selectedDefenseReason,
                setSelectedDefenseReason,
                setUploadedFiles,
                uploadedFiles,
            }}
        >
            {children}
        </DisputeFlowContext.Provider>
    );
});

export const useDisputeFlow = () => {
    const context = useContext(DisputeFlowContext);
    if (!context) throw new Error('useDisputeFlow must be used within DisputeFlowProvider');
    return context;
};
