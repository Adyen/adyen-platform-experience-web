import { createContext } from 'preact';
import { memo, PropsWithChildren } from 'preact/compat';
import { useCallback, useContext, useState } from 'preact/hooks';
import { IDisputeDefenseDocument, IDisputeDetail } from '../../../../../types/api/models/disputes';
import uploadedFile from '../../../../internal/FormFields/FileInput/components/UploadedFile';

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
    setApplicableDocuments: (documents: IDisputeDefenseDocument[]) => void;
    clearFiles: () => void;
    clearStates: () => void;
    uploadedFiles: FormData | null;
    addUploadedFile: (name: string, file: File) => void;
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
    const [applicableDocuments, setApplicableDocuments] = useState<IDisputeDefenseDocument[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<any | null>(null);
    const [defendResponse, setDefendResponse] = useState<'error' | 'success' | null>(null);

    const clearFiles = () => {
        setUploadedFiles(null);
    };

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
    }, [flowState]);

    const clearStates = useCallback(() => {
        setSelectedDefenseReason(null);
        setApplicableDocuments([]);
        setDispute(undefined);
        setUploadedFiles(null);
        setDefendResponse(null);
    }, [setApplicableDocuments, setDispute, setSelectedDefenseReason]);

    const addUploadedFile = useCallback(
        (name: string, file: File) => {
            let uploadedFile = new FormData();
            if (uploadedFiles?.values() && [...uploadedFiles?.values()].length !== 0) {
                uploadedFile = uploadedFiles;
            } else {
                uploadedFile.set('defenseReason', selectedDefenseReason!);
            }
            uploadedFile.append(name, file);
            setUploadedFiles(uploadedFile);
        },
        [setUploadedFiles, uploadedFiles]
    );

    const onDefendSubmit = useCallback((response: 'success' | 'error') => {
        setDefendResponse(response);
        setFlowState('defenseSubmitResponseView');
    }, []);

    return (
        <DisputeFlowContext.Provider
            value={{
                addUploadedFile,
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
                uploadedFiles,
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
