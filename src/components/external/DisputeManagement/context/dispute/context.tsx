import { createContext } from 'preact';
import { memo, PropsWithChildren, useEffect } from 'preact/compat';
import { useCallback, useContext, useState } from 'preact/hooks';
import { IDisputeDefenseDocument, IDisputeDetail } from '../../../../../types/api/models/disputes';

export type DisputeFlowState = 'details' | 'accept' | 'defendReasonSelectionView' | 'uploadDefenseFilesView' | 'defenseSubmitResponseView';

interface DisputeFlowContextValue {
    flowState: DisputeFlowState;
    setFlowState: (state: DisputeFlowState) => void;
    goBack: () => void;
    dispute: IDisputeDetail | undefined;
    setDispute: (dispute: IDisputeDetail | undefined) => void;
    selectedDefenseReason: string | null;
    setSelectedDefenseReason: (selectedDefenseReason: string) => void;
    applicableDocuments: IDisputeDefenseDocument[] | null;
    setApplicableDocuments: (documents: IDisputeDefenseDocument[] | null) => void;
    clearFiles: () => void;
    clearStates: () => void;
    defendDisputePayload: FormData;
    addFileToDefendPayload: (name: string, file: File) => void;
    defendResponse: 'error' | 'success' | null;
    onDefendSubmit: (response: 'success' | 'error') => void;
}

interface DisputeProviderProps {
    dispute: IDisputeDetail | undefined;
    setDispute: (dispute: IDisputeDetail | undefined) => void;
}

export const DisputeFlowContext = createContext<DisputeFlowContextValue | undefined>(undefined);

export const DisputeContextProvider = memo(({ dispute, setDispute, children }: PropsWithChildren<DisputeProviderProps>) => {
    const [flowState, setFlowState] = useState<DisputeFlowState>('details');
    const [selectedDefenseReason, setSelectedDefenseReason] = useState<string | null>(null);
    const [applicableDocuments, setApplicableDocuments] = useState<IDisputeDefenseDocument[] | null>([]);
    const [defendDisputePayload, setDefendDisputePayload] = useState<any | null>(null);
    const [defendResponse, setDefendResponse] = useState<'error' | 'success' | null>(null);

    const clearFiles = useCallback(() => {
        const formData = new FormData();
        if (selectedDefenseReason) formData.set('defenseReason', selectedDefenseReason);
        setDefendDisputePayload(formData);
    }, [selectedDefenseReason]);

    useEffect(() => {
        clearFiles();
    }, [clearFiles]);

    const goBack = useCallback(() => {
        switch (flowState) {
            case 'defendReasonSelectionView':
                setFlowState('details');
                break;
            case 'accept':
                setFlowState('details');
                break;
            case 'uploadDefenseFilesView':
                clearFiles();
                setFlowState('defendReasonSelectionView');
                break;
            default:
                setFlowState('details');
                break;
        }
    }, [clearFiles, flowState]);

    const clearStates = useCallback(() => {
        setSelectedDefenseReason(null);
        setApplicableDocuments(null);
        setDispute(undefined);
        setDefendDisputePayload(null);
        setDefendResponse(null);
    }, [setDispute]);

    const addFileToDefendPayload = useCallback((name: string, file: File) => {
        setDefendDisputePayload((previousFormData: FormData) => {
            const formData = new FormData();
            for (const [field, value] of previousFormData.entries()) {
                if (value instanceof File) {
                    formData.set(field, value, value.name);
                } else formData.set(field, value);
            }

            formData.set(name, file, file.name);
            return formData;
        });
    }, []);

    const onDefendSubmit = useCallback((response: 'success' | 'error') => {
        setDefendResponse(response);
        setFlowState('defenseSubmitResponseView');
    }, []);

    return (
        <DisputeFlowContext.Provider
            value={{
                addFileToDefendPayload,
                applicableDocuments,
                clearFiles,
                clearStates,
                defendResponse,
                dispute,
                flowState,
                goBack,
                setApplicableDocuments,
                setFlowState,
                setDispute,
                selectedDefenseReason,
                setSelectedDefenseReason,
                defendDisputePayload,
                onDefendSubmit,
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
