import { defineComponent, type PropType } from 'vue';
import { UIElementProvider, type CoreInstance } from '@integration-components/core/vue';
import { DefendFlowWithDelayedDisputeDetailsContent } from './DefendFlowWithDelayedDisputeDetailsContent';

export const DefendFlowWithDelayedDisputeDetails = defineComponent({
    name: 'DefendFlowWithDelayedDisputeDetails',
    components: { DefendFlowWithDelayedDisputeDetailsContent, UIElementProvider },
    inheritAttrs: false,
    props: {
        core: {
            type: Object as PropType<CoreInstance>,
            required: true,
        },
    },
    template: `
        <UIElementProvider :core="core" component-name="DisputeManagement">
            <DefendFlowWithDelayedDisputeDetailsContent />
        </UIElementProvider>
    `,
});
