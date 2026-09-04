<script setup lang="ts">
import { computed } from 'vue';
import { BentoCard, BentoLink, BentoTypography } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import styles from './LegalNotice.module.scss';
import { SUPPORT_EMAIL } from '@integration-components/capital/domain';

const props = defineProps<{
    region?: string;
}>();

const { i18n } = useCoreContext();
const creditorInfo = computed(() =>
    i18n.get('capital.offer.summary.legalNotice.US.title', {
        values: { break: '\n' },
    })
);
const noticeParts = computed(() => {
    const emailPlaceholder = '__EMAIL_PLACEHOLDER__';
    return i18n
        .get('capital.offer.summary.legalNotice.US.note', {
            values: { break: '\n\n', email: emailPlaceholder },
        })
        .split(emailPlaceholder);
});
</script>

<template>
    <BentoCard v-if="props.region === 'US'" background="secondary">
        <template #content>
            <BentoTypography variant="caption" :class="styles.creditorInfo">
                {{ creditorInfo }}
            </BentoTypography>
            <br />
            <BentoTypography variant="caption" :class="styles.notice">
                <template v-for="(part, index) in noticeParts" :key="index">
                    {{ part }}
                    <BentoLink v-if="index < noticeParts.length - 1" :to="`mailto:${SUPPORT_EMAIL}`" is-not-routing disable-typography>
                        {{ SUPPORT_EMAIL }}
                    </BentoLink>
                </template>
            </BentoTypography>
        </template>
    </BentoCard>
</template>
