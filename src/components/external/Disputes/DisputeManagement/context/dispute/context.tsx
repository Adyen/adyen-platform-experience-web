import { createContext } from 'preact';
import { memo, PropsWithChildren, useEffect } from 'preact/compat';
import { useCallback, useContext, useState } from 'preact/hooks';
import { IDisputeDefenseDocument, IDisputeDetail } from '../../../../../../types/api/models/disputes';
import { TranslationConfigItem } from '../../utils';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import localDefenseDocumentConfig from '../../../../../../config/disputes/defenseDocumentConfig.json';
import localDefenseReasonConfig from '../../../../../../config/disputes/defenseReasonConfig.json';

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
    getDisputesConfig: () => Promise<void>;
    defenseReasonConfig: Record<string, TranslationConfigItem>;
    defenseDocumentConfig: Record<string, TranslationConfigItem>;
}

interface DisputeProviderProps {
    dispute: IDisputeDetail | undefined;
    setDispute: (dispute: IDisputeDetail | undefined) => void;
}

const cloneFormData = (formData: FormData) => {
    const formDataClone = new FormData();
    for (const [field, value] of formData.entries()) {
        if (value instanceof File) {
            formDataClone.set(field, value, value.name);
        } else formDataClone.set(field, value);
    }
    return formDataClone;
};

export const DisputeFlowContext = createContext<DisputeFlowContextValue | undefined>(undefined);

export const DisputeContextProvider = memo(({ dispute, setDispute, children }: PropsWithChildren<DisputeProviderProps>) => {
    const [flowState, setFlowState] = useState<DisputeFlowState>('details');
    const [selectedDefenseReason, setSelectedDefenseReason] = useState<string | null>(null);
    const [applicableDocuments, setApplicableDocuments] = useState<IDisputeDefenseDocument[] | null>([]);
    const [defendDisputePayload, setDefendDisputePayload] = useState<FormData | null>(null);
    const [defendResponse, setDefendResponse] = useState<'error' | 'success' | null>(null);

    const clearFiles = useCallback(() => {
        setDefendDisputePayload(previousFormData => {
            if (previousFormData) {
                const fileFields = [...previousFormData.keys()].filter(field => field !== 'defenseReason');

                if (fileFields.length > 0) {
                    const nextFormData = cloneFormData(previousFormData);
                    fileFields.forEach(field => nextFormData.delete(field));
                    return nextFormData;
                }
            }
            return previousFormData;
        });
    }, []);

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
        setDefendDisputePayload(null);
        setDefendResponse(null);
        setDispute(undefined);
    }, [setDispute]);

    const addFileToDefendPayload = useCallback((field: string, file: File) => {
        setDefendDisputePayload(previousFormData => {
            const nextFormData = previousFormData ? cloneFormData(previousFormData) : new FormData();
            nextFormData.set(field, file, file.name);
            return nextFormData;
        });
    }, []);

    const moveFieldInDefendPayload = useCallback((fromField: string, toField: string) => {
        setDefendDisputePayload(previousFormData => {
            if (previousFormData && previousFormData.has(fromField)) {
                const fromFieldValue = previousFormData.get(fromField)!;
                const nextFormData = cloneFormData(previousFormData);

                nextFormData.delete(fromField);

                if (fromFieldValue instanceof File) {
                    nextFormData.set(toField, fromFieldValue, fromFieldValue.name);
                } else nextFormData.set(toField, fromFieldValue);

                return nextFormData;
            }
            return previousFormData;
        });
    }, []);

    const removeFieldFromDefendPayload = useCallback((field: string) => {
        setDefendDisputePayload(previousFormData => {
            if (previousFormData && previousFormData.has(field)) {
                const nextFormData = cloneFormData(previousFormData);
                nextFormData.delete(field);
                return nextFormData;
            }
            return previousFormData;
        });
    }, []);

    const onDefendSubmit = useCallback((response: 'success' | 'error') => {
        setDefendResponse(response);
    }, []);

    useEffect(() => {
        setDefendDisputePayload(() => {
            if (selectedDefenseReason) {
                const nextFormData = new FormData();
                nextFormData.set('defenseReason', selectedDefenseReason);
                return nextFormData;
            }
            return null;
        });
    }, [selectedDefenseReason]);

    const { getCdnConfig } = useCoreContext();

    const [defenseReasonConfig, setDefenseReasonConfig] = useState<Record<string, TranslationConfigItem>>(localDefenseReasonConfig);
    const [defenseDocumentConfig, setDefenseDocumentConfig] = useState<Record<string, TranslationConfigItem>>(localDefenseDocumentConfig);

    const getDisputesConfig = useCallback(async () => {
        const defenseReasonConfig = await getCdnConfig?.<Record<string, TranslationConfigItem>>({
            subFolder: 'disputes',
            name: 'defenseReasonConfig',
            fallback: localDefenseReasonConfig,
        });
        const defenseDocumentConfig = await getCdnConfig?.<Record<string, TranslationConfigItem>>({
            subFolder: 'disputes',
            name: 'defenseDocumentConfig',
            fallback: localDefenseDocumentConfig,
        });

        setDefenseReasonConfig(defenseReasonConfig ?? localDefenseReasonConfig);
        setDefenseDocumentConfig(defenseDocumentConfig ?? localDefenseDocumentConfig);
    }, [getCdnConfig]);

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
                getDisputesConfig,
                defenseReasonConfig,
                defenseDocumentConfig,
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
