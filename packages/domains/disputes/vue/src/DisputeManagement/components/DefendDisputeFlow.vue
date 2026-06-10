<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { BentoAlert, BentoButton, BentoButtonActions, BentoCard, BentoTypography } from '@adyen/bento-vue3';
import CheckmarkCircleFillIcon from '@adyen/ui-assets-icons-40/vue/checkmark-circle-filled';
import CrossCircleFillIcon from '@adyen/ui-assets-icons-40/vue/cross-circle-filled';
import PlusIcon from '@adyen/ui-assets-icons-16/vue/plus';
import BinIcon from '@adyen/ui-assets-icons-16/vue/bin';
import { useConfigContext, useCoreContext } from '@integration-components/core/vue';
import type { EndpointHttpCallables } from '@integration-components/core';
import { getDefenseDocumentContent, getDefenseReasonContent, type DisputeManagementProps } from '@integration-components/disputes/domain';
import { isFunction } from '@integration-components/utils';
import { useDisputeFlow } from '../composables/useDisputeFlow';
import DisputeFileInput from './DisputeFileInput.vue';
import SelectDropdown from './SelectDropdown.vue';

type SelectDropdownItem = {
    id: string;
    name: string;
    disabled?: boolean;
};

const props = defineProps<{
    onDisputeDefend?: DisputeManagementProps['onDisputeDefend'];
}>();

const { i18n } = useCoreContext();
const { getApplicableDefenseDocuments, defendDispute } = useConfigContext().endpoints;
const {
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
    goBack,
    moveFieldInDefendPayload,
    onDefendSubmit,
    removeFieldFromDefendPayload,
    selectedDefenseReason,
    setApplicableDocuments,
    setFlowState,
    setSelectedDefenseReason,
} = useDisputeFlow();

const isReasonSubmitting = ref(false);
const reasonError = ref(false);
const isSubmittingDefense = ref(false);
const showFeeAlert = ref(dispute.value?.dispute.type !== 'REQUEST_FOR_INFORMATION');
const oneOrMoreSelectedDocument = ref<string | undefined>();
const optionalSelectedDocuments = ref<(string | undefined)[]>([]);
const callbackCalled = ref(false);
const cachedDispute = ref(dispute.value);

watch(
    dispute,
    nextDispute => {
        if (nextDispute) cachedDispute.value = nextDispute;
    },
    { immediate: true }
);

const disputePspReference = computed(() => cachedDispute.value?.dispute.pspReference);

const defendDisputeTitle = computed(() =>
    dispute.value?.dispute.type === 'REQUEST_FOR_INFORMATION'
        ? i18n.get('disputes.management.defend.requestForInformation.title')
        : i18n.get('disputes.management.defend.chargeback.title')
);

const defendDisputeLabel = computed(() =>
    dispute.value?.dispute.type === 'REQUEST_FOR_INFORMATION'
        ? i18n.get('disputes.management.defend.requestForInformation.selectDefenseReason')
        : i18n.get('disputes.management.defend.chargeback.selectDefenseReason')
);

const defenseReasons = computed<SelectDropdownItem[]>(() =>
    (dispute.value?.dispute.allowedDefenseReasons ?? []).map(reason => ({
        id: reason,
        name: getDefenseReasonContent(defenseReasonConfig.value, i18n, reason)?.title || reason,
    }))
);

watch(
    defenseReasons,
    reasons => {
        if (!selectedDefenseReason.value && reasons[0]) {
            setSelectedDefenseReason(reasons[0].id);
        }
    },
    { immediate: true }
);

const selectedReasonContent = computed(() =>
    selectedDefenseReason.value ? getDefenseReasonContent(defenseReasonConfig.value, i18n, selectedDefenseReason.value) : undefined
);

async function submitDefenseReason() {
    if (applicableDocuments.value?.length) {
        setFlowState('uploadDefenseFilesView');
        return;
    }
    const pspReference = disputePspReference.value;
    if (!isFunction(getApplicableDefenseDocuments) || !selectedDefenseReason.value || !pspReference) return;

    isReasonSubmitting.value = true;
    reasonError.value = false;
    try {
        const response = await getApplicableDefenseDocuments(
            {},
            {
                query: { defenseReason: selectedDefenseReason.value },
                path: { disputePspReference: pspReference },
            }
        );
        setApplicableDocuments(response?.data ?? null);
        if (response?.data?.length) setFlowState('uploadDefenseFilesView');
    } catch {
        reasonError.value = true;
    } finally {
        isReasonSubmitting.value = false;
    }
}

const requiredDocuments = computed(() =>
    (applicableDocuments.value ?? []).filter(document => document.requirementLevel === 'REQUIRED').map(document => document.documentTypeCode)
);

const optionalDocuments = computed<SelectDropdownItem[]>(() =>
    (applicableDocuments.value ?? [])
        .filter(document => document.requirementLevel === 'OPTIONAL')
        .map(document => ({
            id: document.documentTypeCode,
            name: getDefenseDocumentContent(defenseDocumentConfig.value, i18n, document.documentTypeCode)?.title || document.documentTypeCode,
        }))
);

const oneOrMoreDocuments = computed<SelectDropdownItem[]>(() =>
    (applicableDocuments.value ?? [])
        .filter(document => document.requirementLevel === 'ONE_OR_MORE')
        .map(document => ({
            id: document.documentTypeCode,
            name: getDefenseDocumentContent(defenseDocumentConfig.value, i18n, document.documentTypeCode)?.title || document.documentTypeCode,
        }))
);

const requiredDocumentsUploaded = computed(() => {
    if (!defendDisputePayload.value) return false;
    let requiredDocumentsPresent = requiredDocuments.value.every(document => defendDisputePayload.value?.get(document) instanceof File);

    if (oneOrMoreDocuments.value.length > 0) {
        requiredDocumentsPresent &&= oneOrMoreDocuments.value.some(document => defendDisputePayload.value?.get(document.id) instanceof File);
    }
    return requiredDocumentsPresent;
});

const canSubmitDocuments = computed(
    () => !!defendDisputePayload.value && requiredDocumentsUploaded.value && !isSubmittingDefense.value && defendResponse.value !== 'success'
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

function onDefenseReasonChange(reason: string) {
    if (selectedDefenseReason.value !== reason && applicableDocuments.value?.length) setApplicableDocuments([]);
    setSelectedDefenseReason(reason);
}

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
    const pspReference = disputePspReference.value;
    if (!canSubmitDocuments.value || !isFunction(defendDispute) || !defendDisputePayload.value || !pspReference) return;

    isSubmittingDefense.value = true;
    try {
        type DefendDisputeRequest = Parameters<EndpointHttpCallables<'defendDispute'>>[0];
        await defendDispute(
            { contentType: 'multipart/form-data', body: defendDisputePayload.value as unknown as DefendDisputeRequest['body'] },
            { path: { disputePspReference: pspReference } }
        );
        clearFiles();
        onDefendSubmit('success');
    } catch {
        clearFiles();
        onDefendSubmit('error');
    } finally {
        setFlowState('defenseSubmitResponseView');
        isSubmittingDefense.value = false;
    }
}

function goBackToDetails() {
    clearStates();
    setFlowState('details');
}

function goBackToFileUploadView() {
    clearFiles();
    setFlowState('uploadDefenseFilesView');
}

const reasonActionButtons = computed(() => [
    {
        title: i18n.get('disputes.management.defend.common.actions.continue'),
        disabled: isReasonSubmitting.value,
        event: () => void submitDefenseReason(),
        state: isReasonSubmitting.value ? 'loading' : 'start',
    },
    {
        title: i18n.get('disputes.management.common.actions.goBack'),
        disabled: isReasonSubmitting.value,
        event: goBack,
        variant: 'secondary',
    },
]);

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

watch(defendResponse, response => {
    const pspReference = disputePspReference.value;
    if (response !== 'success' || callbackCalled.value || !pspReference || !isFunction(props.onDisputeDefend)) return;
    callbackCalled.value = true;
    props.onDisputeDefend({ id: pspReference });
});
</script>

<template>
    <div class="adyen-pe-defend-dispute__container">
        <BentoTypography v-if="flowState !== 'defenseSubmitResponseView'" class="adyen-pe-defend-dispute__title" el="h2" variant="title">
            {{ defendDisputeTitle }}
        </BentoTypography>

        <template v-if="flowState === 'defendReasonSelectionView'">
            <div class="adyen-pe-defend-dispute-reason__selector">
                <BentoTypography class="adyen-pe-defend-dispute__reason-description" variant="body">
                    {{ defendDisputeLabel }}
                </BentoTypography>
                <SelectDropdown
                    :items="defenseReasons"
                    :model-value="selectedDefenseReason"
                    :placeholder="i18n.get('disputes.management.defend.common.inputs.reasonSelect.a11y.label')"
                    :disabled="isReasonSubmitting"
                    @update:model-value="onDefenseReasonChange"
                />
                <BentoTypography
                    v-for="description in selectedReasonContent?.primaryDescriptionItems ?? []"
                    :key="description"
                    class="adyen-pe-defend-dispute-reason__description"
                    variant="body"
                >
                    {{ description }}
                </BentoTypography>
                <ul
                    v-if="selectedReasonContent?.secondaryDescriptionItems?.length"
                    class="adyen-pe-defend-dispute-reason__secondary-description-items-container"
                >
                    <li
                        v-for="description in selectedReasonContent.secondaryDescriptionItems"
                        :key="description"
                        class="adyen-pe-defend-dispute-reason__secondary-description-item"
                    >
                        <BentoTypography class="adyen-pe-defend-dispute-reason__description" variant="body">
                            {{ description }}
                        </BentoTypography>
                    </li>
                </ul>
            </div>
            <BentoAlert v-if="showFeeAlert" close-button role="alert" type="highlight" @close-alert="showFeeAlert = false">
                <template #description>
                    {{ i18n.get('disputes.management.defend.chargeback.feeInfo') }}
                </template>
            </BentoAlert>
            <BentoAlert v-if="reasonError" type="critical" role="alert">
                <template #description>
                    {{ i18n.get('disputes.management.common.errors.unavailable') }}
                </template>
            </BentoAlert>
            <div class="adyen-pe-defend-dispute__actions">
                <BentoButtonActions :actions="reasonActionButtons" />
            </div>
        </template>

        <template v-else-if="flowState === 'uploadDefenseFilesView'">
            <BentoTypography class="adyen-pe-defend-dispute-file-uploader__subtitle" variant="body">
                {{ i18n.get('disputes.management.defend.common.documentUploadInfo') }}
            </BentoTypography>
            <BentoCard expandable closed background="secondary">
                <template #header>
                    <BentoTypography class="adyen-pe-defend-dispute-document-requirements" variant="body" strongest>
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

            <div class="adyen-pe-defend-dispute-file-uploader__container">
                <div v-if="requiredDocuments.length || oneOrMoreDocuments.length" class="adyen-pe-defend-dispute-document-upload-box">
                    <div class="adyen-pe-defend-dispute-document-upload-box__required-documents">
                        <div v-for="documentType in requiredDocuments" :key="documentType" class="adyen-pe-defend-dispute-document-upload">
                            <BentoTypography variant="body" strongest>
                                {{ getDefenseDocumentContent(defenseDocumentConfig, i18n, documentType)?.title ?? documentType }}
                            </BentoTypography>
                            <BentoTypography
                                v-for="description in getDefenseDocumentContent(defenseDocumentConfig, i18n, documentType)?.primaryDescriptionItems ??
                                []"
                                :key="description"
                                variant="body"
                            >
                                {{ description }}
                            </BentoTypography>
                            <DisputeFileInput :disabled="isSubmittingDefense" required @change="file => onFileChange(documentType, file)" />
                        </div>

                        <div v-if="oneOrMoreDocuments.length" class="adyen-pe-defend-dispute-document-upload">
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
                                    ? (getDefenseDocumentContent(defenseDocumentConfig, i18n, oneOrMoreSelectedDocument)?.primaryDescriptionItems ??
                                      [])
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

                <div
                    v-for="(documentType, index) in optionalSelectedDocuments"
                    :key="`optional-doc-${index}`"
                    class="adyen-pe-defend-dispute-document-upload-box"
                >
                    <div class="adyen-pe-defend-dispute-document-upload">
                        <BentoTypography variant="body" strongest>
                            {{ i18n.get('disputes.management.defend.common.documentTypes.optional') }}
                        </BentoTypography>
                        <BentoButton
                            :aria-label="i18n.get('disputes.management.defend.common.actions.deleteOptionalDocument')"
                            :disabled="isSubmittingDefense"
                            variant="tertiary"
                            @click="removeSelectedOptionalDocument(index)"
                        >
                            <BinIcon aria-hidden="true" />
                        </BentoButton>
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
                        <DisputeFileInput
                            :disabled="isSubmittingDefense || !documentType"
                            required
                            @change="file => onFileChange(documentType, file)"
                        />
                    </div>
                </div>

                <BentoButton v-if="canAddOptionalDocument" variant="secondary" @click="addEmptyOptionalDocument">
                    <PlusIcon aria-hidden="true" />
                    {{ i18n.get('disputes.management.defend.common.actions.addOptionalDocument') }}
                </BentoButton>
            </div>

            <div class="adyen-pe-defend-dispute__actions">
                <BentoButtonActions :actions="uploadActionButtons" />
            </div>
        </template>

        <div v-else class="adyen-pe-defend-dispute__response">
            <div v-if="defendResponse === 'success'" class="adyen-pe-defend-dispute__success">
                <CheckmarkCircleFillIcon class="adyen-pe-defend-dispute__success-icon" />
                <BentoTypography variant="title">
                    {{ i18n.get('disputes.management.defend.common.evidenceSubmitted') }}
                </BentoTypography>
                <BentoTypography class="adyen-pe-defend-dispute__success-description" variant="body">
                    {{ i18n.get('disputes.management.defend.chargeback.submitSuccessInfo') }}
                </BentoTypography>
                <BentoButton variant="secondary" @click="goBackToDetails">
                    {{ i18n.get('disputes.management.common.actions.showDetails') }}
                </BentoButton>
            </div>
            <div v-else class="adyen-pe-defend-dispute__error">
                <CrossCircleFillIcon class="adyen-pe-defend-dispute__error-icon" />
                <BentoTypography variant="title">
                    {{ i18n.get('disputes.management.defend.common.errors.somethingWentWrong') }}
                </BentoTypography>
                <BentoTypography variant="body">
                    {{ i18n.get('disputes.management.defend.common.errors.defenseFailed') }}
                </BentoTypography>
                <BentoButton variant="secondary" @click="goBackToFileUploadView">
                    {{ i18n.get('disputes.management.common.actions.goBack') }}
                </BentoButton>
            </div>
        </div>
    </div>
</template>
