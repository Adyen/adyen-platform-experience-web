import { inject, provide, ref, watch, type InjectionKey, type Ref } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import type { IDisputeDefenseDocument, IDisputeDetail } from '@integration-components/types/api/models/disputes';
import { type TranslationConfigItem } from '@integration-components/disputes/domain';
import localDefenseDocumentConfig from '../../../../domain/src/config/defenseDocumentConfig.json';
import localDefenseReasonConfig from '../../../../domain/src/config/defenseReasonConfig.json';

export enum DisputeFlowState {
    Details = 'details',
    Accept = 'accept',
    DefendReasonSelection = 'defendReasonSelectionView',
    UploadDefenseFiles = 'uploadDefenseFilesView',
    DefenseSubmitResponse = 'defenseSubmitResponseView',
}

export enum DefendResponse {
    Error = 'error',
    Success = 'success',
}

export interface DisputeFlowContextValue {
    flowState: Ref<DisputeFlowState>;
    setFlowState: (state: DisputeFlowState) => void;
    goBack: () => void;
    dispute: Ref<IDisputeDetail | undefined>;
    setDispute: (dispute: IDisputeDetail | undefined) => void;
    selectedDefenseReason: Ref<string | null>;
    setSelectedDefenseReason: (selectedDefenseReason: string | null) => void;
    applicableDocuments: Ref<IDisputeDefenseDocument[] | null>;
    setApplicableDocuments: (documents: IDisputeDefenseDocument[] | null) => void;
    clearFiles: () => void;
    clearStates: () => void;
    defendDisputePayload: Ref<FormData | null>;
    addFileToDefendPayload: (name: string, file: File) => void;
    moveFieldInDefendPayload: (from: string, to: string) => void;
    removeFieldFromDefendPayload: (field: string) => void;
    defendResponse: Ref<DefendResponse | null>;
    onDefendSubmit: (response: DefendResponse) => void;
    getDisputesConfig: () => Promise<void>;
    defenseReasonConfig: Ref<Record<string, TranslationConfigItem>>;
    defenseDocumentConfig: Ref<Record<string, TranslationConfigItem>>;
}

const DISPUTE_FLOW_KEY: InjectionKey<DisputeFlowContextValue> = Symbol('disputeFlow');

const cloneFormData = (formData: FormData) => {
    const formDataClone = new FormData();
    for (const [field, value] of formData.entries()) {
        if (value instanceof File) {
            formDataClone.set(field, value, value.name);
        } else {
            formDataClone.set(field, value);
        }
    }
    return formDataClone;
};

export function provideDisputeFlow(dispute: Ref<IDisputeDetail | undefined>) {
    const { getCdnConfig } = useCoreContext();
    const flowState = ref<DisputeFlowState>(DisputeFlowState.Details);
    const selectedDefenseReason = ref<string | null>(null);
    const applicableDocuments = ref<IDisputeDefenseDocument[] | null>([]);
    const defendDisputePayload = ref<FormData | null>(null);
    const defendResponse = ref<DefendResponse | null>(null);
    const defenseReasonConfig = ref<Record<string, TranslationConfigItem>>(localDefenseReasonConfig);
    const defenseDocumentConfig = ref<Record<string, TranslationConfigItem>>(localDefenseDocumentConfig);

    const setFlowState = (state: DisputeFlowState) => {
        flowState.value = state;
    };

    const setDispute = (nextDispute: IDisputeDetail | undefined) => {
        dispute.value = nextDispute;
    };

    const clearFiles = () => {
        if (!defendDisputePayload.value) return;
        const fileFields = [...defendDisputePayload.value.keys()].filter(field => field !== 'defenseReason');
        if (!fileFields.length) return;
        const nextFormData = cloneFormData(defendDisputePayload.value);
        fileFields.forEach(field => nextFormData.delete(field));
        defendDisputePayload.value = nextFormData;
    };

    const goBack = () => {
        switch (flowState.value) {
            case DisputeFlowState.DefendReasonSelection:
            case DisputeFlowState.Accept:
                flowState.value = DisputeFlowState.Details;
                break;
            case DisputeFlowState.UploadDefenseFiles:
                clearFiles();
                flowState.value = DisputeFlowState.DefendReasonSelection;
                break;
            default:
                flowState.value = DisputeFlowState.Details;
                break;
        }
    };

    const clearStates = () => {
        selectedDefenseReason.value = null;
        applicableDocuments.value = null;
        defendDisputePayload.value = null;
        defendResponse.value = null;
        dispute.value = undefined;
    };

    const addFileToDefendPayload = (field: string, file: File) => {
        const nextFormData = defendDisputePayload.value ? cloneFormData(defendDisputePayload.value) : new FormData();
        nextFormData.set(field, file, file.name);
        defendDisputePayload.value = nextFormData;
    };

    const moveFieldInDefendPayload = (fromField: string, toField: string) => {
        if (!defendDisputePayload.value?.has(fromField)) return;
        const fromFieldValue = defendDisputePayload.value.get(fromField);
        if (!fromFieldValue) return;

        const nextFormData = cloneFormData(defendDisputePayload.value);
        nextFormData.delete(fromField);
        if (fromFieldValue instanceof File) {
            nextFormData.set(toField, fromFieldValue, fromFieldValue.name);
        } else {
            nextFormData.set(toField, fromFieldValue);
        }
        defendDisputePayload.value = nextFormData;
    };

    const removeFieldFromDefendPayload = (field: string) => {
        if (!defendDisputePayload.value?.has(field)) return;
        const nextFormData = cloneFormData(defendDisputePayload.value);
        nextFormData.delete(field);
        defendDisputePayload.value = nextFormData;
    };

    const setSelectedDefenseReason = (reason: string | null) => {
        selectedDefenseReason.value = reason;
    };

    const setApplicableDocuments = (documents: IDisputeDefenseDocument[] | null) => {
        applicableDocuments.value = documents;
    };

    const onDefendSubmit = (response: Exclude<DefendResponse, null>) => {
        defendResponse.value = response;
    };

    const getDisputesConfig = async () => {
        try {
            const nextDefenseReasonConfig = await getCdnConfig?.<Record<string, TranslationConfigItem>>({
                subFolder: 'disputes',
                name: 'defenseReasonConfig',
                fallback: localDefenseReasonConfig,
            });
            const nextDefenseDocumentConfig = await getCdnConfig?.<Record<string, TranslationConfigItem>>({
                subFolder: 'disputes',
                name: 'defenseDocumentConfig',
                fallback: localDefenseDocumentConfig,
            });

            defenseReasonConfig.value = nextDefenseReasonConfig ?? localDefenseReasonConfig;
            defenseDocumentConfig.value = nextDefenseDocumentConfig ?? localDefenseDocumentConfig;
        } catch {
            defenseReasonConfig.value = localDefenseReasonConfig;
            defenseDocumentConfig.value = localDefenseDocumentConfig;
        }
    };

    watch(selectedDefenseReason, reason => {
        if (!reason) {
            defendDisputePayload.value = null;
            return;
        }
        const nextFormData = new FormData();
        nextFormData.set('defenseReason', reason);
        defendDisputePayload.value = nextFormData;
    });

    const context: DisputeFlowContextValue = {
        addFileToDefendPayload,
        applicableDocuments,
        clearFiles,
        clearStates,
        defendDisputePayload,
        defendResponse,
        defenseDocumentConfig,
        defenseReasonConfig,
        dispute,
        flowState,
        getDisputesConfig,
        goBack,
        moveFieldInDefendPayload,
        onDefendSubmit,
        removeFieldFromDefendPayload,
        selectedDefenseReason,
        setApplicableDocuments,
        setDispute,
        setFlowState,
        setSelectedDefenseReason,
    };

    provide(DISPUTE_FLOW_KEY, context);
    return context;
}

export function useDisputeFlow() {
    const context = inject(DISPUTE_FLOW_KEY);
    if (!context) throw new Error('useDisputeFlow must be used within DisputeFlowProvider');
    return context;
}
