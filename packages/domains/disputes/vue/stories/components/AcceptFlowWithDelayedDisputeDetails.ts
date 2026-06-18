import { defineComponent, type PropType } from 'vue';
import { UIElementProvider, type CoreInstance } from '@integration-components/core/vue';
import { AcceptFlowWithDelayedDisputeDetailsContent } from './AcceptFlowWithDelayedDisputeDetailsContent';

export const AcceptFlowWithDelayedDisputeDetails = defineComponent({
    name: 'AcceptFlowWithDelayedDisputeDetails',
    components: { AcceptFlowWithDelayedDisputeDetailsContent, UIElementProvider },
    inheritAttrs: false,
    props: {
        core: {
            type: Object as PropType<CoreInstance>,
            required: true,
        },
    },
    template: `
        <UIElementProvider :core="core" component-name="DisputeManagement">
            <AcceptFlowWithDelayedDisputeDetailsContent />
        </UIElementProvider>
    `,
});
