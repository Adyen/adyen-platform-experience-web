import { defineComponent, ref } from 'vue';
import type { IDisputeDetail } from '@integration-components/types/api/models/disputes';
import DefendDisputeFlow from '../../src/DisputeManagement/components/DefendDisputeFlow.vue';
import { provideDisputeFlow } from '../../src/DisputeManagement/composables/useDisputeFlow';
import { CHARGEBACK_DEFENDABLE } from '../../../mocks/mock-data/disputes';

export const AsyncDefendDisputeFlowContent = defineComponent({
    name: 'AsyncDefendDisputeFlowContent',
    components: { DefendDisputeFlow },
    setup() {
        const dispute = ref<IDisputeDetail | undefined>();
        const defendedDisputeId = ref('');
        const { setFlowState } = provideDisputeFlow(dispute);

        const loadDispute = () => {
            dispute.value = CHARGEBACK_DEFENDABLE;
            setFlowState('defendReasonSelectionView');
        };

        const onDisputeDefend = ({ id }: { id: string }) => {
            defendedDisputeId.value = id;
        };

        return { defendedDisputeId, loadDispute, onDisputeDefend };
    },
    template: `
        <button type="button" @click="loadDispute">Load dispute details</button>
        <DefendDisputeFlow :on-dispute-defend="onDisputeDefend" />
        <div v-if="defendedDisputeId">Defended {{ defendedDisputeId }}</div>
    `,
});
