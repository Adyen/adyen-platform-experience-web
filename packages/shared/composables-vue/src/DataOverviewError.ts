import { computed, defineComponent, h, type Component, type PropType, type VNode } from 'vue';
import { BentoEmptyState } from '@adyen/bento-vue3';
import {
    getSafeDomainTranslationKey,
    useCoreContext,
    useShouldHideIllustrations,
    type ErrorMessageInfo,
    useConfigContext,
} from '@integration-components/core/vue';
import { useLiveAnnouncement } from './useLiveAnnouncement';
import { LiveAnnouncement } from './LiveAnnouncement';

export const DataOverviewError = defineComponent({
    name: 'DataOverviewError',

    props: {
        errorInfo: { type: Object as PropType<ErrorMessageInfo>, required: true },
        variant: { type: String as PropType<'embedded' | 'condensed'>, default: 'embedded' },
        image: { type: String as PropType<'wrong-environment' | 'no-results-found'>, default: 'wrong-environment' },
        refreshIcon: { type: [Object, Function] as PropType<Component>, default: undefined },
        /**
         * Re-fetches the data the error state belongs to. Falls back to remounting the component, which resets its filters.
         * A config/session error also forces the remount fallback, so the session can be re-established.
         */
        onRefresh: { type: Function as PropType<(() => void) | undefined>, default: undefined },
    },

    setup(props) {
        const { i18n, refreshComponent: refreshCurrentComponent, translationDomain } = useCoreContext();
        const configContext = useConfigContext();
        const { announcement } = useLiveAnnouncement();
        const hideIllustrations = useShouldHideIllustrations();

        const errorInfo = computed(() => props.errorInfo);

        const title = computed(() => (errorInfo.value.title ? i18n.get(errorInfo.value.title) : undefined));

        const description = computed(() => {
            const { messages, requestId } = errorInfo.value;
            const options = requestId ? { values: { requestId } } : undefined;
            const nodes: VNode[] = [];

            messages.forEach((key, index) => {
                if (index > 0) nodes.push(h('br'));
                nodes.push(h('span', { key }, i18n.get(key, options)));
            });

            nodes.push(h(LiveAnnouncement, { message: announcement.value }));

            return nodes;
        });

        const action = computed<
            | {
                  title: string;
                  event: () => void;
                  icon?: Component;
                  variant: 'primary';
              }
            | undefined
        >(() => {
            const { onContactSupport, refreshComponent } = errorInfo.value;

            if (onContactSupport) {
                return {
                    title: i18n.get(getSafeDomainTranslationKey(translationDomain, 'common.contactSupport.label')),
                    event: onContactSupport,
                    variant: 'primary' as const,
                };
            }

            if (refreshComponent) {
                return {
                    title: i18n.get(getSafeDomainTranslationKey(translationDomain, 'common.refresh.label')),
                    event: () => (configContext.hasError || !props.onRefresh ? refreshCurrentComponent : props.onRefresh)?.(),
                    icon: props.refreshIcon,
                    variant: 'primary' as const,
                };
            }

            return undefined;
        });

        return () =>
            h(
                BentoEmptyState,
                {
                    image: hideIllustrations.value ? undefined : props.image,
                    variant: props.variant,
                    title: title.value,
                    action: action.value,
                },
                { default: () => description.value }
            );
    },
});

export default DataOverviewError;
