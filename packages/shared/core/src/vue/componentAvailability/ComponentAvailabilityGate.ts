import { computed, defineComponent, h, type PropType } from 'vue';
import type { ExternalComponentType } from '@integration-components/types';
import { useConfigContext } from '../ConfigContext';
import { useCoreContext } from '../Context';
import { getComponentAvailabilityErrorMessages, getComponentAvailabilityErrorTitle } from '../../session/utils/sessionAwareComponentAvailability';
import { ComponentShell } from '../componentShell/ComponentShell';
import type { ErrorMessageInfo } from '../getErrorMessage';

/**
 * Withholds the slot until the component is known to be available for the current session, so an
 * unavailable component neither fetches data it has no permission for nor announces a heading for
 * content that never arrives. Until then the shell renders the loading or error state.
 */
export const ComponentAvailabilityGate = defineComponent({
    name: 'ComponentAvailabilityGate',

    props: {
        /** Component type used to resolve the domain-specific "unavailable" message. */
        type: { type: String as PropType<ExternalComponentType | undefined>, default: undefined },
        onContactSupport: { type: Function as PropType<(() => void) | undefined>, default: undefined },
    },

    setup(props, { slots }) {
        const config = useConfigContext();
        const { translationDomain } = useCoreContext();

        const errorInfo = computed<ErrorMessageInfo>(() => ({
            title: getComponentAvailabilityErrorTitle(translationDomain),
            messages: getComponentAvailabilityErrorMessages(props.type, translationDomain),
            onContactSupport: props.onContactSupport,
        }));

        return () => {
            if (config.permissionPending) return h(ComponentShell, { state: 'loading' });
            if (config.componentUnavailable) return h(ComponentShell, { state: 'error', errorInfo: errorInfo.value });
            return slots.default?.();
        };
    },
});

export default ComponentAvailabilityGate;
