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
    defendDisputePayload: FormData | null;
    addFileToDefendPayload: (name: string, file: File) => void;
    moveFieldInDefendPayload: (from: string, to: string) => void;
    removeFieldFromDefendPayload: (field: string) => void;
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
    const [defendDisputePayload, setDefendDisputePayload] = useState<FormData | null>(null);
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
        setDefendDisputePayload((previousFormData: FormData | null) => {
            const formData = new FormData();
            if (previousFormData) {
                for (const [field, value] of previousFormData.entries()) {
                    if (value instanceof File) {
                        formData.set(field, value, value.name);
                    } else formData.set(field, value);
                }
            }

            formData.set(name, file, file.name);
            return formData;
        });
    }, []);

    const moveFieldInDefendPayload = useCallback((from: string, to: string) => {
        setDefendDisputePayload((prev: FormData | null) => {
            // Extract the payload we want to move (could be a File or string)
            const valueToMove = prev?.get(from);
            if (valueToMove == null) return prev;

            const next = new FormData();
            if (prev) {
                for (const [key, val] of prev.entries()) {
                    if (key === from) continue; // skip the old key
                    if (val instanceof File) {
                        next.set(key, val, val.name);
                    } else {
                        next.set(key, val as string);
                    }
                }
            }

            // Insert the value under its new key
            if (valueToMove instanceof File) {
                next.set(to, valueToMove, valueToMove.name);
            } else {
                next.set(to, valueToMove as string);
            }
            return next;
        });
    }, []);

    const removeFieldFromDefendPayload = useCallback((name: string) => {
        setDefendDisputePayload((previousFormData: FormData | null) => {
            const formData = new FormData();
            if (previousFormData) {
                for (const [field, value] of previousFormData.entries()) {
                    // Copy everything except the field we’re deleting
                    if (field !== name) {
                        if (value instanceof File) {
                            formData.set(field, value, value.name);
                        } else {
                            formData.set(field, value as string);
                        }
                    }
                }
            }
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
                moveFieldInDefendPayload,
                removeFieldFromDefendPayload,
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
