<script setup lang="ts">
import { computed } from 'vue';
import { BentoAlert } from '@adyen/bento-vue3';
import { useCoreContext } from '../Context';
import { getSafeDomainTranslationKey } from '../../translations';
import type { VersionNotice } from '../../versionNotice/types';
import styles from './VersionNoticeBanner.module.scss';

const props = defineProps<{ notice: VersionNotice }>();
const emit = defineEmits<{ dismiss: [] }>();

const { i18n, translationDomain } = useCoreContext();

const content = computed(() => {
    const { notice } = props;

    if (notice.kind === 'deprecated') {
        return {
            type: 'warning',
            title: i18n.get(getSafeDomainTranslationKey(translationDomain, 'common.versionNotice.deprecated.title')),
            description: i18n.get(getSafeDomainTranslationKey(translationDomain, 'common.versionNotice.deprecated.description'), {
                values: { currentVersion: notice.currentVersion },
            }),
        } as const;
    }

    return {
        type: 'highlight',
        title: i18n.get(getSafeDomainTranslationKey(translationDomain, 'common.versionNotice.outdated.title')),
        description: i18n.get(getSafeDomainTranslationKey(translationDomain, 'common.versionNotice.outdated.description'), {
            values: { currentVersion: notice.currentVersion, latestVersion: notice.latestVersion },
        }),
    } as const;
});
</script>

<template>
    <div role="status" :class="styles.root" data-testid="version-notice">
        <BentoAlert :type="content.type" close-button @close-alert="emit('dismiss')">
            <template #default>{{ content.title }}</template>
            <template #description>{{ content.description }}</template>
        </BentoAlert>
    </div>
</template>
