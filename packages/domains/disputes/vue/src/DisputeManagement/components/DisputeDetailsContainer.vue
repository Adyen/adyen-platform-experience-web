<script setup lang="ts">
import { ref } from 'vue';
import type { IDisputeDetail } from '@integration-components/types/api/models/disputes';
import { provideDisputeFlow } from '../composables/useDisputeFlow';
import DisputeDetails from './DisputeDetails.vue';
import type { DisputeManagementProps } from '../types';
import '../styles/DisputeManagement.scss';

const props = defineProps<DisputeManagementProps>();
const dispute = ref<IDisputeDetail | undefined>();

provideDisputeFlow(dispute);
</script>

<template>
    <div class="adyen-pe-dispute__container">
        <DisputeDetails
            :id="props.id"
            :hide-title="props.hideTitle"
            :data-customization="props.dataCustomization"
            :on-contact-support="props.onContactSupport"
            :on-dispute-accept="props.onDisputeAccept"
            :on-dispute-defend="props.onDisputeDefend"
            :on-dismiss="props.onDismiss"
        />
    </div>
</template>
