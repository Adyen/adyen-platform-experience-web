<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import { BentoButton, BentoButtonActions, BentoCard, BentoTypography, type BentoButtonActionsList } from '@adyen/bento-vue3';
import PlusIcon from '@adyen/ui-assets-icons-16/vue/plus';
import BinIcon from '@adyen/ui-assets-icons-16/vue/bin';
import { getDefenseDocumentContent } from '@integration-components/disputes/domain';
import type { IDisputeDefenseDocument } from '@integration-components/types/api/models/disputes';
import { DefendResponse, DisputeFlowState, useDisputeFlow } from '../composables/useDisputeFlow';
import DisputeFileInput from './DisputeFileInput.vue';
import SelectDropdown from './SelectDropdown.vue';
import type { SelectDropdownItem } from '../types';
import flowStyles from './DisputeFlow.module.scss';
import styles from './DefendDispute.module.scss';
import { useDisputesContext } from '../../integration/context';

const props = defineProps<{
    pspReference?: string;
}>();

const { i18n, runtime } = useDisputesContext();
const {
    addFileToDefendPayload,
    applicableDocuments,
    clearFiles,
    defendDisputePayload,
    defendResponse,
    defenseDocumentConfig,
    goBack,
    moveFieldInDefendPayload,
    onDefendSubmit,
    removeFieldFromDefendPayload,
    setFlowState,
} = useDisputeFlow();

const isSubmittingDefense = ref(false);
const oneOrMoreSelectedDocument = ref<string | undefined>();
const optionalSelectedDocuments = ref<(string | undefined)[]>([]);
let defendController: AbortController | undefined;

const mapDocumentsByRequirement = (requirementLevel: IDisputeDefenseDocument['requirementLevel']): SelectDropdownItem[] =>
    (applicableDocuments.value ?? [])
        .filter(document => document.requirementLevel === requirementLevel)
        .map(document => ({
            id: document.documentTypeCode,
            name: getDefenseDocumentContent(defenseDocumentConfig.value, i18n, document.documentTypeCode)?.title || document.documentTypeCode,
        }));

const requiredDocuments = computed(() =>
    (applicableDocuments.value ?? []).filter(document => document.requirementLevel === 'REQUIRED').map(document => document.documentTypeCode)
);

const optionalDocuments = computed<SelectDropdownItem[]>(() => mapDocumentsByRequirement('OPTIONAL'));
const oneOrMoreDocuments = computed<SelectDropdownItem[]>(() => mapDocumentsByRequirement('ONE_OR_MORE'));

const requiredDocumentsUploaded = computed(() => {
    if (!defendDisputePayload.value) return false;
    let requiredDocumentsPresent = requiredDocuments.value.every(document => defendDisputePayload.value?.get(document) instanceof File);

    if (oneOrMoreDocuments.value.length > 0) {
        requiredDocumentsPresent &&= oneOrMoreDocuments.value.some(document => defendDisputePayload.value?.get(document.id) instanceof File);
    }
    return requiredDocumentsPresent;
});

const canSubmitDocuments = computed(
    () =>
        !!defendDisputePayload.value &&
        requiredDocumentsUploaded.value &&
        !isSubmittingDefense.value &&
        defendResponse.value !== DefendResponse.Success
);

const availableOptionalDocuments = computed<SelectDropdownItem[]>(() => {
    const additionalOptionalDocs = oneOrMoreDocuments.value.filter(document => document.id !== oneOrMoreSelectedDocument.value);
    return [...additionalOptionalDocs, ...optionalDocuments.value].map(document => ({
        ...document,
        disabled: optionalSelectedDocuments.value.includes(document.id),
    }));
});

const canAddOptionalDocument = computed(() => {
    const optionalDocumentsCount = optionalDocuments.value.length + Math.max(0, oneOrMoreDocuments.value.length - 1);
    return optionalDocumentsCount > 0 && optionalDocumentsCount !== optionalSelectedDocuments.value.length && !isSubmittingDefense.value;
});

function updateOneOrMoreSelection(documentType: string) {
    if (oneOrMoreSelectedDocument.value) {
        moveFieldInDefendPayload(oneOrMoreSelectedDocument.value, documentType);
    }
    oneOrMoreSelectedDocument.value = documentType;
}

function updateOptionalSelection(documentType: string, index: number) {
    const previousDocumentType = optionalSelectedDocuments.value[index];
    if (previousDocumentType) {
        moveFieldInDefendPayload(previousDocumentType, documentType);
    }
    optionalSelectedDocuments.value = optionalSelectedDocuments.value.map((document, currentIndex) =>
        currentIndex === index ? documentType : document
    );
}

function getOnlyAvailableDocumentType(documents: SelectDropdownItem[]) {
    const availableDocuments = documents.filter(document => document.disabled !== true);
    return availableDocuments.length === 1 ? availableDocuments[0]?.id : undefined;
}

watch(
    [oneOrMoreDocuments, oneOrMoreSelectedDocument],
    ([documents, selectedDocument]) => {
        const documentType = getOnlyAvailableDocumentType(documents);

        if (documentType && !selectedDocument) {
            updateOneOrMoreSelection(documentType);
        }
    },
    { immediate: true }
);

watch(
    [availableOptionalDocuments, optionalSelectedDocuments],
    ([documents, selectedDocuments]) => {
        const documentType = getOnlyAvailableDocumentType(documents);
        const emptyDocumentIndex = selectedDocuments.indexOf(undefined);

        if (documentType && emptyDocumentIndex !== -1) {
            updateOptionalSelection(documentType, emptyDocumentIndex);
        }
    },
    { immediate: true }
);

function addEmptyOptionalDocument() {
    if (!canAddOptionalDocument.value) return;
    optionalSelectedDocuments.value = [...optionalSelectedDocuments.value, undefined];
}

function removeSelectedOptionalDocument(indexToRemove: number) {
    const documentToRemove = optionalSelectedDocuments.value[indexToRemove];
    if (documentToRemove) removeFieldFromDefendPayload(documentToRemove);
    optionalSelectedDocuments.value = optionalSelectedDocuments.value.filter((_, index) => index !== indexToRemove);
}

function onFileChange(documentType: string | undefined, file: File | undefined) {
    if (!documentType) return;
    if (file) {
        addFileToDefendPayload(documentType, file);
    } else {
        removeFieldFromDefendPayload(documentType);
    }
}

async function submitDefenseDocuments() {
    const pspReference = props.pspReference;
    if (!canSubmitDocuments.value || !runtime.canDefend || !defendDisputePayload.value || !pspReference) return;

    defendController?.abort();
    defendController = new AbortController();
    isSubmittingDefense.value = true;
    try {
        await runtime.defendDispute({
            body: defendDisputePayload.value,
            disputePspReference: pspReference,
            signal: defendController.signal,
        });
        clearFiles();
        onDefendSubmit(DefendResponse.Success);
    } catch {
        if (defendController.signal.aborted) return;
        clearFiles();
        onDefendSubmit(DefendResponse.Error);
    } finally {
        if (!defendController.signal.aborted) {
            setFlowState(DisputeFlowState.DefenseSubmitResponse);
            isSubmittingDefense.value = false;
        }
    }
}

onUnmounted(() => defendController?.abort());

const uploadActionButtons = computed(() => [
    {
        title: i18n.get('disputes.management.defend.common.actions.submit'),
        disabled: !canSubmitDocuments.value,
        event: () => void submitDefenseDocuments(),
        state: isSubmittingDefense.value ? 'loading' : 'start',
    },
    {
        title: i18n.get('disputes.management.common.actions.goBack'),
        disabled: isSubmittingDefense.value,
        event: goBack,
        variant: 'secondary',
    },
]);
</script>

<template>
    <BentoTypography variant="body">
        {{ i18n.get('disputes.management.defend.common.documentUploadInfo') }}
    </BentoTypography>
    <BentoCard expandable closed background="secondary">
        <template #header>
            <BentoTypography :class="styles.documentRequirements" variant="body" strongest>
                {{ i18n.get('disputes.management.defend.common.documentRequirements') }}
            </BentoTypography>
        </template>
        <template #content>
            <ul>
                <li>
                    <BentoTypography variant="body">
                        {{ i18n.get('disputes.management.defend.common.documentRequirements.language') }}
                    </BentoTypography>
                </li>
                <li>
                    <BentoTypography variant="body">
                        {{ i18n.get('disputes.management.defend.common.documentRequirements.recommendedSize') }}
                    </BentoTypography>
                </li>
                <li>
                    <BentoTypography variant="body">
                        {{ i18n.get('disputes.management.defend.common.documentRequirements.formatAndSize') }}
                    </BentoTypography>
                </li>
            </ul>
        </template>
    </BentoCard>

    <div :class="styles.fileUploaderContainer">
        <div v-if="requiredDocuments.length || oneOrMoreDocuments.length" :class="styles.documentUploadBox">
            <div :class="styles.requiredDocuments">
                <div v-for="documentType in requiredDocuments" :key="documentType" :class="styles.documentUpload">
                    <BentoTypography variant="body" strongest>
                        {{ getDefenseDocumentContent(defenseDocumentConfig, i18n, documentType)?.title ?? documentType }}
                    </BentoTypography>
                    <BentoTypography
                        v-for="description in getDefenseDocumentContent(defenseDocumentConfig, i18n, documentType)?.primaryDescriptionItems ?? []"
                        :key="description"
                        variant="body"
                    >
                        {{ description }}
                    </BentoTypography>
                    <DisputeFileInput :disabled="isSubmittingDefense" required @change="file => onFileChange(documentType, file)" />
                </div>

                <div v-if="oneOrMoreDocuments.length" :class="styles.documentUpload">
                    <BentoTypography variant="body" strongest>
                        {{ i18n.get('disputes.management.defend.common.documentTypes.required') }}
                    </BentoTypography>
                    <SelectDropdown
                        :items="oneOrMoreDocuments"
                        :model-value="oneOrMoreSelectedDocument"
                        :placeholder="i18n.get('disputes.management.defend.common.inputs.documentSelect.a11y.label')"
                        :disabled="isSubmittingDefense"
                        @update:model-value="updateOneOrMoreSelection"
                    />
                    <BentoTypography
                        v-for="description in oneOrMoreSelectedDocument
                            ? (getDefenseDocumentContent(defenseDocumentConfig, i18n, oneOrMoreSelectedDocument)?.primaryDescriptionItems ?? [])
                            : []"
                        :key="description"
                        variant="body"
                    >
                        {{ description }}
                    </BentoTypography>
                    <DisputeFileInput
                        :disabled="isSubmittingDefense || !oneOrMoreSelectedDocument"
                        required
                        @change="file => onFileChange(oneOrMoreSelectedDocument, file)"
                    />
                </div>
            </div>
        </div>

        <div v-for="(documentType, index) in optionalSelectedDocuments" :key="`optional-doc-${index}`" :class="styles.documentUploadBox">
            <div :class="styles.documentUpload">
                <div :class="styles.deleteButtonContainer">
                    <BentoTypography variant="body" strongest>
                        {{ i18n.get('disputes.management.defend.common.documentTypes.optional') }}
                    </BentoTypography>
                    <BentoButton
                        :aria-label="i18n.get('disputes.management.defend.common.actions.deleteOptionalDocument')"
                        :disabled="isSubmittingDefense"
                        variant="tertiary"
                        @click="removeSelectedOptionalDocument(index)"
                    >
                        <template #iconLeft>
                            <BinIcon aria-hidden="true" />
                        </template>
                    </BentoButton>
                </div>
                <SelectDropdown
                    :items="availableOptionalDocuments"
                    :model-value="documentType"
                    :placeholder="i18n.get('disputes.management.defend.common.inputs.documentSelect.a11y.label')"
                    :disabled="isSubmittingDefense"
                    @update:model-value="value => updateOptionalSelection(value, index)"
                />
                <BentoTypography
                    v-for="description in documentType
                        ? (getDefenseDocumentContent(defenseDocumentConfig, i18n, documentType)?.primaryDescriptionItems ?? [])
                        : []"
                    :key="description"
                    variant="body"
                >
                    {{ description }}
                </BentoTypography>
                <DisputeFileInput :disabled="isSubmittingDefense || !documentType" required @change="file => onFileChange(documentType, file)" />
            </div>
        </div>

        <BentoButton v-if="canAddOptionalDocument" variant="secondary" @click="addEmptyOptionalDocument">
            <template #iconLeft>
                <PlusIcon aria-hidden="true" />
            </template>
            {{ i18n.get('disputes.management.defend.common.actions.addOptionalDocument') }}
        </BentoButton>
    </div>

    <div :class="flowStyles.actions">
        <BentoButtonActions :actions="uploadActionButtons as BentoButtonActionsList" />
    </div>
</template>
