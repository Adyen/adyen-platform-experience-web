import { defineComponent, type PropType } from 'vue';
import { UIElementProvider, type CoreInstance } from '@integration-components/core/vue';
import { AsyncDefendDisputeFlowContent } from './AsyncDefendDisputeFlowContent';

export const AsyncDefendDisputeFlow = defineComponent({
    name: 'AsyncDefendDisputeFlow',
    components: { AsyncDefendDisputeFlowContent, UIElementProvider },
    inheritAttrs: false,
    props: {
        core: {
            type: Object as PropType<CoreInstance>,
            required: true,
        },
    },
    template: `
        <UIElementProvider :core="core" component-name="DisputeManagement">
            <AsyncDefendDisputeFlowContent />
        </UIElementProvider>
    `,
});
