<script setup lang="ts">
import { computed } from 'vue';
import { BentoAlert, BentoButton } from '@adyen/bento-vue3';
import { useCoreContext } from '@integration-components/core/vue';
import type { IMissingAction } from '@integration-components/types';
import { GRANT_ACTION_CONFIGS } from '../../../../../domain/src/CapitalOverview/constants';
import { useActionsAlertTitles } from '../../composables/useActionsAlertTitles';
import { useHostedAction } from '../../composables/useHostedAction';
import styles from './GrantActionsHosted.module.scss';

const props = defineProps<{
    className?: string;
    expirationDate?: string;
    missingActions: IMissingAction[];
}>();

const { i18n, refreshComponent } = useCoreContext();
const { error, handleActionClick, loadingAction } = useHostedAction();

const alertTitles = useActionsAlertTitles(() => props.expirationDate);
const alertTitle = computed(() => (props.missingActions.length > 1 ? alertTitles.value.multiple : alertTitles.value.single));
</script>

<template>
    <BentoAlert v-if="error" :class="props.className" type="critical">
        {{ i18n.get('capital.overview.grants.item.alerts.somethingWentWrong') }}
        <template #actions>
            <BentoButton :class="styles.button" @click="refreshComponent">
                {{ i18n.get('common.actions.refresh.labels.default') }}
            </BentoButton>
        </template>
    </BentoAlert>

    <BentoAlert v-else :class="props.className" type="warning">
        {{ alertTitle }}
        <template #description>
            <ol v-if="props.missingActions.length > 1" :class="styles.actionsContainer">
                <li v-for="action in props.missingActions" :key="action.type">
                    <BentoButton
                        :class="styles.button"
                        variant="tertiary"
                        :aria-label="i18n.get(GRANT_ACTION_CONFIGS[action.type].buttonLabelKey)"
                        :disabled="!!loadingAction"
                        :state="loadingAction === action.type ? 'loading' : undefined"
                        @click="handleActionClick(action.type)"
                    >
                        {{ i18n.get(GRANT_ACTION_CONFIGS[action.type].buttonLabelKey) }}
                    </BentoButton>
                </li>
            </ol>
            <BentoButton
                v-else
                :class="styles.button"
                variant="tertiary"
                :aria-label="i18n.get(GRANT_ACTION_CONFIGS[props.missingActions[0]!.type].buttonLabelKey)"
                :disabled="!!loadingAction"
                :state="loadingAction === props.missingActions[0]?.type ? 'loading' : undefined"
                @click="handleActionClick(props.missingActions[0]!.type)"
            >
                {{ i18n.get(GRANT_ACTION_CONFIGS[props.missingActions[0]!.type].buttonLabelKey) }}
            </BentoButton>
        </template>
    </BentoAlert>
</template>
