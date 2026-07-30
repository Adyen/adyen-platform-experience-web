<script setup lang="ts">
import { computed, provide } from 'vue';
import { CONFIG_CONTEXT_KEY } from './constants';
import { useConfigController } from './useConfigController';
import componentAvailabilityErrors from '../../session/utils/sessionAwareComponentAvailability/helpers/componentAvailabilityErrors';
import ErrorMessageDisplay from '../components/ErrorMessageDisplay/ErrorMessageDisplay.vue';
import type { TranslationKey } from '../../translations';
import type { ConfigProviderProps } from './types';
import './Spinner.scss';

const props = defineProps<ConfigProviderProps>();
const errorTitle: TranslationKey = 'common.errors.somethingWentWrong';

const errorMessages = computed<TranslationKey[]>(() => {
    // prettier-ignore
    return props.type
        ? [componentAvailabilityErrors(props.type), 'common.errors.contactSupport']
        : ['common.errors.contactSupport'];
});

const { configContextValue, hasPermission } = useConfigController({
    getSession: () => props.session,
    getType: () => props.type,
});

provide(CONFIG_CONTEXT_KEY, configContextValue);
</script>

<template>
    <ErrorMessageDisplay v-if="hasPermission === false" centered :title="errorTitle" :message="errorMessages" />
    <slot v-else-if="hasPermission === true" />
    <slot v-else name="loading">
        <div class="adyen-pe-spinner__wrapper">
            <!-- TODO: Replace with actual loading indicator -->
            <div class="adyen-pe-spinner" />
        </div>
    </slot>
</template>
