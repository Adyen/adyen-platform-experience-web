<script setup lang="ts">
import { computed, ref } from 'vue';
import { BentoAlert, BentoButton, BentoTypography } from '@adyen/bento-vue3';
import { useDisputesContext } from '../../integration/context';
import styles from './DisputeData.module.scss';

const props = defineProps<{
    issuerComments: string[];
}>();

const { i18n } = useDisputesContext();
const expanded = ref(false);
const visibleComments = computed(() => (expanded.value ? props.issuerComments : props.issuerComments.slice(0, 1)));
const toggleLabel = computed(() =>
    expanded.value ? i18n.get('disputes.management.details.issuerComment.showLess') : i18n.get('disputes.management.details.issuerComment.showMore')
);
</script>

<template>
    <BentoAlert :class="styles.issuerCommentsAlert" role="alert" type="highlight">
        {{ i18n.get('disputes.management.details.issuerComment') }}
        <template #description>
            <ul :class="styles.issuerCommentsGroup">
                <li v-for="comment in visibleComments" :key="comment">
                    <BentoTypography variant="body">
                        {{ comment }}
                    </BentoTypography>
                </li>
            </ul>
        </template>
        <template #actions>
            <BentoButton v-if="props.issuerComments.length > 1" variant="tertiary" @click="expanded = !expanded">
                {{ toggleLabel }}
            </BentoButton>
        </template>
    </BentoAlert>
</template>
