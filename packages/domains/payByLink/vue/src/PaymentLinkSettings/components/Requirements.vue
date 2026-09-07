<script setup lang="ts">
import { onMounted } from 'vue';
import { BentoButton, BentoModal, BentoTypography } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import { useTermsRequirementsConfig } from '../composables/useTermsRequirementsConfig';
import styles from './Requirements.module.scss';

const props = defineProps<{
    termsAndConditionsUrl?: string;
}>();

const emit = defineEmits<{
    goBack: [];
    acceptRequirements: [];
}>();

const { i18n } = useCoreContext();
const { termsRequirementsConfig, getTermsRequirementsConfig } = useTermsRequirementsConfig();

onMounted(() => {
    void getTermsRequirementsConfig();
});

function onAcceptRequirements() {
    emit('acceptRequirements');
    emit('goBack');
}
</script>

<template>
    <BentoModal :is-open="true" :is-dismissible="true" size="large" @close-modal="emit('goBack')">
        {{ i18n.get(termsRequirementsConfig.titleKey) }}
        <template #content>
            <div :class="styles.root">
                <div :class="styles.sectionsContainer">
                    <div v-for="section in termsRequirementsConfig.sections" :key="section.id" :class="styles.section">
                        <BentoTypography variant="title" el="div">{{ i18n.get(section.titleKey) }}</BentoTypography>
                        <div :class="styles.sectionContent">
                            <BentoTypography variant="body">
                                {{ i18n.get(section.descriptionKey) }}
                            </BentoTypography>
                            <ul :class="styles.list">
                                <li v-for="item in section.items" :key="item.key">
                                    <BentoTypography variant="body">{{ i18n.get(item.key) }}</BentoTypography>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div :class="styles.buttonsContainer">
                    <BentoButton variant="secondary" @click="emit('goBack')">
                        {{ i18n.get('payByLink.settings.terms.requirements.actions.goBack') }}
                    </BentoButton>
                    <BentoButton v-if="props.termsAndConditionsUrl" variant="primary" @click="onAcceptRequirements">
                        {{ i18n.get('payByLink.settings.terms.requirements.actions.confirmRequirements') }}
                    </BentoButton>
                </div>
            </div>
        </template>
    </BentoModal>
</template>
