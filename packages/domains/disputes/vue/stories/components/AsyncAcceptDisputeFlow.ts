import { defineComponent, type PropType } from 'vue';
import { UIElementProvider, type CoreInstance } from '@integration-components/core/vue';
import { AsyncAcceptDisputeFlowContent } from './AsyncAcceptDisputeFlowContent';

export const AsyncAcceptDisputeFlow = defineComponent({
    name: 'AsyncAcceptDisputeFlow',
    components: { AsyncAcceptDisputeFlowContent, UIElementProvider },
    inheritAttrs: false,
    props: {
        core: {
            type: Object as PropType<CoreInstance>,
            required: true,
        },
    },
    template: `
        <UIElementProvider :core="core" component-name="DisputeManagement">
            <AsyncAcceptDisputeFlowContent />
        </UIElementProvider>
    `,
});
