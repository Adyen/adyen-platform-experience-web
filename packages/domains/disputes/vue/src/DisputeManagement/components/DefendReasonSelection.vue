<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { BentoAlert, BentoButtonActions, BentoTypography, type BentoButtonActionsList } from '@adyen/bento-vue3';
import { useConfigContext, useCoreContext } from '@integration-components/core/vue';
import { DISPUTE_TYPE, getDefenseReasonContent } from '@integration-components/disputes/domain';
import { EMPTY_OBJECT, isFunction } from '@integration-components/utils';
import { DisputeFlowState, useDisputeFlow } from '../composables/useDisputeFlow';
import SelectDropdown from './SelectDropdown.vue';
import type { SelectDropdownItem } from '../types';

const props = defineProps<{
    pspReference?: string;
}>();

const { i18n } = useCoreContext();
const config = useConfigContext();
const getApplicableDefenseDocuments = computed(() => config.endpoints?.getApplicableDefenseDocuments);
const {
    dispute,
    applicableDocuments,
    defenseReasonConfig,
    selectedDefenseReason,
    setApplicableDocuments,
    setFlowState,
    setSelectedDefenseReason,
    goBack,
} = useDisputeFlow();

const isReasonSubmitting = ref(false);
const reasonError = ref(false);
const showFeeAlert = ref(dispute.value?.dispute.type !== DISPUTE_TYPE.REQUEST_FOR_INFORMATION);

const defendDisputeLabel = computed(() =>
    dispute.value?.dispute.type === DISPUTE_TYPE.REQUEST_FOR_INFORMATION
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
        setFlowState(DisputeFlowState.UploadDefenseFiles);
        return;
    }
    const pspReference = props.pspReference;
    const getApplicableDefenseDocumentsFn = getApplicableDefenseDocuments.value;
    if (!isFunction(getApplicableDefenseDocumentsFn) || !selectedDefenseReason.value || !pspReference) return;

    isReasonSubmitting.value = true;
    reasonError.value = false;
    try {
        const response = await getApplicableDefenseDocumentsFn(EMPTY_OBJECT, {
            query: { defenseReason: selectedDefenseReason.value },
            path: { disputePspReference: pspReference },
        });
        setApplicableDocuments(response?.data ?? null);
        if (response?.data?.length) setFlowState(DisputeFlowState.UploadDefenseFiles);
    } catch {
        reasonError.value = true;
    } finally {
        isReasonSubmitting.value = false;
    }
}

function onDefenseReasonChange(reason: string) {
    if (selectedDefenseReason.value !== reason && applicableDocuments.value?.length) {
        setApplicableDocuments([]);
    }
    setSelectedDefenseReason(reason);
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
</script>

<template>
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
        <BentoButtonActions :actions="reasonActionButtons as BentoButtonActionsList" />
    </div>
</template>
