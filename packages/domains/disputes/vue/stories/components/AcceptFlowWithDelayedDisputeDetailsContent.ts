import { defineComponent, ref } from 'vue';
import type { IDisputeDetail } from '@integration-components/types/api/models/disputes';
import AcceptDisputeFlow from '../../src/DisputeManagement/components/AcceptDisputeFlow.vue';
import { provideDisputeFlow } from '../../src/DisputeManagement/composables/useDisputeFlow';
import { RFI_ACCEPTABLE } from '../../../mocks/mock-data/disputes';

export const AcceptFlowWithDelayedDisputeDetailsContent = defineComponent({
    name: 'AcceptFlowWithDelayedDisputeDetailsContent',
    components: { AcceptDisputeFlow },
    setup() {
        const dispute = ref<IDisputeDetail | undefined>();
        const acceptedDisputeId = ref('');

        provideDisputeFlow(dispute);

        const loadDispute = () => {
            dispute.value = RFI_ACCEPTABLE;
        };

        const onDisputeAccept = ({ id }: { id: string }) => {
            acceptedDisputeId.value = id;
        };

        return { acceptedDisputeId, loadDispute, onDisputeAccept };
    },
    template: `
        <button type="button" @click="loadDispute">Load dispute details</button>
        <AcceptDisputeFlow :on-dispute-accept="onDisputeAccept" />
        <div v-if="acceptedDisputeId">Accepted {{ acceptedDisputeId }}</div>
    `,
});
